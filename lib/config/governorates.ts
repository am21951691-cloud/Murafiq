export interface GovernorateInfo {
  key: string;
  name_ar: string;
  name_en: string;
  region: "GREATER_CAIRO" | "ALEXANDRIA_DELTA" | "CANAL_SINAI" | "UPPER_EGYPT" | "BORDER";
}

/**
 * Official Egyptian Governorates (محافظات جمهورية مصر العربية الـ 27)
 */
export const EGYPTIAN_GOVERNORATES: GovernorateInfo[] = [
  // 1. Greater Cairo (القاهرة الكبرى)
  { key: "CAIRO", name_ar: "القاهرة", name_en: "Cairo", region: "GREATER_CAIRO" },
  { key: "GIZA", name_ar: "الجيزة", name_en: "Giza", region: "GREATER_CAIRO" },
  { key: "QALYUBIA", name_ar: "القليوبية", name_en: "Qalyubia", region: "GREATER_CAIRO" },

  // 2. Alexandria & Nile Delta (الإسكندرية والوجه البحري والدلتا)
  { key: "ALEXANDRIA", name_ar: "الإسكندرية", name_en: "Alexandria", region: "ALEXANDRIA_DELTA" },
  { key: "BEHEIRA", name_ar: "البحيرة", name_en: "Beheira", region: "ALEXANDRIA_DELTA" },
  { key: "MATROUH", name_ar: "مطروح", name_en: "Matrouh", region: "BORDER" },
  { key: "DAKAHLIA", name_ar: "الدقهلية", name_en: "Dakahlia", region: "ALEXANDRIA_DELTA" },
  { key: "GHARBIA", name_ar: "الغربية", name_en: "Gharbia", region: "ALEXANDRIA_DELTA" },
  { key: "MONUFIA", name_ar: "المنوفية", name_en: "Monufia", region: "ALEXANDRIA_DELTA" },
  { key: "KAFR_EL_SHEIKH", name_ar: "كفر الشيخ", name_en: "Kafr El Sheikh", region: "ALEXANDRIA_DELTA" },
  { key: "SHARQIA", name_ar: "الشرقية", name_en: "Sharqia", region: "ALEXANDRIA_DELTA" },
  { key: "DAMIETTA", name_ar: "دمياط", name_en: "Damietta", region: "ALEXANDRIA_DELTA" },

  // 3. Suez Canal & Sinai (مدن القناة وسيناء)
  { key: "PORT_SAID", name_ar: "بورسعيد", name_en: "Port Said", region: "CANAL_SINAI" },
  { key: "ISMAILIA", name_ar: "الإسماعيلية", name_en: "Ismailia", region: "CANAL_SINAI" },
  { key: "SUEZ", name_ar: "السويس", name_en: "Suez", region: "CANAL_SINAI" },
  { key: "NORTH_SINAI", name_ar: "شمال سيناء", name_en: "North Sinai", region: "CANAL_SINAI" },
  { key: "SOUTH_SINAI", name_ar: "جنوب سيناء", name_en: "South Sinai", region: "CANAL_SINAI" },
  { key: "RED_SEA", name_ar: "البحر الأحمر", name_en: "Red Sea", region: "CANAL_SINAI" },

  // 4. Upper Egypt & Frontier (شمال وجنوب الصعيد والحدود)
  { key: "FAIYUM", name_ar: "الفيوم", name_en: "Faiyum", region: "UPPER_EGYPT" },
  { key: "BENI_SUEF", name_ar: "بني سويف", name_en: "Beni Suef", region: "UPPER_EGYPT" },
  { key: "MINYA", name_ar: "المنيا", name_en: "Minya", region: "UPPER_EGYPT" },
  { key: "ASYUT", name_ar: "أسيوط", name_en: "Asyut", region: "UPPER_EGYPT" },
  { key: "SOHAG", name_ar: "سوهاج", name_en: "Sohag", region: "UPPER_EGYPT" },
  { key: "QENA", name_ar: "قنا", name_en: "Qena", region: "UPPER_EGYPT" },
  { key: "LUXOR", name_ar: "الأقصر", name_en: "Luxor", region: "UPPER_EGYPT" },
  { key: "ASWAN", name_ar: "أسوان", name_en: "Aswan", region: "UPPER_EGYPT" },
  { key: "NEW_VALLEY", name_ar: "الوادي الجديد", name_en: "New Valley", region: "BORDER" },
];

export const ALL_EGYPTIAN_GOVERNORATES_AR: string[] = EGYPTIAN_GOVERNORATES.map((g) => g.name_ar);
