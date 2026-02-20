const DB = "steadfast_v1";
const VER = 1;
export const STORES = { entries: "entries", profile: "profile", snapshots: "snapshots" };

export function idb() {
  return new Promise((ok, fail) => {
    const r = indexedDB.open(DB, VER);
    r.onupgradeneeded = (e) => {
      const d = e.target.result;
      if (!d.objectStoreNames.contains(STORES.entries)) {
        const s = d.createObjectStore(STORES.entries, { keyPath: "id" });
        s.createIndex("date", "date");
      }
      if (!d.objectStoreNames.contains(STORES.profile))
        d.createObjectStore(STORES.profile, { keyPath: "key" });
      if (!d.objectStoreNames.contains(STORES.snapshots))
        d.createObjectStore(STORES.snapshots, { keyPath: "id" });
    };
    r.onsuccess = () => ok(r.result);
    r.onerror = () => fail(r.error);
  });
}

export async function put(s, d) {
  const db = await idb();
  return new Promise((ok, f) => {
    const t = db.transaction(s, "readwrite");
    t.objectStore(s).put(d);
    t.oncomplete = () => ok();
    t.onerror = () => f(t.error);
  });
}

export async function getAll(s) {
  const db = await idb();
  return new Promise((ok, f) => {
    const r = db.transaction(s, "readonly").objectStore(s).getAll();
    r.onsuccess = () => ok(r.result);
    r.onerror = () => f(r.error);
  });
}

export async function get(s, k) {
  const db = await idb();
  return new Promise((ok, f) => {
    const r = db.transaction(s, "readonly").objectStore(s).get(k);
    r.onsuccess = () => ok(r.result);
    r.onerror = () => f(r.error);
  });
}

export async function del(s, k) {
  const db = await idb();
  return new Promise((ok, f) => {
    const t = db.transaction(s, "readwrite");
    t.objectStore(s).delete(k);
    t.oncomplete = () => ok();
    t.onerror = () => f(t.error);
  });
}
