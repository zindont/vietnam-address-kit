import {
  convertAddressText,
  convertOldToNew,
  getDataVersion,
  getProvinces,
  getWards,
  getWardsByProvince,
  searchProvince,
  searchWard,
  validateHierarchy,
  type ConversionResult,
  type StructuredOldAddressInput
} from "vn-address-kit";
import "./styles.css";

const dataVersion = getDataVersion();
const provinces = getProvinces();
const wards = getWards();

const textSamples = [
  {
    label: "Official exact",
    value: "123 Lê Lợi, Phường Vĩnh Hòa, TP Nha Trang, Khánh Hòa"
  },
  {
    label: "No diacritics",
    value: "123 Le Loi, P Vinh Hoa, TP Nha Trang, Khanh Hoa"
  },
  {
    label: "Former ward",
    value: "25 Yersin, Phường Phước Tiến, TP Nha Trang, Khánh Hòa"
  },
  {
    label: "Ambiguous split",
    value: "1 Kim Mã, Phường Ngọc Hà, Quận Ba Đình, Hà Nội"
  }
];

const structuredSamples: Array<StructuredOldAddressInput & { label: string }> = [
  {
    label: "Nha Trang legacy ward",
    province: "Khánh Hòa",
    district: "Nha Trang",
    ward: "Vĩnh Hòa",
    streetAddress: "123 Lê Lợi"
  },
  {
    label: "Former ward name",
    province: "Khánh Hòa",
    district: "Nha Trang",
    ward: "Phước Tiến",
    streetAddress: "25 Yersin"
  },
  {
    label: "Population split",
    province: "Hà Nội",
    district: "Tây Hồ",
    ward: "Thụy Khuê",
    streetAddress: "10 Thanh Niên"
  }
];

