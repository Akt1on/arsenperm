import type { Service } from "./site-data";

const serviceImages = [
  { keywords: ["асфальт", "дорога", "дорож"], src: "/assets/services/asphalt.svg" },
  { keywords: ["плитка", "тротуар", "укладка"], src: "/assets/services/tiling.svg" },
  { keywords: ["демонтаж", "снос", "разбор"], src: "/assets/services/demolition.svg" },
  { keywords: ["земляные", "земляные работы", "котлован", "рытье"], src: "/assets/services/earthworks.svg" },
  { keywords: ["техника", "спецтехника", "экскаватор", "каток", "самосвал"], src: "/assets/services/equipment.svg" },
];

export function getServiceImageUrl(service: Service) {
  if (service.image_url?.trim()) return service.image_url;
  const text = `${service.slug} ${service.title}`.toLowerCase();
  const match = serviceImages.find((item) => item.keywords.some((keyword) => text.includes(keyword)));
  return match?.src ?? "/assets/services/general.svg";
}
