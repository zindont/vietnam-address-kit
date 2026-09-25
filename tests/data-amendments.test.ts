import { describe, expect, it } from "vitest";
import {
  getDataVersion,
  getProvinceByCode,
  getProvinceByName,
  getProvinces,
  getWardByCode,
  getWards
} from "../src";
import { getMappings } from "../src/data/loader";

describe("2026 administrative amendments", () => {
  it("reports the current as-of date and three new centrally governed cities", () => {
    expect(getDataVersion().lastUpdatedAt).toBe("2026-09-25");
    expect(getProvinces()).toHaveLength(34);
    for (const [code, name] of [["22", "Quảng Ninh"], ["24", "Bắc Ninh"], ["75", "Đồng Nai"]] as const) {
      expect(getProvinceByCode(code)).toMatchObject({ name, type: "city", nameWithType: `Thành phố ${name}` });
      expect(getProvinceByName(`Thành phố ${name}`)?.code).toBe(code);
    }
  });

  it("exposes the 22 promoted wards under their original codes and provinces", () => {
    const promoted = {
      "24": ["07294", "07375", "07399", "07444", "07840", "09193", "09292", "09313", "09319", "09454", "09475", "09496"],
      "75": ["25270", "25357", "25363", "26116", "26170", "26248", "26326", "26368", "26425", "26485"]
    };
    expect(getWards()).toHaveLength(3321);
    for (const [provinceCode, codes] of Object.entries(promoted)) {
      for (const code of codes) {
        const ward = getWardByCode(code);
        expect(ward).toMatchObject({ code, provinceCode, type: "ward" });
        expect(ward?.nameWithType).toBe(`Phường ${ward?.name}`);
        expect(getMappings().some((mapping) => mapping.newWardCode === code)).toBe(true);
      }
    }
  });
});
