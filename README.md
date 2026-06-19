# vn-address-kit - Open-source Vietnam Address Toolkit

**Tagline:** Vietnam address migration toolkit for the 2025+ two-level administrative reform.

## 1. Ý tưởng dự án

`vn-address-kit` là một npm package mã nguồn mở, viết bằng TypeScript, phục vụ xử lý địa chỉ hành chính Việt Nam sau mô hình 2 cấp mới.

Mục tiêu không chỉ là cung cấp danh sách tỉnh/xã, mà là một toolkit đầy đủ để developer có thể:

- Tra cứu tỉnh/thành và xã/phường mới.
- Validate quan hệ tỉnh - xã/phường.
- Parse địa chỉ dạng text tự do.
- Chuẩn hóa địa chỉ có dấu, không dấu, viết tắt.
- Convert địa chỉ cũ 3 cấp sang địa chỉ mới 2 cấp.
- Migrate dữ liệu hàng loạt bằng CLI.
- Trả confidence score, strategy, warnings và candidates để audit kết quả.

## 2. Vấn đề cần giải quyết

Sau khi chuyển sang mô hình hành chính 2 cấp, rất nhiều hệ thống vẫn lưu địa chỉ theo format cũ:

```txt
Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành
```

Trong khi format mới bỏ cấp quận/huyện:

```txt
Số nhà, đường, phường/xã, tỉnh/thành
```

Các hệ thống như e-commerce, logistics, CRM, ERP, healthcare, form đăng ký, dữ liệu khách hàng cũ, OCR CCCD... đều có thể cần migrate hoặc chuẩn hóa địa chỉ.

## 3. Định vị sản phẩm

Không định vị là “package danh sách tỉnh xã”. Định vị nên là:

> Open-source toolkit để parse, normalize, convert, validate và migrate địa chỉ hành chính Việt Nam sau mô hình 2 cấp.

Điểm khác biệt:

- TypeScript-first.
- Offline, không cần API key.
- Có CLI migrate CSV/JSON/Excel.
- Có confidence score.
- Không ép match khi địa chỉ mơ hồ.
- Trả candidates để người dùng chọn.
- Có data versioning và nguồn dữ liệu rõ ràng.
- Có test cases và benchmark công khai.
- Có playground web chạy client-side.

## 4. Tính năng MVP

### 4.1 Data API

```ts
getProvinces()
getProvinceByCode(code)
getWardsByProvince(provinceCode)
getWardByCode(code)
```

### 4.2 Search API

```ts
searchProvince("khanh hoa")
searchWard("loc tho")
searchAdministrativeUnit("nha trang")
```

### 4.3 Validate API

```ts
validateAddress({
  provinceCode: "56",
  wardCode: "xxxxx"
})
```

### 4.4 Convert structured address

```ts
convertOldToNew({
  province: "Khánh Hòa",
  district: "Nha Trang",
  ward: "Lộc Thọ"
})
```

### 4.5 Convert free-text address

```ts
convertAddressText(
  "123 Lê Lợi, Phường Lộc Thọ, TP Nha Trang, Khánh Hòa"
)
```

## 5. Output khác biệt

Output không nên chỉ trả tỉnh/xã mới. Cần trả thêm thông tin audit:

```ts
{
  success: true,
  input: "123 Lê Lợi, Phường Lộc Thọ, TP Nha Trang, Khánh Hòa",
  streetAddress: "123 Lê Lợi",
  oldAddress: {
    provinceName: "Khánh Hòa",
    districtName: "Nha Trang",
    wardName: "Lộc Thọ"
  },
  newAddress: {
    provinceCode: "...",
    provinceName: "...",
    wardCode: "...",
    wardName: "..."
  },
  confidence: 0.96,
  strategy: "old_ward_district_province_exact",
  warnings: [],
  candidates: []
}
```

Các field quan trọng:

- `confidence`: độ tin cậy của kết quả.
- `strategy`: cách package match địa chỉ.
- `warnings`: cảnh báo nếu dữ liệu thiếu/mơ hồ.
- `candidates`: danh sách kết quả gợi ý khi không thể chắc chắn.

## 6. CLI - điểm khác biệt quan trọng

CLI giúp package hữu dụng trong migration dữ liệu thật.

Convert một địa chỉ:

```bash
vn-address convert "123 Lê Lợi, Phường Lộc Thọ, TP Nha Trang, Khánh Hòa"
```

Migrate file CSV:

```bash
vn-address migrate customers.csv \
  --address-column address \
  --out customers.migrated.csv \
  --report report.json
```

Report mẫu:

```json
{
  "total": 10000,
  "matched": 9340,
  "ambiguous": 420,
  "failed": 240,
  "averageConfidence": 0.91
}
```

## 7. Data strategy

Dữ liệu nên chia thành 3 lớp:

### 7.1 Current administrative units

- Provinces / cities mới.
- Wards / communes mới.
- Quan hệ province - ward.

### 7.2 Legacy administrative units

- Tỉnh/thành cũ.
- Quận/huyện cũ.
- Xã/phường cũ.

### 7.3 Mapping rules

