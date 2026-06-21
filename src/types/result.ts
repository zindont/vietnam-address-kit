import type { StructuredOldAddressInput } from "./address";
import type { Province, Ward } from "./data";

export type MatchStrategy =
  | "old_ward_district_province_exact"
  | "old_ward_province_exact"
  | "former_ward"
  | "split_population"
  | "normalized_exact"
  | "no_diacritics"
  | "abbreviation"
  | "fuzzy"
  | "candidate_suggestion"
  | "failed";

export interface ConversionCandidate {
  newProvinceCode: string;
  newProvinceName: string;
  newWardCode: string;
  newWardName: string;
  confidence: number;
  strategy: MatchStrategy;
  reason: string;
}

export interface ConversionResult {
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

export interface HierarchyValidationResult {
  valid: boolean;
  province?: Province;
  ward?: Ward;
  reason?: string;
}

export interface BatchConversionResult {
  total: number;
  matched: number;
  ambiguous: number;
  failed: number;
  averageConfidence: number;
  results: ConversionResult[];
}
