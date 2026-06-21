# CONTEXT — Ubiquitous Language

Glossary for `vn-address-kit`. Terms only — no implementation details.

## Administrative model

- **Mô hình cũ (legacy / 3-level)** — `tỉnh → quận/huyện → phường/xã`, hiệu lực **trước 01/07/2025**.
- **Mô hình mới (current / 2-level)** — `tỉnh → phường/xã`, cấp quận/huyện bị bỏ, hiệu lực **từ 01/07/2025**.
- **Xã cũ / Old ward** — đơn vị cấp phường/xã trong mô hình cũ (mã 5 chữ số theo hệ mã GSO cũ).
- **Xã mới / New ward** — đơn vị cấp xã trong mô hình mới (mã 5 chữ số mới, cấp nationally-unique theo QĐ 19/2025).
- **Đặc khu / Special zone** — loại đơn vị cấp xã đặc biệt trong mô hình mới (vd Thổ Châu). Một giá trị của `Ward.type = "special_zone"`.

## Conversion

- **Bảng chuyển đổi / Conversion table** — bảng official ánh xạ "xã cũ → xã mới", nguồn chân lý duy nhất cho dữ liệu (file `BangChuyendoiĐVHCmoi_cu_final.xlsx`).
- **Split ward** — một **xã cũ bị tách** vào **nhiều xã mới** (ca "Nhập một phần"). Đây là nguồn của kết quả `ambiguous`: engine trả về tất cả xã mới làm candidate, confidence bị cap, **không đoán một đáp án**.
- **Former name / Tên tiền nhiệm** — tên phường/xã bị khai tử trong đợt sắp xếp **2023–2024** (trước mô hình 2 cấp), đã sáp nhập deterministic vào một xã kế nhiệm còn sống (vd "Phước Tiến" → "Tân Tiến" 01/11/2024). Lưu thành `formerNames` trên xã kế nhiệm; convert ra `strategy = former_ward`. Xem [[two-reform-rounds]].
- **Two reform rounds / Hai đợt cải cách** — (1) sắp xếp ĐVHC cấp xã 2023–2024 (sáp nhập nội tỉnh), rồi (2) mô hình 2 cấp 01/07/2025. Dataset chính lấy mốc *ngay trước (2)*; lớp `formerNames` phủ thêm các tên bị xoá ở (1).
- **Merge** — nhiều xã cũ **gộp toàn bộ** thành một xã mới (ca "Nhập toàn bộ"); ánh xạ vẫn deterministic (xã cũ → đúng một xã mới).
- **Ghi chú nguồn** — cột mô tả thao tác sắp xếp trong bảng chuyển đổi, quyết định `MappingType`:
  - `Giữ nguyên` → `unchanged`
  - `Đổi tên` → `renamed`
  - `Nhập toàn bộ` (xã cũ → 1 xã mới) → `merged`
  - `Nhập một phần*` (xã cũ → nhiều xã mới) → ca split → `ambiguous` / `split`
  - tỉnh cũ ≠ tỉnh mới → `province_changed`

## Provenance

- **Nguồn chính thống / Authoritative source** — `danhmuchanhchinh.nso.gov.vn` (Tổng cục Thống kê) + **QĐ 19/2025/QĐ-TTg** + 34 Nghị quyết UBTVQH. Quyết định danh mục & mã.
- **Nguồn phái sinh / Derived source** — API cộng đồng (provinces.open-api.vn, ThangLeQuoc DB, addresskit.cas.so). Tiện nhưng không có giá trị pháp lý; chỉ dùng để đối soát.
