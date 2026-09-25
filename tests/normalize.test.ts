import { describe, expect, it } from "vitest";
import { normalizeAdministrativePrefix, normalizeText, removeVietnameseTones } from "../src";

describe("normalize", () => {
  it("removes Vietnamese tones", () => {
    expect(removeVietnameseTones("Khánh Hòa")).toBe("Khanh Hoa");
    expect(removeVietnameseTones("Phường Lộc Thọ")).toBe("Phuong Loc Tho");
    expect(removeVietnameseTones("Thành phố Hồ Chí Minh")).toBe("Thanh pho Ho Chi Minh");
  });

  it("normalizes whitespace and punctuation", () => {
    expect(normalizeText("  TP.   Nha Trang, Khánh   Hòa ")).toBe("thanh pho nha trang khanh hoa");
  });

  it("normalizes common prefixes", () => {
    expect(normalizeAdministrativePrefix("P. Loc Tho, Q. 1, TP. HCM")).toContain("phường");
    expect(normalizeAdministrativePrefix("P. Loc Tho, Q. 1, TP. HCM")).toContain("quận");
    expect(normalizeAdministrativePrefix("P. Loc Tho, Q. 1, TP. HCM")).toContain("thành phố");
  });

  it("does not expand the first letter of an ordinary place name", () => {
    expect(normalizeText("Quảng Ninh")).toBe("quang ninh");
    expect(normalizeText("Q.Ninh")).toBe("quan ninh");
    expect(normalizeText("P.Vinh Hoa")).toBe("phuong vinh hoa");
  });
});
