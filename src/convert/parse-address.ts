import type { ParsedAddress } from "../types/address";
import { getLegacyDistricts, getLegacyProvinces, getLegacyWards } from "../data/loader";
import { matchLegacySuffix, type SuffixMatch } from "./legacy-match";

const WARD_HINT = /\b(phường|phuong|p\.?|xã|xa|x\.?|thị trấn|thi tran|tt\.?)\b/i;
const DISTRICT_HINT = /\b(quận|quan|q\.?|huyện|huyen|h\.?|thành phố|thanh pho|tp\.?|tỉnh|tinh|thị xã|thi xa|tx\.?)\b/i;

function uniqueSuffix<T extends { code: string }>(matches: SuffixMatch<T>[]): SuffixMatch<T> | undefined {
  const unique = new Map(matches.map((match) => [match.unit.code, match]));
  return unique.size === 1 ? unique.values().next().value : undefined;
}

function parseWithoutSeparators(text: string): ParsedAddress {
  const tokens = text.trim().match(/\S+/gu) ?? [];
  const warnings: string[] = [];
  const provinceMatches = matchLegacySuffix(tokens, getLegacyProvinces());
  const province = uniqueSuffix(provinceMatches);
  if (!province) {
    if (provinceMatches.length === 0) {
      const inferred = matchLegacySuffix(tokens, getLegacyDistricts()).flatMap((district) => {
        const beforeDistrict = tokens.slice(0, -district.tokenCount);
        const wardPool = getLegacyWards().filter((unit) => unit.provinceCode === district.unit.provinceCode && unit.districtCode === district.unit.code);
        const ward = uniqueSuffix(matchLegacySuffix(beforeDistrict, wardPool));
        if (!ward) return [];
        const beforeWard = beforeDistrict.slice(0, -ward.tokenCount);
        const wardText = beforeDistrict.slice(-ward.tokenCount).join(" ");
        if (!WARD_HINT.test(wardText) && /^\d+[a-z]?\/?\d*$/iu.test(beforeWard.join(" ").trim())) return [];
        const inferredProvince = getLegacyProvinces().find((unit) => unit.code === district.unit.provinceCode);
        return inferredProvince ? [{ province: inferredProvince, district, ward, streetTokens: beforeWard }] : [];
      });
      const unique = new Map(inferred.map((item) => [`${item.province.code}:${item.district.unit.code}:${item.ward.unit.code}`, item]));
      if (unique.size === 1) {
        const match = unique.values().next().value!;
        const approximate = match.district.distance > 0 || match.ward.distance > 0;
        const streetAddress = match.streetTokens.join(" ").replace(/[\s,;]+$/u, "").trim();
        return {
          input: text,
          streetAddress: streetAddress || undefined,
          province: match.province.nameWithType,
          district: match.district.unit.nameWithType,
          ward: match.ward.unit.nameWithType,
          confidence: approximate ? 0.55 : 0.7,
          approximate,
          inferredProvince: true,
          warnings: ["Province inferred from the unique district/ward pair; review the result.",
            ...(approximate ? ["One or more administrative names were matched approximately; review the result."] : [])]
        };
      }
      if (unique.size > 1) warnings.push("Multiple district/ward pairs match; province cannot be inferred safely.");
    }
    return { input: text, streetAddress: text.trim() || undefined, confidence: 0.2,
      warnings: warnings.length > 0 ? warnings : [provinceMatches.length > 1 ? "Multiple legacy provinces match the address suffix." : "Province could not be detected from the address suffix."] };
  }
  let remaining = tokens.slice(0, -province.tokenCount);
  const districtPool = getLegacyDistricts().filter((unit) => unit.provinceCode === province.unit.code);
  const districtMatches = matchLegacySuffix(remaining, districtPool);
  const district = uniqueSuffix(districtMatches);
  if (district) remaining = remaining.slice(0, -district.tokenCount);
  else if (districtMatches.length > 1) warnings.push("Multiple legacy districts match the address suffix.");

  const wardPool = getLegacyWards().filter((unit) => unit.provinceCode === province.unit.code &&
    (!district || unit.districtCode === district.unit.code));
  const wardMatches = matchLegacySuffix(remaining, wardPool);
  const proposedWard = uniqueSuffix(wardMatches);
  const wardText = proposedWard ? remaining.slice(-proposedWard.tokenCount).join(" ") : "";
  const beforeWard = proposedWard ? remaining.slice(0, -proposedWard.tokenCount).join(" ") : "";
  // A bare ward name following only a house number may actually be a street name.
  const bareWardCouldBeStreet = proposedWard && !WARD_HINT.test(wardText) && /^\d+[a-z]?\/?\d*$/iu.test(beforeWard.trim());
  const ward = bareWardCouldBeStreet ? undefined : proposedWard;
  if (ward) remaining = remaining.slice(0, -ward.tokenCount);
  else if (wardMatches.length > 1) warnings.push("Multiple legacy wards match the address suffix.");

  if (!district) warnings.push("District could not be detected from the address suffix.");
  if (!ward) warnings.push("Ward could not be detected from the address suffix.");
  const approximate = [province, district, ward].some((match) => match && match.distance > 0);
  if (approximate) {
    warnings.push("One or more administrative names were matched approximately; review the result.");
  }
  const streetAddress = remaining.join(" ").replace(/[\s,;]+$/u, "").trim();
  return {
    input: text,
    streetAddress: streetAddress || undefined,
    province: province.unit.nameWithType,
    district: district?.unit.nameWithType,
    ward: ward?.unit.nameWithType,
    confidence: warnings.length === 0 ? 0.8 : 0.55,
    approximate,
    warnings
  };
}

export function parseAddress(text: string): ParsedAddress {
  const parts = text.split(",").map((part) => part.trim()).filter(Boolean);
  const warnings: string[] = [];

  if (parts.length < 4) return parseWithoutSeparators(text);

  const province = parts.at(-1);
  const district = parts.length >= 3 ? parts.at(-2) : undefined;
  const ward = parts.length >= 4 ? parts.at(-3) : undefined;
  const streetParts = parts.slice(0, Math.max(0, parts.length - 3));

  if (!province) warnings.push("Province could not be parsed.");
  if (!district) warnings.push("District could not be parsed.");
  if (!ward) warnings.push("Ward could not be parsed.");
  if (ward && !WARD_HINT.test(ward)) warnings.push("Ward component has no obvious ward/commune prefix.");
  if (district && !DISTRICT_HINT.test(district)) warnings.push("District component has no obvious district/city prefix.");

  return {
    input: text,
    streetAddress: streetParts.join(", ") || undefined,
    province,
    district,
    ward,
    confidence: warnings.length === 0 ? 0.8 : 0.55,
    warnings
  };
}
