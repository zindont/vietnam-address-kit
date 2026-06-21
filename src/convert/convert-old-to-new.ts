import { getLegacyDistricts, getLegacyProvinces, getLegacyWards, getMappings, getProvinceByCode, getWardByCode } from "../data/loader";
import { convertAddressText } from "./convert-address-text";
import { normalizeText } from "../normalize/normalize-text";
import type { StructuredOldAddressInput } from "../types/address";
import type { AddressMapping, LegacyDistrict, LegacyFormerName, LegacyProvince, LegacyWard } from "../types/data";
import type { BatchConversionResult, ConversionCandidate, ConversionResult, MatchStrategy } from "../types/result";
import { calculateConfidence } from "./confidence";

const WARD_PREFIX_RE = /^(phuong|xa|thi tran|dac khu)\s+/;

/** Find the former name a ward keyword refers to. Former names are stored without an
 * administrative prefix, so we also try the keyword with its prefix stripped (e.g. an
 * input "P Phuoc Tien" → "phuong phuoc tien" → "phuoc tien"). */
function findFormerName(formerNames: LegacyFormerName[] | undefined, normalizedKeyword: string): LegacyFormerName | undefined {
  if (!formerNames) return undefined;
  const bare = normalizedKeyword.replace(WARD_PREFIX_RE, "");
  return formerNames.find((former) => former.normalizedName === normalizedKeyword || former.normalizedName === bare);
}

function findBest<T extends { name: string; nameWithType: string; normalizedName: string }>(keyword: string | undefined, units: T[]): T[] {
  if (!keyword) return [];
  const normalized = normalizeText(keyword);
  const exact = units.filter(
    (unit) =>
      normalizeText(unit.name) === normalized ||
      normalizeText(unit.nameWithType) === normalized ||
      normalizeText(unit.normalizedName) === normalized ||
      Boolean(findFormerName((unit as { formerNames?: Array<{ name: string; normalizedName: string }> }).formerNames, normalized))
  );
  if (exact.length > 0) return exact;
  return units.filter((unit) => normalizeText(unit.name).includes(normalized) || normalizeText(unit.nameWithType).includes(normalized));
}

function mappingToCandidate(mapping: AddressMapping, confidence: number, strategy: MatchStrategy, reason: string): ConversionCandidate | undefined {
  const province = getProvinceByCode(mapping.newProvinceCode);
  const ward = getWardByCode(mapping.newWardCode);
  if (!province || !ward) return undefined;
  return {
    newProvinceCode: province.code,
    newProvinceName: province.name,
    newWardCode: ward.code,
    newWardName: ward.name,
    confidence,
    strategy,
    reason
  };
}

function fail(input: StructuredOldAddressInput, warnings: string[], candidates: ConversionCandidate[] = [], oldAddress: ConversionResult["oldAddress"] = {}): ConversionResult {
  return {
    success: false,
    input,
    streetAddress: input.streetAddress,
    oldAddress,
    confidence: candidates.length > 0 ? Math.max(...candidates.map((candidate) => candidate.confidence)) : 0,
    strategy: candidates.length > 0 ? "candidate_suggestion" : "failed",
    warnings,
    candidates
  };
}

