// Core IndexedDB service — persistent client-side database for the election portal
const DB_NAME = 'zambia_election_db';
const DB_VERSION = 1;

export type StoreName =
  | 'users'
  | 'sessions'
  | 'results'
  | 'verifications'
  | 'ecz_figures'
  | 'audit_log'
  | 'sync_queue'
  | 'notifications';

interface StoreConfig {
  name: StoreName;
  keyPath: string;
  indexes?: { name: string; keyPath: string | string[]; unique?: boolean }[];
}

const STORES: StoreConfig[] = [
  {
    name: 'users',
    keyPath: 'id',
    indexes: [
      { name: 'by_username', keyPath: 'username', unique: true },
      { name: 'by_role', keyPath: 'role' },
      { name: 'by_scope', keyPath: 'scope' },
    ],
  },
  {
    name: 'sessions',
    keyPath: 'token',
    indexes: [
      { name: 'by_userId', keyPath: 'userId' },
      { name: 'by_expiry', keyPath: 'expiresAt' },
    ],
  },
  {
    name: 'results',
    keyPath: 'id',
    indexes: [
      { name: 'by_pollingStation', keyPath: 'pollingStationId', unique: false },
      { name: 'by_ward', keyPath: 'wardId' },
      { name: 'by_constituency', keyPath: 'constituencyId' },
      { name: 'by_district', keyPath: 'districtId' },
      { name: 'by_province', keyPath: 'provinceId' },
      { name: 'by_electionType', keyPath: 'electionType' },
      { name: 'by_status', keyPath: 'status' },
      { name: 'by_submittedAt', keyPath: 'submittedAt' },
    ],
  },
  {
    name: 'verifications',
    keyPath: 'id',
    indexes: [
      { name: 'by_levelId', keyPath: 'levelId' },
      { name: 'by_levelType', keyPath: 'levelType' },
      { name: 'by_electionType', keyPath: 'electionType' },
      { name: 'by_status', keyPath: 'status' },
      { name: 'by_officerId', keyPath: 'officerId' },
    ],
  },
  {
    name: 'ecz_figures',
    keyPath: 'id',
    indexes: [
      { name: 'by_levelId', keyPath: 'levelId' },
      { name: 'by_levelType', keyPath: 'levelType' },
      { name: 'by_electionType', keyPath: 'electionType' },
    ],
  },
  {
    name: 'audit_log',
    keyPath: 'id',
    indexes: [
      { name: 'by_userId', keyPath: 'userId' },
      { name: 'by_action', keyPath: 'action' },
      { name: 'by_entity', keyPath: 'entity' },
      { name: 'by_entityId', keyPath: 'entityId' },
      { name: 'by_timestamp', keyPath: 'timestamp' },
    ],
  },
  {
    name: 'sync_queue',
    keyPath: 'id',
    indexes: [
      { name: 'by_status', keyPath: 'status' },
      { name: 'by_priority', keyPath: 'priority' },
      { name: 'by_createdAt', keyPath: 'createdAt' },
    ],
  },
  {
    name: 'notifications',
    keyPath: 'id',
    indexes: [
      { name: 'by_userId', keyPath: 'userId' },
      { name: 'by_read', keyPath: 'read' },
      { name: 'by_type', keyPath: 'type' },
      { name: 'by_createdAt', keyPath: 'createdAt' },
    ],
  },
];

class IndexedDbService {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<IDBDatabase> | null = null;

  async init(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        for (const store of STORES) {
          if (!db.objectStoreNames.contains(store.name)) {
            const objectStore = db.createObjectStore(store.name, { keyPath: store.keyPath });
            for (const idx of store.indexes ?? []) {
              objectStore.createIndex(idx.name, idx.keyPath, { unique: idx.unique ?? false });
            }
          }
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        reject((event.target as IDBOpenDBRequest).error);
      };
    });

    return this.initPromise;
  }

  private async getDb(): Promise<IDBDatabase> {
    return this.db ?? (await this.init());
  }

  async get<T>(store: StoreName, key: IDBValidKey): Promise<T | undefined> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, 'readonly');
      const req = tx.objectStore(store).get(key);
      req.onsuccess = () => resolve(req.result as T);
      req.onerror = () => reject(req.error);
    });
  }

  async getByIndex<T>(store: StoreName, indexName: string, value: IDBValidKey): Promise<T[]> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, 'readonly');
      const idx = tx.objectStore(store).index(indexName);
      const req = idx.getAll(value);
      req.onsuccess = () => resolve(req.result as T[]);
      req.onerror = () => reject(req.error);
    });
  }

  async getAll<T>(store: StoreName): Promise<T[]> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, 'readonly');
      const req = tx.objectStore(store).getAll();
      req.onsuccess = () => resolve(req.result as T[]);
      req.onerror = () => reject(req.error);
    });
  }

  async put<T extends object>(store: StoreName, value: T): Promise<IDBValidKey> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, 'readwrite');
      const req = tx.objectStore(store).put(value);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async putMany<T extends object>(store: StoreName, values: T[]): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, 'readwrite');
      const objectStore = tx.objectStore(store);
      for (const value of values) {
        objectStore.put(value);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async delete(store: StoreName, key: IDBValidKey): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, 'readwrite');
      const req = tx.objectStore(store).delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async count(store: StoreName): Promise<number> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, 'readonly');
      const req = tx.objectStore(store).count();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async countByIndex(store: StoreName, indexName: string, value: IDBValidKey): Promise<number> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, 'readonly');
      const req = tx.objectStore(store).index(indexName).count(value);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async clear(store: StoreName): Promise<void> {
    const db = await this.getDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, 'readwrite');
      const req = tx.objectStore(store).clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async query<T>(
    store: StoreName,
    filter: (item: T) => boolean,
    limit?: number
  ): Promise<T[]> {
    const all = await this.getAll<T>(store);
    const filtered = all.filter(filter);
    return limit ? filtered.slice(0, limit) : filtered;
  }
}

export const db = new IndexedDbService();