- Old ward code -> new ward code.
- Old district removed.
- Old province -> new province.
- Mapping type: `unchanged`, `renamed`, `merged`, `split`, `province_changed`, `ambiguous`.

Package nên có:

```ts
getDataVersion()
getLegalSources()
getLastUpdatedAt()
```

Và tài liệu:

```txt
DATA_SOURCES.md
DATA_CHANGELOG.md
```

## 8. Confidence strategy

Cần scoring rõ ràng để developer tin kết quả.

| Match type | Confidence gợi ý |
|---|---:|
| Tỉnh + huyện + xã exact | 0.98 |
| Tỉnh + xã exact, thiếu huyện | 0.90 |
| Không dấu, full match | 0.88 |
| Viết tắt P., Q., TP. | 0.85 |
| Fuzzy typo nhẹ | 0.75 |
| Chỉ match xã/phường, thiếu tỉnh | 0.50 |
| Nhiều candidates | 0.30 - 0.70 |

Không nên tự đoán khi dữ liệu mơ hồ. Khi confidence thấp, trả candidates để user hoặc hệ thống phía trên quyết định.

## 9. Repo structure đề xuất

```txt
vn-address-kit/
  packages/
    core/
      src/
        data/
        search/
        normalize/
        convert/
        validate/
        parser/
      tests/
    cli/
      src/
    playground/
      src/
  data/
    raw/
    processed/
    mappings/
  scripts/
    build-data.ts
    validate-data.ts
    benchmark.ts
  test-cases/
    exact/
    no-diacritics/
    abbreviations/
    ambiguous/
    ocr/
  docs/
    api.md
    cli.md
    migration.md
    data-sources.md
    confidence.md
  README.md
  CHANGELOG.md
  DATA_CHANGELOG.md
```

## 10. Tech stack đề xuất

- Language: TypeScript.
- Build: tsup.
- Test: Vitest.
- CLI: Commander hoặc CAC.
- Fuzzy search: Fuse.js hoặc tự implement nhẹ.
- Data format: JSON generated at build time.
- Docs: VitePress hoặc Docusaurus.
- Playground: Vite React hoặc Next.js.
- CI/CD: GitHub Actions.
- Release: Changesets.

Package nên hỗ trợ:

- ESM.
- CJS nếu cần.
- TypeScript declarations.
- Browser bundle.
- CLI binary.

## 11. Roadmap

### Phase 1 - Core data + search

- `getProvinces()`
- `getWards()`
- `getWardsByProvince()`
- `searchProvince()`
- `searchWard()`
- `validateHierarchy()`

### Phase 2 - Old/new mapping

- `convertOldToNew()`
- `convertStructuredAddress()`
- `getMappingInfo()`

### Phase 3 - Free-text parser

- `parseAddress()`
- `convertAddressText()`
- `normalizeAddress()`
- Xử lý có dấu, không dấu, viết tắt, thiếu prefix, số nhà/đường.

### Phase 4 - CLI migration

- `vn-address convert`
- `vn-address search`
- `vn-address migrate`
- `vn-address validate`

### Phase 5 - Playground + docs

- Web demo.
- API docs.
- Benchmark page.
- Data source page.

## 12. Chiến lược triển khai

Không nên bắt đầu bằng SaaS/API. Nên đi theo thứ tự:

1. Open-source npm package là lõi.
2. CLI migration là điểm khác biệt.
3. Playground là kênh demo/marketing.
4. Hosted API/SaaS để sau nếu package có traction.

Lý do: package open-source thể hiện năng lực library design, data engineering, CLI tooling, testing, documentation, product thinking và open-source maintenance tốt hơn một web tool tra cứu đơn giản.

## 13. Câu mô tả README đề xuất

```txt
vn-address-kit is an open-source TypeScript toolkit for Vietnam administrative addresses after the 2025+ two-level reform. It helps developers search provinces/wards, validate address hierarchy, convert legacy 3-level addresses to the new 2-level model, and migrate address datasets safely with confidence scoring.
```

Bản tiếng Việt:

```txt
vn-address-kit là bộ công cụ mã nguồn mở giúp xử lý địa chỉ hành chính Việt Nam sau mô hình 2 cấp: tra cứu tỉnh/xã, kiểm tra hợp lệ, chuyển đổi địa chỉ cũ 3 cấp sang địa chỉ mới 2 cấp và migrate dữ liệu hàng loạt có chấm điểm độ tin cậy.
```

## 14. Kết luận

`vn-address-kit` nên được xây dựng như một **Vietnam Address Migration Toolkit**, không chỉ là package dữ liệu hành chính.

Điểm mạnh cần tập trung:

- Developer-first API.
- CLI migrate dữ liệu thật.
- Confidence score và candidates.
- Không ép match địa chỉ mơ hồ.
- Data versioning rõ ràng.
- Test cases và benchmark công khai.
- Docs và playground dễ dùng.

Nếu làm tốt, dự án này có thể trở thành một open-source package có giá trị thực tế cho developer Việt Nam trong giai đoạn chuyển đổi địa chỉ hành chính.
