import { describe, expect, it } from "vitest";
import { convertOldToNew } from "../src";

describe("convertOldToNew", () => {
  it("converts full old province + district + ward deterministically", () => {
    const result = convertOldToNew({ province: "Khánh Hòa", district: "Nha Trang", ward: "Vĩnh Hòa", streetAddress: "123 Lê Lợi" });
    expect(result.success).toBe(true);
    expect(result.newAddress?.wardCode).toBe("22333");
    expect(result.newAddress?.provinceCode).toBe("56");
    expect(result.confidence).toBeGreaterThan(0.9);
  });

  it("converts no-diacritics input", () => {
    const result = convertOldToNew({ province: "Khanh Hoa", district: "Nha Trang", ward: "Vinh Hoa" });
    expect(result.success).toBe(true);
    expect(result.newAddress?.provinceCode).toBe("56");
  });

  it("resolves a population split to the population successor (split_population)", () => {
    const result = convertOldToNew({ province: "Hà Nội", district: "Tây Hồ", ward: "Thụy Khuê" });
    expect(result.success).toBe(true);
    expect(result.strategy).toBe("split_population");
    expect(result.newAddress?.wardCode).toBe("00103");
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it("resolves a pre-2025 former ward name (former_ward)", () => {
    const result = convertOldToNew({ province: "Khánh Hòa", district: "Nha Trang", ward: "Phước Tiến" });
    expect(result.success).toBe(true);
    expect(result.strategy).toBe("former_ward");
    expect(result.newAddress?.wardName).toBe("Nha Trang");
    expect(result.confidence).toBeCloseTo(0.92);
    expect(result.warnings.some((w) => w.includes("Phước Tiến"))).toBe(true);
  });

  it("resolves former names that merged before keeping their own code (retired code)", () => {
    const tanLap = convertOldToNew({ province: "Khánh Hòa", district: "Nha Trang", ward: "Tân Lập" });
    expect(tanLap.success).toBe(true);
    expect(tanLap.newAddress?.wardName).toBe("Nha Trang");
    expect(tanLap.strategy).toBe("former_ward");
  });

  it("resolves a former name whose variants all lead to the same new ward", () => {
    // "Ma Đa Guôi" was both a thị trấn and a xã; both became "Đạ Huoai", so it is not ambiguous.
    const result = convertOldToNew({ province: "Lâm Đồng", district: "Đạ Huoai", ward: "Ma Đa Guôi" });
    expect(result.success).toBe(true);
    expect(result.strategy).toBe("former_ward");
    expect(result.newAddress?.wardName).toBe("Đạ Huoai");
  });

  it("ambiguous area split returns candidates without forcing a match", () => {
    const result = convertOldToNew({ province: "Hà Nội", district: "Ba Đình", ward: "Ngọc Hà" });
    expect(result.success).toBe(false);
    expect(result.candidates.length).toBeGreaterThan(1);
  });

  it("missing ward returns candidates", () => {
    const result = convertOldToNew({ province: "Khánh Hòa", district: "Nha Trang" });
    expect(result.success).toBe(false);
    expect(result.candidates.length).toBeGreaterThan(0);
  });

  it("unknown ward does not force a match", () => {
    const result = convertOldToNew({ province: "Khánh Hòa", ward: "Khong Co Thuc 123" });
    expect(result.success).toBe(false);
  });
});
