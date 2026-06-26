# vietnam-address-kit

[![npm version](https://img.shields.io/npm/v/vietnam-address-kit.svg)](https://www.npmjs.com/package/vietnam-address-kit) [![CI](https://github.com/zindont/vietnam-address-kit/actions/workflows/ci.yml/badge.svg)](https://github.com/zindont/vietnam-address-kit/actions/workflows/ci.yml) [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> Bộ công cụ chuyển đổi địa chỉ hành chính Việt Nam cho mô hình 2 cấp năm 2025.

**Ngôn ngữ:** [English](README.md) | Tiếng Việt

`vietnam-address-kit` là bộ công cụ TypeScript-first giúp chuẩn hóa, tìm kiếm, kiểm tra, chuyển đổi và migrate địa chỉ hành chính Việt Nam từ mô hình cũ 3 cấp sang mô hình mới 2 cấp năm 2025.

## Dự án giải quyết gì?

Nhiều hệ thống vẫn lưu địa chỉ theo dạng `số nhà/đường, phường/xã, quận/huyện, tỉnh/thành`, trong khi mô hình mới bỏ cấp quận/huyện. Package này cung cấp API và CLI có kết quả xác định để migrate dữ liệu, kèm `confidence`, `strategy`, `warnings`, và `candidates` để audit kết quả.

## Trạng thái phát hành

`vietnam-address-kit` đã được phát hành như một package mã nguồn mở ổn định, có API, CLI, bộ kiểm thử, checklist phát hành và các file cộng đồng. Package được đóng gói kèm bộ dữ liệu hành chính 2 cấp chính thức năm 2025 gồm 34 tỉnh/thành và 3.321 xã/phường/đặc khu. Bộ dữ liệu được sinh từ bảng chuyển đổi quốc gia theo Quyết định 19/2025/QĐ-TTg và được đối chiếu với tổng số chính thức.

## Link public

- NPM package: [https://www.npmjs.com/package/vietnam-address-kit](https://www.npmjs.com/package/vietnam-address-kit)
- Browser playground: [https://zindont.github.io/vietnam-address-kit/](https://zindont.github.io/vietnam-address-kit/)
- GitHub repository: [https://github.com/zindont/vietnam-address-kit](https://github.com/zindont/vietnam-address-kit)

## Cài đặt

```bash
npm install vietnam-address-kit
```

Dành cho phát triển cục bộ:

```bash
npm install
npm run release:check
```

## Bắt đầu nhanh

```ts
import { convertAddressText } from "vietnam-address-kit";

const result = convertAddressText("123 Le Loi, P Loc Tho, TP Nha Trang, Khanh Hoa");
console.log(result.newAddress, result.confidence);
```

## Chạy nhanh không cần cài vào project

Dùng `npx` cho các tác vụ nhanh trong terminal:

```bash
npx vietnam-address-kit@latest version
npx vietnam-address-kit@latest convert "123 Le Loi, P Loc Tho, TP Nha Trang, Khanh Hoa" --json
npx vietnam-address-kit@latest convert "123 Le Loi, P Loc Tho, TP Nha Trang, Khanh Hoa" --json --pretty
npx vietnam-address-kit@latest search province "khanh hoa"
```

## Playground trên trình duyệt

Thử toolkit trực tiếp trên trình duyệt: [vietnam-address-kit Playground](https://zindont.github.io/vietnam-address-kit/).

## Chuyển đổi địa chỉ dạng text

```ts
import { convertAddressText } from "vietnam-address-kit";

convertAddressText("123 Lê Lợi, Phường Lộc Thọ, TP Nha Trang, Khánh Hòa");
```

## Chuyển đổi địa chỉ có cấu trúc

```ts
import { convertOldToNew } from "vietnam-address-kit";

convertOldToNew({
  province: "Khánh Hòa",
  district: "Nha Trang",
  ward: "Lộc Thọ",
  streetAddress: "123 Lê Lợi"
});
```

## Tìm kiếm tỉnh/xã

```ts
import { searchProvince, searchWard } from "vietnam-address-kit";

searchProvince("khanh hoa");
searchWard("loc tho", { provinceCode: "56" });
```

## Validate quan hệ tỉnh/xã

```ts
import { validateHierarchy } from "vietnam-address-kit";

validateHierarchy({ provinceCode: "56", wardCode: "56001" });
```

## Migrate CSV bằng CLI

```bash
vn-address migrate examples/migrate-customers.csv \
  --address-column address \
  --out customers.migrated.csv \
  --report report.json
```

Các lệnh CLI khác:

```bash
vn-address version
vn-address convert "123 Le Loi, P Loc Tho, TP Nha Trang, Khanh Hoa" --json
vn-address search province "khanh hoa"
vn-address search ward "loc tho" --province 56
```

## Điểm tin cậy

Kết quả trả về `confidence` từ `0` đến `1`, kèm `strategy`, `warnings`, và `candidates`. Điểm cao nghĩa là khớp chính xác hoặc có quy tắc xác định rõ ràng; điểm thấp nghĩa là khớp gần đúng hoặc chỉ là danh sách gợi ý và nên được review.

## Nguồn dữ liệu

Bộ dữ liệu trong `src/data/official/*.json` được sinh từ các file chuyển đổi chính thức theo Quyết định 19/2025/QĐ-TTg, các nghị quyết của Ủy ban Thường vụ Quốc hội, và bảng đối chiếu của Tổng cục Thống kê. Có thể sinh lại bằng `npm run build:data`. Với nghiệp vụ có yêu cầu pháp lý cao, hãy đối chiếu lại với `danhmuchanhchinh.nso.gov.vn`. Xem thêm [Data Sources](docs/explanation/data-sources.md).

## Tài liệu

- [Documentation Index](docs/README.md)
- [Bắt đầu nhanh](docs/vi/getting-started.md)
- [Migrate CSV](docs/vi/migrate-csv.md)
- [Reference: API](docs/reference/api.md)
- [Reference: CLI](docs/reference/cli.md)
- [Explanation: Confidence And Strategies](docs/explanation/confidence.md)
- [Explanation: Data Sources](docs/explanation/data-sources.md)
- [Documentation Language Policy](docs/language-policy.md)

## Chuẩn open-source

- [Contributing](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Security Policy](SECURITY.md)
- [Support](SUPPORT.md)
- [Release Process](RELEASE.md)

## Giới hạn

- Bộ dữ liệu đã được đối chiếu với tổng số chính thức năm 2025, nhưng các quy trình có tính pháp lý cao vẫn nên kiểm tra lại với nguồn nhà nước.
- Bộ parse địa chỉ dạng text hữu dụng cho nhu cầu thực tế nhưng không bao phủ mọi định dạng.
- Địa chỉ mơ hồ hoặc confidence thấp sẽ không bị ép thành một kết quả duy nhất.
- Lỗi OCR, địa chỉ thiếu thành phần, và các trường hợp lịch sử phức tạp có thể cần review thủ công.

## Lộ trình

- Mở rộng kiểm tra chất lượng dữ liệu và quy trình validate nguồn dữ liệu có thể tái lập.
- Cải thiện xử lý lỗi OCR và benchmark.
- Thêm helper migrate JSON và Excel.
- Phát hành browser playground.
- Bổ sung tài liệu bản địa hóa khi API ổn định hơn.

## Đóng góp

Mọi đóng góp đều được chào đón. Vui lòng đọc [CONTRIBUTING.md](CONTRIBUTING.md) trước khi mở pull request. Thay đổi dữ liệu nên kèm tài liệu nguồn, ghi chú validation và changelog.

## Giấy phép

MIT
