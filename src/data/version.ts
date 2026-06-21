export interface DataVersion {
  version: string;
  sample: boolean;
  lastUpdatedAt: string;
  description: string;
  sources: string[];
}

export function getDataVersion(): DataVersion {
  return {
    version: "official-2025.07.01",
    sample: false,
    lastUpdatedAt: "2025-07-01",
    description: "Official Vietnam administrative units effective 01/07/2025 (two-level model), built from the national conversion table per QĐ 19/2025/QĐ-TTg.",
    sources: [
      "Quyết định 19/2025/QĐ-TTg — Danh mục và mã số đơn vị hành chính Việt Nam",
      "34 Nghị quyết của Ủy ban Thường vụ Quốc hội về sắp xếp đơn vị hành chính cấp xã (2025)",
      "Đối chiếu đơn vị hành chính cấp Xã 01/09/2024 → 01/07/2025 (formerNames, gồm các đợt sắp xếp 2023–2024)",
      "Tổng cục Thống kê — danhmuchanhchinh.nso.gov.vn"
    ]
  };
}
