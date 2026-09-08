import type { PresentationDocument } from "./presentation-schema";

const DATABASE_NAME = "vibe-ppt-storage";
const STORE_NAME = "documents";
const DOCUMENT_KEY = "current";
const BACKUP_KEY = "backup";
const LOCAL_STORAGE_KEY = "vibe-ppt-document";

type StoredDocument = { value: PresentationDocument; savedAt: string };

function canUseIndexedDb() {
  return typeof window !== "undefined" && typeof window.indexedDB !== "undefined";
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DATABASE_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("无法打开本地文档存储"));
  });
}

function readFromStore<T>(db: IDBDatabase, key: IDBValidKey): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(key);
    request.onsuccess = () => resolve(request.result as T | undefined);
    request.onerror = () => reject(request.error || new Error("无法读取本地文档"));
  });
}

function writeToStore(db: IDBDatabase, entries: Array<[IDBValidKey, unknown]>): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    for (const [key, value] of entries) store.put(value, key);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error("无法保存本地文档"));
    transaction.onabort = () => reject(transaction.error || new Error("本地文档保存已取消"));
  });
}

export async function loadPersistedDocumentCandidates(): Promise<PresentationDocument[]> {
  if (typeof window === "undefined") return [];
  if (canUseIndexedDb()) {
    try {
      const db = await openDatabase();
      const current = await readFromStore<StoredDocument>(db, DOCUMENT_KEY);
      const backup = await readFromStore<StoredDocument>(db, BACKUP_KEY);
      db.close();
      const candidates = [current?.value, backup?.value].filter(Boolean) as PresentationDocument[];
      if (candidates.length > 0) return candidates;
      // An empty IndexedDB can exist after an interrupted migration. Try the legacy copy.
    } catch {
      // Fall through to the legacy localStorage copy. A storage failure must not delete it.
    }
  }
  const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
  return raw ? [JSON.parse(raw) as PresentationDocument] : [];
}

export async function loadPersistedDocument(): Promise<PresentationDocument | undefined> {
  return (await loadPersistedDocumentCandidates())[0];
}

export async function savePersistedDocument(document: PresentationDocument): Promise<void> {
  if (typeof window === "undefined") return;
  const entry: StoredDocument = { value: structuredClone(document), savedAt: new Date().toISOString() };
  if (canUseIndexedDb()) {
    try {
      const db = await openDatabase();
      const current = await readFromStore<StoredDocument>(db, DOCUMENT_KEY);
      await writeToStore(db, [
        [BACKUP_KEY, current || entry],
        [DOCUMENT_KEY, entry],
      ]);
      db.close();
      // Keep a migration copy until IndexedDB has successfully accepted the document.
      try {
        window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(document));
      } catch {
        // IndexedDB is the primary copy; localStorage may be full or unavailable.
      }
      return;
    } catch {
      // Use localStorage as a recoverable fallback below.
    }
  }
  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(document));
}

export function clearLegacyDocumentCopy() {
  if (typeof window !== "undefined") window.localStorage.removeItem(LOCAL_STORAGE_KEY);
}

export const DOCUMENT_PERSISTENCE_KEY = LOCAL_STORAGE_KEY;
