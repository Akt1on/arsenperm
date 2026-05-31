import p1 from "@/assets/portfolio-1.jpg";
import p2 from "@/assets/portfolio-2.jpg";
import p3 from "@/assets/portfolio-3.jpg";
import p4 from "@/assets/portfolio-4.jpg";
import p5 from "@/assets/portfolio-5.jpg";
import p6 from "@/assets/portfolio-6.jpg";

export type GalleryItem = {
  src: string;
  title: string;
  category: string;
  categoryLabel: string;
  year: number;
};

export const GALLERY: GalleryItem[] = [
  { src: p1, title: "Асфальтирование промышленной территории", category: "asfalt", categoryLabel: "Асфальтирование", year: 2024 },
  { src: p2, title: "Мощение тротуарной плитки во дворе", category: "plitka", categoryLabel: "Тротуарная плитка", year: 2024 },
  { src: p3, title: "Демонтаж производственного здания", category: "demontazh", categoryLabel: "Демонтаж", year: 2023 },
  { src: p4, title: "Земляные работы под фундамент", category: "zemlya", categoryLabel: "Земляные работы", year: 2024 },
  { src: p5, title: "Доставка щебня на объект", category: "materialy", categoryLabel: "Доставка материалов", year: 2025 },
  { src: p6, title: "Уборка снега с парковки ТЦ", category: "sneg", categoryLabel: "Уборка снега", year: 2025 },
  { src: p1, title: "Дорожные работы в Перми", category: "asfalt", categoryLabel: "Асфальтирование", year: 2024 },
  { src: p2, title: "Зона отдыха с брусчаткой", category: "plitka", categoryLabel: "Тротуарная плитка", year: 2023 },
];

export const GALLERY_FILTERS = [
  { id: "all", label: "Все работы" },
  { id: "asfalt", label: "Асфальтирование" },
  { id: "plitka", label: "Тротуарная плитка" },
  { id: "demontazh", label: "Демонтаж" },
  { id: "zemlya", label: "Земляные работы" },
  { id: "materialy", label: "Материалы" },
  { id: "sneg", label: "Снег" },
];