function appHtml(): string {
  return `
    <header class="hero">
      <div class="hero-inner">
        <div class="hero-content">
          <p class="eyebrow">Interactive browser playground</p>
          <h1>vn-address-kit</h1>
          <p class="hero-copy">
            Try Vietnam administrative address conversion, search, validation, confidence scoring,
            warnings, and candidates using the bundled official 2025 two-level dataset.
          </p>
          <div class="hero-actions">
            <a class="button button-primary" href="https://www.npmjs.com/package/vn-address-kit" target="_blank" rel="noreferrer">npm package</a>
            <a class="button" href="https://github.com/zindont/vn-address-kit" target="_blank" rel="noreferrer">GitHub</a>
          </div>
        </div>
        <aside class="data-card" aria-label="Dataset summary">
          <span class="badge">${dataVersion.sample ? "sample" : "official"}</span>
          <strong>${dataVersion.version}</strong>
          <span>${provinces.length.toLocaleString()} provinces/cities</span>
          <span>${wards.length.toLocaleString()} wards/communes/special zones</span>
          <small>Verify legally critical workflows against official state sources.</small>
        </aside>
      </div>
    </header>

    <main class="layout">
      <section class="panel panel-convert panel-wide" aria-labelledby="convert-text-title">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">Free-text conversion</p>
            <h2 id="convert-text-title">Convert address text</h2>
          </div>
          <button class="ghost" id="copy-text-json" type="button">Copy JSON</button>
        </div>
        <label for="address-text">Legacy address</label>
        <textarea id="address-text" rows="4">${textSamples[0]!.value}</textarea>
        <div class="sample-row">
          ${textSamples.map((sample, index) => `<button class="chip" data-text-sample="${index}" type="button">${sample.label}</button>`).join("")}
        </div>
        <button class="button button-primary" id="convert-text" type="button">Convert text</button>
        <div id="text-summary" class="summary"></div>
        <pre id="text-output" class="json-output" aria-live="polite"></pre>
      </section>

      <section class="panel panel-structured" aria-labelledby="structured-title">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">Structured conversion</p>
            <h2 id="structured-title">Convert fields</h2>
          </div>
          <button class="ghost" id="copy-structured-json" type="button">Copy JSON</button>
        </div>
        <div class="grid-form">
          <label>Province <input id="structured-province" value="Khánh Hòa" /></label>
          <label>District <input id="structured-district" value="Nha Trang" /></label>
          <label>Ward <input id="structured-ward" value="Vĩnh Hòa" /></label>
          <label>Street <input id="structured-street" value="123 Lê Lợi" /></label>
        </div>
        <div class="sample-row">
          ${structuredSamples.map((sample, index) => `<button class="chip" data-structured-sample="${index}" type="button">${sample.label}</button>`).join("")}
        </div>
        <button class="button button-primary" id="convert-structured" type="button">Convert fields</button>
        <pre id="structured-output" class="json-output" aria-live="polite"></pre>
      </section>

      <section class="panel panel-search" aria-labelledby="search-title">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">Lookup</p>
            <h2 id="search-title">Search units</h2>
          </div>
          <button class="ghost" id="copy-search-json" type="button">Copy JSON</button>
        </div>
        <div class="grid-form two">
          <label>Kind
            <select id="search-kind">
              <option value="province">Province</option>
              <option value="ward">Ward</option>
            </select>
          </label>
          <label>Keyword <input id="search-keyword" value="khanh hoa" /></label>
          <label class="span-two">Province filter for ward search
            <select id="search-province"></select>
          </label>
        </div>
        <div class="sample-row">
          <button class="chip" data-search-kind="province" data-search-keyword="khanh hoa" type="button">Province: khanh hoa</button>
          <button class="chip" data-search-kind="ward" data-search-keyword="bac nha trang" data-search-province="56" type="button">Ward: bac nha trang</button>
          <button class="chip" data-search-kind="ward" data-search-keyword="tan thanh" type="button">Ambiguous: tan thanh</button>
        </div>
        <button class="button button-primary" id="run-search" type="button">Search</button>
        <pre id="search-output" class="json-output" aria-live="polite"></pre>
      </section>

      <section class="panel panel-validate panel-wide" aria-labelledby="validate-title">
        <div class="panel-heading">
          <div>
            <p class="eyebrow">Validation</p>
            <h2 id="validate-title">Validate province/ward hierarchy</h2>
          </div>
          <button class="ghost" id="copy-validate-json" type="button">Copy JSON</button>
        </div>
        <div class="grid-form two">
          <label>Current province
            <select id="validate-province"></select>
          </label>
          <label>Current ward
            <select id="validate-ward"></select>
          </label>
        </div>
        <button class="button button-primary" id="run-validate" type="button">Validate hierarchy</button>
        <pre id="validate-output" class="json-output" aria-live="polite"></pre>
      </section>
    </main>
  `;
}

function element<T extends HTMLElement>(selector: string): T {
  const node = document.querySelector<T>(selector);
  if (!node) throw new Error(`Missing element: ${selector}`);
  return node;
}

function valueOf(selector: string): string {
  return element<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(selector).value.trim();
}

function setValue(selector: string, value: string | undefined): void {
  element<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(selector).value = value ?? "";
}

function renderJson(selector: string, value: unknown): void {
  element<HTMLElement>(selector).textContent = JSON.stringify(value, null, 2);
}

function copyOutput(selector: string): void {
  const text = element<HTMLElement>(selector).textContent ?? "";
  if (!text) return;
  void navigator.clipboard.writeText(text);
}

function summarize(result: ConversionResult): string {
  const status = result.success ? "success" : result.candidates.length > 0 ? "review" : "failed";
  const target = result.newAddress
    ? `${result.newAddress.wardName}, ${result.newAddress.provinceName}`
    : `${result.candidates.length} candidate(s)`;
  return `
    <span class="summary-pill ${status}">${status}</span>
    <span>confidence <strong>${result.confidence.toFixed(2)}</strong></span>
    <span>strategy <strong>${result.strategy}</strong></span>
    <span>${target}</span>
  `;
}

