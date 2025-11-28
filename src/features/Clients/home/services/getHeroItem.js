import { fetchHeroItem } from "@/shared/api/titles";

export async function getHeroItem() {
  const raw = await fetchHeroItem("68b4f2fe718e64204c2260fb");
  return raw;
}
