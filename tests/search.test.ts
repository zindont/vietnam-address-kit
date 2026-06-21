import { describe, expect, it } from "vitest";
import { searchProvince, searchWard } from "../src";

describe("search", () => {
  it("searches province with diacritics", () => {
    expect(searchProvince("Khánh Hòa")[0]?.item.code).toBe("56");
  });

  it("searches province without diacritics", () => {
    expect(searchProvince("khanh hoa")[0]?.item.code).toBe("56");
  });

  it("searches ward with province filter", () => {
    const results = searchWard("bac nha trang", { provinceCode: "56" });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]?.item.code).toBe("22333");
    expect(results.every((result) => result.item.provinceCode === "56")).toBe(true);
  });

  it("returns multiple candidates for ward names shared across provinces", () => {
    const results = searchWard("tan thanh");
    expect(results.length).toBeGreaterThan(1);
  });
});
