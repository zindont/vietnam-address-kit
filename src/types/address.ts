export interface StructuredOldAddressInput {
  province?: string;
  district?: string;
  ward?: string;
  streetAddress?: string;
}

export interface ParsedAddress {
  input: string;
  streetAddress?: string;
  province?: string;
  district?: string;
  ward?: string;
  confidence: number;
  approximate?: boolean;
  inferredProvince?: boolean;
  warnings: string[];
}
