import currentProvinces from "./official/current-provinces.json";
import currentWards from "./official/current-wards.json";
import legacyProvinces from "./official/legacy-provinces.json";
import legacyDistricts from "./official/legacy-districts.json";
import legacyWards from "./official/legacy-wards.json";
import mappings from "./official/mappings.json";
import type { AddressMapping, LegacyDistrict, LegacyProvince, LegacyWard, Province, Ward } from "../types/data";
import { normalizeText } from "../normalize/normalize-text";

export function getProvinces(): Province[] {
  return currentProvinces as Province[];
}

export function getWards(): Ward[] {
  return currentWards as Ward[];
}

export function getLegacyProvinces(): LegacyProvince[] {
  return legacyProvinces as LegacyProvince[];
}

export function getLegacyDistricts(): LegacyDistrict[] {
  return legacyDistricts as LegacyDistrict[];
}

export function getLegacyWards(): LegacyWard[] {
  return legacyWards as LegacyWard[];
}

export function getMappings(): AddressMapping[] {
  return mappings as AddressMapping[];
}

export function getProvinceByCode(code: string): Province | undefined {
  return getProvinces().find((province) => province.code === code);
}

export function getProvinceByName(name: string): Province | undefined {
  const normalized = normalizeText(name);
  return getProvinces().find(
    (province) => normalizeText(province.name) === normalized || normalizeText(province.nameWithType) === normalized
  );
}

export function getWardByCode(code: string): Ward | undefined {
  return getWards().find((ward) => ward.code === code);
}

export function getWardsByProvince(provinceCode: string): Ward[] {
  return getWards().filter((ward) => ward.provinceCode === provinceCode);
}
