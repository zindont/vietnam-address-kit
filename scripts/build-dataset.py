#!/usr/bin/env python3
"""
build:data — Generate the official vn-address-kit dataset from the authoritative
conversion table (QĐ 19/2025/QĐ-TTg). See docs/adr/0001 and docs/adr/0002.

Source : data/source/conversion-table.xlsx  (sheet "Tổng hợp_không merge", flat 1-row-per-edge)
Output : src/data/official/{current-provinces,current-wards,legacy-provinces,
         legacy-districts,legacy-wards,mappings}.json

Runtime never touches this script or the xlsx; only the generated JSON is read.
Requires (dev only): pip install openpyxl
"""
import json
import re
import sys
import unicodedata
from collections import OrderedDict, defaultdict
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "data" / "source" / "conversion-table.xlsx"
OUT = ROOT / "src" / "data" / "official"
SHEET = "Tổng hợp_không merge "  # trailing space is intentional (matches the file)

# Official totals to reconcile against (QĐ 19/2025/QĐ-TTg + reform figures).
EXPECT = {"new_provinces": 34, "new_wards": 3321, "old_provinces": 63}

# ---------------------------------------------------------------------------
# Text helpers
# ---------------------------------------------------------------------------

def strip_tones(s: str) -> str:
    s = s.replace("đ", "d").replace("Đ", "D")
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return s


def normalized(name: str) -> str:
    return re.sub(r"\s+", " ", strip_tones(name).lower()).strip()


