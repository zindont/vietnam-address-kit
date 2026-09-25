import { normalizeText } from "../normalize/normalize-text";
import { levenshtein } from "../search/levenshtein";

export interface NamedUnit {
  name: string;
  nameWithType: string;
  normalizedName: string;
  formerNames?: Array<{ name: string; normalizedName: string }>;
}

function aliases(unit: NamedUnit): string[] {
  const former = (unit.formerNames ?? []).flatMap((item) => [item.name, `Phường ${item.name}`, `Xã ${item.name}`, `Thị trấn ${item.name}`]);
  return [unit.name, unit.nameWithType, unit.normalizedName, ...former]
    .map(normalizeText);
}

function maxTypoDistance(length: number): number {
  if (length < 5) return 0;
  if (length < 9) return 1;
  return 2;
}

export function typoDistance(query: string, unit: NamedUnit): number | undefined {
  const normalized = normalizeText(query);
  if (!normalized) return undefined;
  const distances = aliases(unit).map((alias) => levenshtein(normalized, alias));
  const best = Math.min(...distances);
  return best > 0 && best <= maxTypoDistance(normalized.length) ? best : undefined;
}

export function findBestLegacy<T extends NamedUnit>(keyword: string | undefined, units: T[]): T[] {
  if (!keyword) return [];
  const normalized = normalizeText(keyword);
  if (!normalized) return [];
  const exact = units.filter((unit) => aliases(unit).includes(normalized));
  if (exact.length > 0) return exact;
  const contains = units.filter((unit) => aliases(unit).some((alias) => alias.includes(normalized)));
  if (contains.length > 0) return contains;

  const fuzzy = units.flatMap((unit) => {
    const distance = typoDistance(keyword, unit);
    return distance === undefined ? [] : [{ unit, distance }];
  });
  const minimum = Math.min(...fuzzy.map((item) => item.distance));
  return fuzzy.filter((item) => item.distance === minimum).map((item) => item.unit);
}

export interface SuffixMatch<T> {
  unit: T;
  tokenCount: number;
  distance: number;
}

export function matchLegacySuffix<T extends NamedUnit>(tokens: string[], units: T[]): SuffixMatch<T>[] {
  const matches: SuffixMatch<T>[] = [];
  for (let count = 1; count <= Math.min(6, tokens.length); count += 1) {
    const query = tokens.slice(-count).join(" ");
    const normalized = normalizeText(query);
    for (const unit of units) {
      const unitAliases = aliases(unit);
      if (unitAliases.includes(normalized)) {
        matches.push({ unit, tokenCount: count, distance: 0 });
      } else {
        const distance = typoDistance(query, unit);
        if (distance !== undefined) matches.push({ unit, tokenCount: count, distance });
      }
    }
  }
  if (matches.length === 0) return [];
  const minimum = Math.min(...matches.map((match) => match.distance));
  const longest = Math.max(...matches.filter((match) => match.distance === minimum).map((match) => match.tokenCount));
  return matches.filter((match) => match.distance === minimum && match.tokenCount === longest);
}
