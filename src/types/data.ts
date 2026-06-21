export interface Province {
  code: string;
  name: string;
  type: "province" | "city";
  nameWithType: string;
  slug: string;
  normalizedName: string;
}

export interface Ward {
  code: string;
  name: string;
  type: "ward" | "commune" | "special_zone";
  nameWithType: string;
  provinceCode: string;
  slug: string;
  normalizedName: string;
}

export interface LegacyProvince {
  code: string;
  name: string;
  type: "province" | "city";
  nameWithType: string;
  slug: string;
  normalizedName: string;
}

export interface LegacyDistrict {
  code: string;
  name: string;
  type: "district" | "city" | "town" | "urban_district";
  nameWithType: string;
  provinceCode: string;
  slug: string;
  normalizedName: string;
}

/**
 * A ward name retired in an earlier (pre-2025) reform round that was absorbed,
 * deterministically, into the surviving `LegacyWard` that carries this entry.
 * Lets addresses written with the old name (e.g. "Phước Tiến", merged into
 * "Tân Tiến" on 2024-11-01) still resolve. Matching is by `normalizedName`;
 * `code`/`since`/`decree` are carried for auditability only.
 */
export interface LegacyFormerName {
  name: string;
  normalizedName: string;
  code?: string;
  since?: string;
  decree?: string;
}

export interface LegacyWard {
  code: string;
  name: string;
  type: "ward" | "commune" | "town";
  nameWithType: string;
  districtCode: string;
  provinceCode: string;
  slug: string;
  normalizedName: string;
  /** Former names this ward absorbed in a pre-2025 reform; see {@link LegacyFormerName}. */
  formerNames?: LegacyFormerName[];
}

export type MappingType =
  | "unchanged"
  | "renamed"
  | "merged"
  | "split"
  | "split_population"
  | "province_changed"
  | "ambiguous"
  | "manual_review_required";

export interface AddressMapping {
  oldProvinceCode: string;
  oldDistrictCode?: string;
  oldWardCode?: string;
  newProvinceCode: string;
  newWardCode: string;
  type: MappingType;
  note?: string;
}
