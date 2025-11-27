import { useEffect, useState } from "react";

const MYLIST_KEY = "pf_mylist";
const FAVS_KEY = "pf_favorites";

function read(key) {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
}
function write(key, arr) {
  localStorage.setItem(key, JSON.stringify(arr));
  window.dispatchEvent(new CustomEvent("pf:shelf-changed", { detail: { key } }));
}
function upsert(arr, item) {
  const i = arr.findIndex(x => x.id === item.id);
  if (i >= 0) { arr[i] = item; return [...arr]; }
  return [item, ...arr];
}
function removeById(arr, id) { return arr.filter(x => x.id !== id); }

export function useShelfItem(item) {
  const id = item?.id;
  const [inList, setInList] = useState(false);
  const [isFav, setIsFav] = useState(false);

  const refresh = () => {
    if (!id) return;
    setInList(read(MYLIST_KEY).some(x => x.id === id));
    setIsFav(read(FAVS_KEY).some(x => x.id === id));
  };

  useEffect(refresh, [id]);

  useEffect(() => {
    const fn = () => refresh();
    window.addEventListener("pf:shelf-changed", fn);
    window.addEventListener("storage", fn);
    return () => {
      window.removeEventListener("pf:shelf-changed", fn);
      window.removeEventListener("storage", fn);
    };
  }, [id]);

  function toggleList() {
    const arr = read(MYLIST_KEY);
    const exists = arr.some(x => x.id === id);
    write(MYLIST_KEY, exists ? removeById(arr, id) : upsert(arr, item));
    setInList(!exists);
  }
  function toggleFav() {
    const arr = read(FAVS_KEY);
    const exists = arr.some(x => x.id === id);
    write(FAVS_KEY, exists ? removeById(arr, id) : upsert(arr, item));
    setIsFav(!exists);
  }

  return { inList, isFav, toggleList, toggleFav };
}