def slugify(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", strip_tones(name).lower()).strip("-")


def clean(s) -> str:
    # Source cells mix NFC/NFD (e.g. "phường" with a combining grave); normalize to NFC
    # so prefix matching and JSON output are consistent.
    if s is None:
        return ""
    return re.sub(r"\s+", " ", unicodedata.normalize("NFC", str(s))).strip()


def split_code(cell: str):
    """'Thành phố Hà Nội (01)' -> ('01', 'Thành phố Hà Nội'); 'Phường Ba Đình' -> (None, ...)."""
    cell = clean(cell)
    m = re.search(r"\((\d+)\)\s*$", cell)
    code = m.group(1) if m else None
    label = re.sub(r"\s*\(\d+\)\s*$", "", cell).strip()
    return code, label


# prefix -> canonical type, per administrative level
PROVINCE_TYPES = [("Thành phố", "city"), ("Tỉnh", "province")]
DISTRICT_TYPES = [
    ("Quận", "urban_district"), ("Huyện", "district"),
    ("Thị xã", "town"), ("Thành phố", "city"),
]
NEW_WARD_TYPES = [("Phường", "ward"), ("Xã", "commune"), ("Đặc khu", "special_zone")]
LEGACY_WARD_TYPES = [("Phường", "ward"), ("Xã", "commune"), ("Thị trấn", "town")]


def parse_unit(label: str, type_table, default_type):
    """Return (name, type, nameWithType). Prefix match is case-insensitive (source data
    mixes 'Phường'/'phường'); nameWithType is canonicalized to the proper-cased prefix.
    Numbered units (Quận 1) keep the prefix in the name."""
    label = clean(label)
    low = label.lower()
    for prefix, t in type_table:
        if low.startswith(prefix.lower() + " "):
            rest = label[len(prefix) + 1:].strip()
            if re.fullmatch(r"\d+", rest):       # 'Quận 1', 'Phường 12' -> keep full label
                return label, t, f"{prefix} {rest}"
            return rest, t, f"{prefix} {rest}"
    return label, default_type, label


# ---------------------------------------------------------------------------
# Type taxonomy (Ghi chú -> MappingType) — see docs/adr/0002
# ---------------------------------------------------------------------------

def classify(note: str, fan_out: int, prov_changed: bool) -> str:
    n = normalized(note)
    if "toan bo dan so" in n:
        return "split_population"
    if "giu nguyen" in n:
        return "province_changed" if prov_changed else "unchanged"
    if "doi ten" in n and "mot phan" not in n:
        return "renamed"
    if "mot phan" in n:
        # split: same old ward feeds >1 new ward (area-only partials)
        return "ambiguous" if fan_out > 1 else "renamed"
    if "nhap toan bo" in n or "sap xep toan bo" in n:
        return "province_changed" if prov_changed else "merged"
    return "province_changed" if prov_changed else "merged"


# ---------------------------------------------------------------------------
# Former names (pre-2025 predecessors) — see docs/adr/0003
# ---------------------------------------------------------------------------

DOI_CHIEU = ROOT / "data" / "source" / "doi-chieu-2024-09-01.xls"


def bare(label: str) -> str:
    """'phường Phước Tiến' -> 'phuoc tien' (strip admin prefix, drop tones)."""
    name, _t, _nwt = parse_unit(clean(label), LEGACY_WARD_TYPES, "ward")
    return normalized(name)


def bare_name(label: str) -> str:
    name, _t, _nwt = parse_unit(clean(label), LEGACY_WARD_TYPES, "ward")
    return name


def attach_former_names(leg_ward, mappings):
    """Read the 01/09/2024→01/07/2025 đối chiếu table and attach DETERMINISTIC
    predecessors (e.g. Phước Tiến) as formerNames of the surviving legacy ward.
    Returns (attached, skipped). Requires xlrd (dev-only)."""
    if not DOI_CHIEU.exists():
        print("  (skip formerNames: doi-chieu source not found)")
        return 0, 0
    import xlrd  # dev-only, .xls reader
    sh = xlrd.open_workbook(DOI_CHIEU).sheet_by_index(0)

    # survivor legacy ward -> the 2025 new ward it effectively resolves to (population edge wins)
    sv_edges = defaultdict(list)
    for m in mappings:
        if m.get("oldWardCode"):
            sv_edges[(m["oldProvinceCode"], m["oldWardCode"])].append((m["newWardCode"], m["type"]))

    def effective_new_wards(prov, code):
        edges = sv_edges.get((prov, code), [])
        pops = [nw for nw, t in edges if t == "split_population"]
        if len(edges) > 1 and len(pops) == 1:
            return set(pops)
        return {nw for nw, _t in edges}

    prefix_to_type = {"phường": "ward", "xã": "commune", "thị trấn": "town", "đặc khu": "special_zone"}
    by_code = {(w["provinceCode"], w["code"]) for w in leg_ward.values()}
    name_index = defaultdict(list)            # (prov, bareNorm) -> [code,...]
    name_index_typed = defaultdict(list)      # (prov, type, bareNorm) -> [code,...] (disambiguates phường vs xã)
    for w in leg_ward.values():
        name_index[(w["provinceCode"], bare(w["name"]))].append(w["code"])
        name_index_typed[(w["provinceCode"], w["type"], bare(w["name"]))].append(w["code"])

    def lookup(prov, ptype, name_text):
        """Resolve a successor name to a single code; prefer the typed (phường/xã) match."""
        bn = bare(name_text)
        if ptype:
            hits = name_index_typed.get((prov, prefix_to_type.get(ptype, ptype), bn), [])
            if len(hits) == 1:
                return hits[0]
        hits = name_index.get((prov, bn), [])
        return hits[0] if len(hits) == 1 else None

    def cell(r, c):
        return clean(sh.cell_value(r, c))

    # gather candidate (survivorCode, formerName) attachments, then drop ambiguous ones
    cand = []                                 # (prov, survivorCode, formerNameDict, bareNorm)
    re_dec = re.compile(r"(\d{3,4}/NQ-UBTVQH15)")
    # "...vào phường X." (destination of a whole merge) — capture prefix + name up to punctuation
    re_into = re.compile(r"vào\s+(phường|xã|thị trấn|đặc khu)\s+([^.,;]+)")
    re_form = re.compile(r"[Tt]hành lập\s+(phường|xã|thị trấn|đặc khu)\s+(.+?)\s+trên cơ sở")
    for r in range(1, sh.nrows):
        prov, code, name, note = cell(r, 0), cell(r, 2), cell(r, 3), cell(r, 12)
        if not (prov and code and name):
            continue
        code5 = code.zfill(5) if code.isdigit() else code
        bn = bare(name)
        survivor = None
        if (prov, code5) in by_code:          # code survived; predecessor only if the name changed
            cur = leg_ward.get(code5)
            if cur and bare(cur["name"]) == bn:
                continue                       # identical ward, not a predecessor
            survivor = code5
        else:                                  # retired code → resolve survivor via the note
            note_n = normalized(note)
            mform = re_form.search(note)
            if mform:                          # "Thành lập phường Y trên cơ sở nhập …"
                survivor = lookup(prov, mform.group(1), mform.group(2))
            elif "mot phan" not in note_n and "dieu chinh" not in note_n:
                mint = re_into.search(note)    # "Nhập toàn bộ … vào phường X." (whole merge only)
                if mint:
                    survivor = lookup(prov, mint.group(1), mint.group(2))
        if not survivor:
            continue
        sw = leg_ward.get(survivor)
        if not sw or bn == bare(sw["name"]):
            continue
        former = {"name": bare_name(name), "normalizedName": bn}
        former["code"] = code5
        mdec = re_dec.search(note)
        if mdec:
            former["decree"] = mdec.group(1)
        cand.append((prov, survivor, former, bn))

    # determinism gate: a former name is ambiguous only if, within the SAME
    # (province, successor-district), it leads to >1 distinct 2025 NEW ward. Same old name in
    # different districts (HCMC "Phường 7") is fine (engine filters by district at query time);
    # and two survivors that both resolve to the SAME new ward (e.g. thị trấn + xã "Mađaguôi" →
    # "Đạ Huoai") are not ambiguous for conversion — the engine dedups them.
    def survivor_dist(code):
        return leg_ward[code].get("districtCode", "")

    survivors_of = defaultdict(set)            # (prov, dist, bn) -> {survivor code}
    newwards_of = defaultdict(set)             # (prov, dist, bn) -> {resolved new ward code}
    for prov, survivor, _f, bn in cand:
        k = (prov, survivor_dist(survivor), bn)
        survivors_of[k].add(survivor)
        newwards_of[k] |= effective_new_wards(prov, survivor)

    def is_ambiguous(k):
        # ambiguous only if the name spans >1 distinct survivor AND those lead to different new wards
        return len(survivors_of[k]) > 1 and len(newwards_of[k]) > 1

    attached = skipped = 0
    seen = set()
    for prov, survivor, former, bn in cand:
        if is_ambiguous((prov, survivor_dist(survivor), bn)):
            skipped += 1
            continue
        key = (survivor, former["normalizedName"])
        if key in seen:
            continue
        seen.add(key)
        leg_ward[survivor].setdefault("formerNames", []).append(former)
        attached += 1
    return attached, skipped


# ---------------------------------------------------------------------------
# Build
# ---------------------------------------------------------------------------

def main() -> int:
    if not SRC.exists():
        sys.exit(f"source not found: {SRC}")
    wb = openpyxl.load_workbook(SRC, read_only=True, data_only=True)
    ws = wb[SHEET]

    cur_prov = OrderedDict()   # code -> record
    cur_ward = OrderedDict()   # newWardCode -> record
    leg_prov = OrderedDict()
    leg_dist = OrderedDict()   # (provCode, distCode) -> record
    leg_ward = OrderedDict()   # oldWardCode -> record
    raw_edges = []             # (oldProv, oldDist, oldWard, newProv, newWard, note)

    fan_out = defaultdict(set)  # oldWardCode -> {newWardCode}

    for row in ws.iter_rows(min_row=3, values_only=True):
        A, B, C, D, E, F, G, H = (row[i] if i < len(row) else None for i in range(8))
        # section header rows (only the province column is filled)
        if A and not any([B, C, D, E]):
            continue
        new_ward_code = clean(C)
        old_ward_code = clean(E)
        # A new ward must have a code; the old WARD code may be absent when an entire
        # legacy district converts directly into a special zone (đặc khu) — those map
        # at the district level (oldWardCode omitted). See docs/adr/0001.
        if not new_ward_code:
            continue
        new_ward_code = new_ward_code.zfill(5)
        old_ward_code = old_ward_code.zfill(5) if old_ward_code else ""

        np_code, np_label = split_code(A)
        op_code, op_label = split_code(H)
        od_code, od_label = split_code(G)
        np_code = (np_code or "").zfill(2) if np_code else ""
        op_code = (op_code or "").zfill(2) if op_code else ""
        od_code = (od_code or "").zfill(3) if od_code else ""

        # current province
        if np_code and np_code not in cur_prov:
            name, t, nwt = parse_unit(np_label, PROVINCE_TYPES, "province")
            cur_prov[np_code] = {"code": np_code, "name": name, "type": t,
                                 "nameWithType": nwt, "slug": slugify(name),
                                 "normalizedName": normalized(name)}
        # current ward
        if new_ward_code not in cur_ward:
            name, t, nwt = parse_unit(clean(B), NEW_WARD_TYPES, "ward")
            cur_ward[new_ward_code] = {"code": new_ward_code, "name": name, "type": t,
                                       "nameWithType": nwt, "provinceCode": np_code,
                                       "slug": slugify(name), "normalizedName": normalized(name)}
        # legacy province
        if op_code and op_code not in leg_prov:
            name, t, nwt = parse_unit(op_label, PROVINCE_TYPES, "province")
            leg_prov[op_code] = {"code": op_code, "name": name, "type": t,
                                 "nameWithType": nwt, "slug": slugify(name),
                                 "normalizedName": normalized(name)}
        # legacy district
        if od_code and (op_code, od_code) not in leg_dist:
            name, t, nwt = parse_unit(od_label, DISTRICT_TYPES, "district")
            leg_dist[(op_code, od_code)] = {"code": od_code, "name": name, "type": t,
                                            "nameWithType": nwt, "provinceCode": op_code,
                                            "slug": slugify(name), "normalizedName": normalized(name)}
        # legacy ward (only when the row carries one; district-level conversions skip this)
        if old_ward_code and old_ward_code not in leg_ward:
            name, t, nwt = parse_unit(clean(D), LEGACY_WARD_TYPES, "ward")
            leg_ward[old_ward_code] = {"code": old_ward_code, "name": name, "type": t,
                                       "nameWithType": nwt, "districtCode": od_code,
                                       "provinceCode": op_code, "slug": slugify(name),
                                       "normalizedName": normalized(name)}

        raw_edges.append((op_code, od_code, old_ward_code, np_code, new_ward_code, clean(F)))
        if old_ward_code:
            fan_out[old_ward_code].add(new_ward_code)

    # mappings (dedup identical edges)
    seen = set()
    mappings = []
    for op, od, ow, np_, nw, note in raw_edges:
        key = (op, od, ow, np_, nw)
        if key in seen:
            continue
        seen.add(key)
        mtype = classify(note, len(fan_out[ow]) if ow else 1, op != np_ and op != "")
        m = {"oldProvinceCode": op, "newProvinceCode": np_, "newWardCode": nw, "type": mtype}
        if od:
            m["oldDistrictCode"] = od
        if ow:
            m["oldWardCode"] = ow
        if note:
            m["note"] = note
        mappings.append(m)

    # attach pre-2025 former names (Phước Tiến → Tân Tiến, …) to surviving legacy wards
    former_attached, former_skipped = attach_former_names(leg_ward, mappings)

    datasets = {
        "current-provinces": list(cur_prov.values()),
        "current-wards": list(cur_ward.values()),
        "legacy-provinces": list(leg_prov.values()),
        "legacy-districts": list(leg_dist.values()),
        "legacy-wards": list(leg_ward.values()),
        "mappings": mappings,
    }

    # ---- validation gate (docs/adr/0001 step 6) ----
    errors, warnings = [], []
    if len(cur_prov) != EXPECT["new_provinces"]:
        errors.append(f"new provinces = {len(cur_prov)}, expected {EXPECT['new_provinces']}")
    if len(leg_prov) != EXPECT["old_provinces"]:
        warnings.append(f"old provinces = {len(leg_prov)}, expected {EXPECT['old_provinces']}")
    if len(cur_ward) != EXPECT["new_wards"]:
        warnings.append(f"new wards = {len(cur_ward)}, expected {EXPECT['new_wards']} "
                        f"(delta {len(cur_ward) - EXPECT['new_wards']})")
    # referential integrity
    orphan_new = {m["newWardCode"] for m in mappings if m["newWardCode"] not in cur_ward}
    orphan_old = {m["oldWardCode"] for m in mappings
                  if "oldWardCode" in m and m["oldWardCode"] not in leg_ward}
    if orphan_new:
        errors.append(f"{len(orphan_new)} mapping(s) reference unknown new ward")
    if orphan_old:
        errors.append(f"{len(orphan_old)} mapping(s) reference unknown old ward")
    no_edge = [c for c in leg_ward if c not in fan_out]
    if no_edge:
        errors.append(f"{len(no_edge)} legacy ward(s) without a mapping edge")

    OUT.mkdir(parents=True, exist_ok=True)
    for name, data in datasets.items():
        (OUT / f"{name}.json").write_text(
            json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    # report
    print("=== dataset built ===")
    for name, data in datasets.items():
        print(f"  {name:18s} {len(data):6d}")
    from collections import Counter
    print("  new ward types:", dict(Counter(w["type"] for w in cur_ward.values())))
    print("  mapping types:", dict(Counter(m["type"] for m in mappings)))
    print(f"  split_population wards: {sum(1 for m in mappings if m['type']=='split_population')}")
    total_former = sum(len(w.get("formerNames", [])) for w in leg_ward.values())
    print(f"  formerNames attached: {total_former} (on {sum(1 for w in leg_ward.values() if w.get('formerNames'))} wards) | skipped ambiguous: {former_skipped}")
    if warnings:
        print("\n--- WARNINGS (reconcile) ---")
        for w in warnings:
            print("  ⚠", w)
    if errors:
        print("\n--- ERRORS (hard fail) ---")
        for e in errors:
            print("  ✗", e)
        return 1
    print("\n✓ structural invariants passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