function populateProvinceSelect(selector: string, includeAll = false): void {
  const select = element<HTMLSelectElement>(selector);
  select.innerHTML = includeAll ? `<option value="">All provinces</option>` : "";
  for (const province of provinces) {
    const option = document.createElement("option");
    option.value = province.code;
    option.textContent = `${province.nameWithType} (${province.code})`;
    select.append(option);
  }
}

function populateWardSelect(provinceCode: string): void {
  const select = element<HTMLSelectElement>("#validate-ward");
  select.innerHTML = "";
  for (const ward of getWardsByProvince(provinceCode)) {
    const option = document.createElement("option");
    option.value = ward.code;
    option.textContent = `${ward.nameWithType} (${ward.code})`;
    select.append(option);
  }
}

function runConvertText(): void {
  const result = convertAddressText(valueOf("#address-text"));
  element<HTMLElement>("#text-summary").innerHTML = summarize(result);
  renderJson("#text-output", result);
}

function runStructured(): void {
  const result = convertOldToNew({
    province: valueOf("#structured-province"),
    district: valueOf("#structured-district"),
    ward: valueOf("#structured-ward"),
    streetAddress: valueOf("#structured-street")
  });
  renderJson("#structured-output", result);
}

function runSearch(): void {
  const kind = valueOf("#search-kind");
  const keyword = valueOf("#search-keyword");
  const provinceCode = valueOf("#search-province") || undefined;
  const results = kind === "province" ? searchProvince(keyword) : searchWard(keyword, { provinceCode });
  renderJson("#search-output", results.slice(0, 20));
}

function runValidate(): void {
  const result = validateHierarchy({
    provinceCode: valueOf("#validate-province"),
    wardCode: valueOf("#validate-ward")
  });
  renderJson("#validate-output", result);
}

function boot(): void {
  element<HTMLElement>("#app").innerHTML = appHtml();
  populateProvinceSelect("#search-province", true);
  populateProvinceSelect("#validate-province");
  setValue("#validate-province", "56");
  populateWardSelect("56");
  setValue("#validate-ward", "22333");

  element<HTMLButtonElement>("#convert-text").addEventListener("click", runConvertText);
  element<HTMLButtonElement>("#convert-structured").addEventListener("click", runStructured);
  element<HTMLButtonElement>("#run-search").addEventListener("click", runSearch);
  element<HTMLButtonElement>("#run-validate").addEventListener("click", runValidate);

  element<HTMLSelectElement>("#validate-province").addEventListener("change", (event) => {
    populateWardSelect((event.target as HTMLSelectElement).value);
  });

  for (const button of document.querySelectorAll<HTMLButtonElement>("[data-text-sample]")) {
    button.addEventListener("click", () => {
      setValue("#address-text", textSamples[Number(button.dataset.textSample)]?.value);
      runConvertText();
    });
  }

  for (const button of document.querySelectorAll<HTMLButtonElement>("[data-structured-sample]")) {
    button.addEventListener("click", () => {
      const sample = structuredSamples[Number(button.dataset.structuredSample)];
      setValue("#structured-province", sample?.province);
      setValue("#structured-district", sample?.district);
      setValue("#structured-ward", sample?.ward);
      setValue("#structured-street", sample?.streetAddress);
      runStructured();
    });
  }

  for (const button of document.querySelectorAll<HTMLButtonElement>("[data-search-kind]")) {
    button.addEventListener("click", () => {
      setValue("#search-kind", button.dataset.searchKind);
      setValue("#search-keyword", button.dataset.searchKeyword);
      setValue("#search-province", button.dataset.searchProvince);
      runSearch();
    });
  }

  element<HTMLButtonElement>("#copy-text-json").addEventListener("click", () => copyOutput("#text-output"));
  element<HTMLButtonElement>("#copy-structured-json").addEventListener("click", () => copyOutput("#structured-output"));
  element<HTMLButtonElement>("#copy-search-json").addEventListener("click", () => copyOutput("#search-output"));
  element<HTMLButtonElement>("#copy-validate-json").addEventListener("click", () => copyOutput("#validate-output"));

  runConvertText();
  runStructured();
  runSearch();
  runValidate();
}

boot();
