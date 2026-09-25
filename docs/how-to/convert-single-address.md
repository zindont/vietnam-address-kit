# Convert A Single Address

Use this guide when you need to convert one legacy address into the current two-level model.

## Convert Free Text

```ts
import { convertAddressText } from "vietnam-address-kit";

const result = convertAddressText(
  "123 Lê Lợi, Phường Lộc Thọ, TP Nha Trang, Khánh Hòa"
);

if (result.success) {
  console.log(result.newAddress);
} else {
  console.log(result.warnings);
  console.log(result.candidates);
}
```

Free-text conversion is convenient when you receive addresses from forms, OCR, customer data, CRM exports, or support tickets. The parser reads from right to left: province, district, ward, then street address. Commas help, but the parser can also detect units separated only by spaces:

```ts
convertAddressText("123 Le Loi P Vinh Hoa TP Nha Trang Khanh Hoa");
```

Missing accents and small spelling errors are accepted when the legacy unit can be identified. Approximate matches are marked with a warning and confidence no higher than `0.7`. Ambiguous names still need review.

When the province is omitted, the parser can infer it from a unique legacy district and ward pair (for example, `58 doan tran nghiep vinh phuoc nha trang`). This adds a warning and caps confidence at `0.8`; ambiguous pairs are not inferred.

## Convert Structured Fields

```ts
import { convertOldToNew } from "vietnam-address-kit";

const result = convertOldToNew({
  province: "Khánh Hòa",
  district: "Nha Trang",
  ward: "Lộc Thọ",
  streetAddress: "123 Lê Lợi"
});
```

Structured input is more reliable than free text because each field already has a known role.

## Decide What To Do With The Result

```ts
if (result.success && result.confidence >= 0.9) {
  // Auto-accept in a migration pipeline.
} else if (result.candidates.length > 0) {
  // Send candidates to a manual review queue.
} else {
  // Keep the original address and ask for correction.
}
```

Suggested thresholds depend on your domain. For legally critical workflows, review all migrated records even when confidence is high.

## Preserve Audit Fields

Store at least these fields with your migrated record:

- `success`
- `confidence`
- `strategy`
- `warnings`
- `candidates`
- `oldAddress`
- `newAddress`
- original input

These fields make later auditing and rollback easier.
