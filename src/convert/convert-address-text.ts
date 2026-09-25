import type { ConversionResult } from "../types/result";
import { convertOldToNew } from "./convert-old-to-new";
import { parseAddress } from "./parse-address";

export function convertAddressText(text: string): ConversionResult {
  const parsed = parseAddress(text);
  if (!parsed.province || !parsed.ward) {
    return {
      success: false,
      input: text,
      streetAddress: parsed.streetAddress,
      confidence: 0,
      strategy: "failed",
      warnings: ["Address text could not be parsed into province/district/ward.", ...parsed.warnings],
      candidates: []
    };
  }

  const converted = convertOldToNew({
    province: parsed.province,
    district: parsed.district,
    ward: parsed.ward,
    streetAddress: parsed.streetAddress
  });

  return {
    ...converted,
    input: text,
    confidence: parsed.approximate ? Math.min(converted.confidence, 0.7) : converted.confidence,
    strategy: parsed.approximate && converted.success ? "fuzzy" : converted.strategy,
    candidates: parsed.approximate ? converted.candidates.map((candidate) => ({ ...candidate, confidence: Math.min(candidate.confidence, 0.7) })) : converted.candidates,
    warnings: [...parsed.warnings, ...converted.warnings]
  };
}
