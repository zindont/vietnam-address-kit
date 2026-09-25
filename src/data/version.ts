export interface DataVersion {
  version: string;
  sample: boolean;
  lastUpdatedAt: string;
  description: string;
  sources: string[];
}

export function getDataVersion(): DataVersion {
  return {
    version: "official-2026.09.25",
    sample: false,
    lastUpdatedAt: "2026-09-25",
    description: "Vietnam administrative units as of 25/09/2026, built from the 2025 national conversion table and subsequent official amendments.",
    sources: [
      "Quyết định 19/2025/QĐ-TTg — Danh mục và mã số đơn vị hành chính Việt Nam",
      "34 Nghị quyết của Ủy ban Thường vụ Quốc hội về sắp xếp đơn vị hành chính cấp xã (2025)",
      "Đối chiếu đơn vị hành chính cấp Xã 01/09/2024 → 01/07/2025 (formerNames, gồm các đợt sắp xếp 2023–2024)",
      "Cục Thống kê — danhmuchanhchinh.nso.gov.vn (đối chiếu đến 25/09/2026)",
      "30/2026/QH16, 36/2026/QH16, 39/2026/QH16 — thành lập thành phố trực thuộc trung ương",
      "237/NQ-UBTVQH16, 388/NQ-UBTVQH16 — thành lập phường tại Đồng Nai và Bắc Ninh"
    ]
  };
}
