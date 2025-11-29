import { fetchTitles, fetchHeroItem } from "@/shared/api/titles";

export async function getHeroItem() {
  const titles = await fetchTitles();

  const randomIndex = Math.floor(Math.random() * titles.length);

  const randomId = titles[randomIndex]._id;

  const heroItem = await fetchHeroItem("68b4f29e718e64204c2260ef");

  return heroItem;
}
