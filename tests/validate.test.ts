import { describe, expect, it } from "vitest";
import { validateHierarchy } from "../src";

describe("validate", () => {
  it("validates a valid province/ward hierarchy", () => {
    expect(validateHierarchy({ provinceCode: "56", wardCode: "22333" }).valid).toBe(true);
  });

  it("rejects ward under wrong province", () => {
    const result = validateHierarchy({ provinceCode: "01", wardCode: "22333" });
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("does not belong");
  });

  it("rejects unknown province", () => {
    expect(validateHierarchy({ provinceCode: "xx", wardCode: "22333" }).reason).toContain("Unknown province");
  });

  it("rejects unknown ward", () => {
    expect(validateHierarchy({ provinceCode: "56", wardCode: "xx" }).reason).toContain("Unknown ward");
  });
});
