import { describe, expect, it } from "vitest";
import { convertAddressText } from "../src";

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

  it("failed parse returns warnings", () => {
    const result = convertAddressText("Unknown address");
    expect(result.success).toBe(false);
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});
