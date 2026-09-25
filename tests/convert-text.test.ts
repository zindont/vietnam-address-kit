import { describe, expect, it } from "vitest";
import { convertAddressText, parseAddress } from "../src";

describe("convertAddressText", () => {
  it("converts full address text", () => {
    const result = convertAddressText("123 Lê Lợi, Phường Vĩnh Hòa, TP Nha Trang, Khánh Hòa");
    expect(result.success).toBe(true);
    expect(result.newAddress?.wardCode).toBe("22333");
  });

  it("preserves street address", () => {
    const result = convertAddressText("123 Le Loi, P Vinh Hoa, TP Nha Trang, Khanh Hoa");
    expect(result.streetAddress).toBe("123 Le Loi");
  });

  it("supports abbreviations", () => {
    const result = convertAddressText("123 Le Loi, P. Vinh Hoa, TP. Nha Trang, Khanh Hoa");
    expect(result.success).toBe(true);
  });

  it("detects administrative units without commas", () => {
    const result = convertAddressText("123 Le Loi P Vinh Hoa TP Nha Trang Khanh Hoa");
    expect(result.success).toBe(true);
    expect(result.streetAddress).toBe("123 Le Loi");
    expect(result.newAddress?.wardCode).toBe("22333");
  });

  it("detects bare unit names without prefixes or commas", () => {
    const result = convertAddressText("123 Le Loi Vinh Hoa Nha Trang Khanh Hoa");
    expect(result.success).toBe(true);
    expect(result.streetAddress).toBe("123 Le Loi");
    expect(result.newAddress?.wardCode).toBe("22333");
  });

  it("infers a missing province from a unique district and ward pair", () => {
    expect(parseAddress("58 doan tran nghiep vinh phuoc nha trang").inferredProvince).toBe(true);
    const result = convertAddressText("58 doan tran nghiep vinh phuoc nha trang");
    expect(result.success).toBe(true);
    expect(result.streetAddress).toBe("58 doan tran nghiep");
    expect(result.oldAddress?.provinceCode).toBe("56");
    expect(result.oldAddress?.wardCode).toBe("22333");
    expect(result.newAddress?.wardCode).toBe("22333");
    expect(result.confidence).toBeLessThanOrEqual(0.8);
    expect(result.warnings.some((warning) => warning.includes("Province inferred"))).toBe(true);
  });

  it("does not infer a province from a district without a ward", () => {
    const result = convertAddressText("58 doan tran nghiep nha trang");
    expect(result.success).toBe(false);
  });

  it("does not infer a province from a district and ward pair shared by provinces", () => {
    const result = convertAddressText("123 duong abc vinh thanh vinh thanh");
    expect(result.success).toBe(false);
    expect(result.warnings.some((warning) => warning.includes("Multiple district/ward pairs"))).toBe(true);
  });

  it("handles abbreviations written directly against names", () => {
    const result = convertAddressText("123 Le Loi P.Vinh Hoa TP.Nha Trang Khanh Hoa");
    expect(result.success).toBe(true);
    expect(result.newAddress?.wardCode).toBe("22333");
  });

  it("recovers a typo in an unseparated administrative name with reduced confidence", () => {
    const result = convertAddressText("123 Le Loi P Vinh Hoaa TP Nha Trang Khanh Hoa");
    expect(result.success).toBe(true);
    expect(result.newAddress?.wardCode).toBe("22333");
    expect(result.confidence).toBeLessThanOrEqual(0.7);
    expect(result.warnings.some((warning) => warning.includes("approximately"))).toBe(true);
  });

  it("recovers a typo in a comma-separated province", () => {
    const result = convertAddressText("123 Le Loi, P Vinh Hoa, TP Nha Trang, Khanh Hoaa");
    expect(result.success).toBe(true);
    expect(result.newAddress?.provinceCode).toBe("56");
    expect(result.confidence).toBeLessThanOrEqual(0.7);
  });

  it("recovers a typo in an unseparated province", () => {
    const result = convertAddressText("123 Le Loi P Vinh Hoa TP Nha Trang Khanh Hoaa");
    expect(result.success).toBe(true);
    expect(result.newAddress?.provinceCode).toBe("56");
    expect(result.confidence).toBeLessThanOrEqual(0.7);
  });

  it("does not treat a bare street name after a house number as a ward", () => {
    const result = convertAddressText("123 Vinh Hoa TP Nha Trang Khanh Hoa");
    expect(result.success).toBe(false);
  });

  it("failed parse returns warnings", () => {
    const result = convertAddressText("Unknown address");
    expect(result.success).toBe(false);
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});
