import { describe, expect, it } from "vitest";
import { parseCsv, stringifyCsv } from "../src/cli/utils/csv";
import { formatConversionResult } from "../src/cli/utils/output";
import { convertAddressText } from "../src";

describe("cli utils", () => {
  it("parses quoted commas in CSV", () => {
    const rows = parseCsv('id,address\n1,"123 Le Loi, P Loc Tho"\n');
    expect(rows[0]?.address).toBe("123 Le Loi, P Loc Tho");
  });

  it("stringifies CSV with quoted commas", () => {
    expect(stringifyCsv([{ id: "1", address: "123, ABC" }])).toContain('"123, ABC"');
  });

  it("formats conversion output", () => {
    const text = formatConversionResult(convertAddressText("123 Le Loi, P Vinh Hoa, TP Nha Trang, Khanh Hoa"));
    expect(text).toContain("Success: true");
  });
});
