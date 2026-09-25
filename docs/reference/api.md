# API Reference

All public APIs are exported from the package root.

```ts
import { convertAddressText, searchProvince } from "vietnam-address-kit";
```

## Data Version

### `getDataVersion()`

Returns metadata about the bundled dataset.

```ts
const version = getDataVersion();
```

Returns:

```ts
{
  version: string;
  sample: boolean;
  lastUpdatedAt: string;
  description: string;
  sources: string[];
}
```

## Current Administrative Data

### `getProvinces()`

Returns all current provinces/cities.

### `getProvinceByCode(code)`

Returns one current province by code, or `undefined`.

### `getProvinceByName(name)`

Returns one current province by name, normalized name, or name with administrative type.

### `getWards()`

Returns all current wards/communes/special zones.

### `getWardByCode(code)`

Returns one current ward by code, or `undefined`.

### `getWardsByProvince(provinceCode)`

Returns current wards inside one current province.

## Search

### `searchProvince(keyword)`

Searches current provinces.

```ts
const results = searchProvince("khanh hoa");
```

Returns scored results sorted by best match:

```ts
Array<{
  item: Province;
  score: number;
  strategy: "exact" | "normalized" | "contains" | "fuzzy";
}>
```

### `searchWard(keyword, options?)`

Searches current wards, optionally filtered by province code.

```ts
searchWard("loc tho", { provinceCode: "56" });
```

### `searchAdministrativeUnit(keyword)`

Searches both provinces and wards.

```ts
const result = searchAdministrativeUnit("nha trang");
console.log(result.provinces);
console.log(result.wards);
```

## Normalize

### `removeVietnameseTones(text)`

Removes Vietnamese tones while preserving base characters.

```ts
removeVietnameseTones("Khánh Hòa"); // "Khanh Hoa"
```

### `normalizeAdministrativePrefix(text)`

Expands common prefixes such as `TP.`, `P.`, `Q.`, `H.`, `TX.`, `TT.`, and `X.`.

### `normalizeText(text)`

Normalizes text for matching: trims, lowercases, removes tones, collapses whitespace, strips punctuation noise, and normalizes administrative prefixes.

## Validate

### `validateProvince(provinceCode)`

Returns `true` if the current province code exists.

### `validateWard(wardCode)`

Returns `true` if the current ward code exists.

### `validateHierarchy({ provinceCode, wardCode })`

Checks whether a current ward belongs to a current province.

```ts
validateHierarchy({ provinceCode: "56", wardCode: "56001" });
```

Returns:

```ts
{
  valid: boolean;
  province?: Province;
  ward?: Ward;
  reason?: string;
}
```

### `validateAddress(input)`

Alias for hierarchy validation.

## Parse And Convert

### `parseAddress(text)`

Parses address text from right to left. Comma-separated input is preferred; without commas, it detects trailing legacy province, district, and ward names using the administrative catalog. The latter accepts omitted prefixes and small spelling errors, but may return warnings or fail when names are ambiguous.

```ts
parseAddress("123 Le Loi, P Loc Tho, TP Nha Trang, Khanh Hoa");
parseAddress("123 Le Loi P Loc Tho TP Nha Trang Khanh Hoa");
```

Returns:

```ts
{
  input: string;
  streetAddress?: string;
  province?: string;
  district?: string;
  ward?: string;
  confidence: number;
  approximate?: boolean;
  warnings: string[];
}
```

### `convertAddressText(text)`

Parses and converts a legacy free-text address.

```ts
const result = convertAddressText("123 Le Loi, P Loc Tho, TP Nha Trang, Khanh Hoa");
```

### `convertOldToNew(input)`

Converts structured legacy address input.

```ts
const result = convertOldToNew({
  province: "Khánh Hòa",
  district: "Nha Trang",
  ward: "Lộc Thọ",
  streetAddress: "123 Lê Lợi"
});
```

Input:

```ts
interface StructuredOldAddressInput {
  province?: string;
  district?: string;
  ward?: string;
  streetAddress?: string;
}
```

Conversion result:

```ts
interface ConversionResult {
  success: boolean;
  input: string | StructuredOldAddressInput;
  streetAddress?: string;
  oldAddress?: {
    provinceCode?: string;
    provinceName?: string;
    districtCode?: string;
    districtName?: string;
    wardCode?: string;
    wardName?: string;
  };
  newAddress?: {
    provinceCode: string;
    provinceName: string;
    wardCode: string;
    wardName: string;
  };
  confidence: number;
  strategy: MatchStrategy;
  warnings: string[];
  candidates: ConversionCandidate[];
}
```

### `convertBatch(items)`

Converts an array of free-text strings or structured inputs.

```ts
const report = convertBatch([
  "123 Le Loi, P Loc Tho, TP Nha Trang, Khanh Hoa",
  { province: "Khánh Hòa", district: "Nha Trang", ward: "Lộc Thọ" }
]);
```

Returns:

```ts
{
  total: number;
  matched: number;
  ambiguous: number;
  failed: number;
  averageConfidence: number;
  results: ConversionResult[];
}
```