export function convertOldToNew(input: StructuredOldAddressInput): ConversionResult {
  const warnings: string[] = [];
  const provinceMatches = findBest<LegacyProvince>(input.province, getLegacyProvinces());
  if (provinceMatches.length === 0) {
    return fail(input, ["Legacy province could not be matched."]);
  }
  if (provinceMatches.length > 1) warnings.push("Multiple legacy provinces matched; using candidates only.");

  const candidates: ConversionCandidate[] = [];
  let bestOldAddress: ConversionResult["oldAddress"] = {};

  for (const province of provinceMatches) {
    const districtPool = getLegacyDistricts().filter((district) => district.provinceCode === province.code);
    const districtMatches = findBest<LegacyDistrict>(input.district, districtPool);
    const districtCandidates = districtMatches.length > 0 ? districtMatches : districtPool;

    for (const district of districtCandidates) {
      const wardPool = getLegacyWards().filter((ward) => ward.provinceCode === province.code && ward.districtCode === district.code);
      const wardMatches = findBest<LegacyWard>(input.ward, wardPool);
      if (input.ward && wardMatches.length === 0) continue;
      const wardCandidates = wardMatches.length > 0 ? wardMatches : [];

      for (const ward of wardCandidates) {
        // A split old ward has several mapping edges (one per successor new ward),
        // so collect them all — never just the first.
        const wardMappings = getMappings().filter(
          (item) => item.oldProvinceCode === province.code && item.oldDistrictCode === district.code && item.oldWardCode === ward.code
        );
        if (wardMappings.length === 0) continue;
        bestOldAddress = {
          provinceCode: province.code,
          provinceName: province.name,
          districtCode: district.code,
          districtName: district.name,
          wardCode: ward.code,
          wardName: ward.name
        };

        // Did the address match a pre-2025 former name rather than the ward's current name?
        const matchedFormer = input.ward ? findFormerName(ward.formerNames, normalizeText(input.ward)) : undefined;
        if (matchedFormer) {
          warnings.push(`Ward "${matchedFormer.name}" was retired${matchedFormer.since ? ` on ${matchedFormer.since}` : ""}; resolved via its successor "${ward.name}".`);
        }

        // docs/adr/0002: when an old ward is split but exactly one successor takes the
        // *entire population* ("toàn bộ dân số"), an address resolves there deterministically.
        const populationEdges = wardMappings.filter((mapping) => mapping.type === "split_population");
        if (wardMappings.length > 1 && populationEdges.length === 1) {
          const populationEdge = populationEdges[0]!;
          const confidence = calculateConfidence("split_population", 1);
          const candidate = mappingToCandidate(populationEdge, confidence, "split_population", "Old ward split; population assigned to this new ward.");
          if (candidate) {
            candidates.push(candidate);
            const others = wardMappings
              .filter((mapping) => mapping !== populationEdge)
              .map((mapping) => getWardByCode(mapping.newWardCode)?.name)
              .filter((name): name is string => Boolean(name));
            if (others.length > 0) warnings.push(`Old ward "${ward.name}" was split; its population moved to "${candidate.newWardName}". Area-only successors: ${others.join(", ")}.`);
          }
          continue;
        }

        const strategy: MatchStrategy = matchedFormer
          ? "former_ward"
          : input.district
            ? "old_ward_district_province_exact"
            : "old_ward_province_exact";
        for (const mapping of wardMappings) {
          const confidence = calculateConfidence(strategy, wardMappings.length);
          const reason = matchedFormer ? `Matched former ward name "${matchedFormer.name}" (${mapping.type}).` : `Matched official mapping (${mapping.type}).`;
          const candidate = mappingToCandidate(mapping, confidence, strategy, reason);
          if (candidate) candidates.push(candidate);
        }
      }
    }
  }

  if (candidates.length === 0) {
    const province = provinceMatches[0];
    // Many old wards merge into the same new ward, so dedupe by destination new ward —
    // otherwise the province-level fallback emits thousands of duplicate suggestions.
    const fallbackMappings = province ? getMappings().filter((mapping) => mapping.oldProvinceCode === province.code) : [];
    const uniqueNewWards = Array.from(new Map(fallbackMappings.map((mapping) => [`${mapping.newProvinceCode}:${mapping.newWardCode}`, mapping])).values());
    const fallbackCandidates = uniqueNewWards
      .map((mapping) => mappingToCandidate(mapping, calculateConfidence("candidate_suggestion", uniqueNewWards.length), "candidate_suggestion", "Province matched, but district/ward did not match exactly."))
      .filter((candidate): candidate is ConversionCandidate => Boolean(candidate))
      .sort((a, b) => a.newWardName.localeCompare(b.newWardName, "vi"));
    return fail(input, ["No exact legacy ward mapping was found."], fallbackCandidates, { provinceCode: province?.code, provinceName: province?.name });
  }

  const uniqueCandidates = Array.from(new Map(candidates.map((candidate) => [`${candidate.newProvinceCode}:${candidate.newWardCode}`, candidate])).values());
  if (uniqueCandidates.length !== 1) {
    return fail(input, ["Address is ambiguous; multiple candidate mappings were found."], uniqueCandidates, bestOldAddress);
  }

  const candidate = uniqueCandidates[0]!;
  return {
    success: true,
    input,
    streetAddress: input.streetAddress,
    oldAddress: bestOldAddress,
    newAddress: {
      provinceCode: candidate.newProvinceCode,
      provinceName: candidate.newProvinceName,
      wardCode: candidate.newWardCode,
      wardName: candidate.newWardName
    },
    confidence: candidate.confidence,
    strategy: candidate.strategy,
    warnings,
    candidates: []
  };
}

export function convertBatch(items: Array<string | StructuredOldAddressInput>): BatchConversionResult {
  const results = items.map((item) => typeof item === "string" ? convertAddressText(item) : convertOldToNew(item));
  const matched = results.filter((result) => result.success).length;
  const ambiguous = results.filter((result) => !result.success && result.candidates.length > 0).length;
  const failed = results.length - matched - ambiguous;
  const averageConfidence = results.length === 0 ? 0 : results.reduce((sum, result) => sum + result.confidence, 0) / results.length;
  return { total: results.length, matched, ambiguous, failed, averageConfidence, results };
}

