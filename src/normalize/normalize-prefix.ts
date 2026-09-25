const PREFIX_REPLACEMENTS: Array<[RegExp, string]> = [
  [/(^|[\s,])t\s*\.?\s*p(?:\.|\s)\s*/giu, "$1thành phố "],
  [/(^|[\s,])tp(?:\.|\s)\s*/giu, "$1thành phố "],
  [/(^|[\s,])p(?:\.|\s)\s*/giu, "$1phường "],
  [/(^|[\s,])q(?:\.|\s)\s*/giu, "$1quận "],
  [/(^|[\s,])h(?:\.|\s)\s*/giu, "$1huyện "],
  [/(^|[\s,])tx(?:\.|\s)\s*/giu, "$1thị xã "],
  [/(^|[\s,])tt(?:\.|\s)\s*/giu, "$1thị trấn "],
  [/(^|[\s,])x(?:\.|\s)\s*/giu, "$1xã "]
];

export function normalizeAdministrativePrefix(text: string): string {
  let normalized = text;
  for (const [pattern, replacement] of PREFIX_REPLACEMENTS) {
    normalized = normalized.replace(pattern, replacement);
  }
  return normalized.replace(/\s+/g, " ").trim();
}
