/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { type Creation } from '../types';

const DB_NAME = 'LuminescenceDB';
const DB_VERSION = 2; // Bumped version to add session store
const STORE_NAME = 'creations';
const SESSION_STORE_NAME = 'session';

let db: IDBDatabase | null = null;
let dbPromise: Promise<IDBDatabase> | null = null;

const initDB = (): Promise<IDBDatabase> => {
    if (db) {
        return Promise.resolve(db);
    }
    if (dbPromise) {
        return dbPromise;
    }

    dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error('IndexedDB error:', request.error);
            dbPromise = null; // Reset promise on error so we can retry
            reject('Error opening database');
        };

        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const tempDb = (event.target as IDBOpenDBRequest).result;
            
            // Creations Store
            if (!tempDb.objectStoreNames.contains(STORE_NAME)) {
                const objectStore = tempDb.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                objectStore.createIndex('type', 'type', { unique: false });
                objectStore.createIndex('createdAt', 'createdAt', { unique: false });
            }

            // Session Store
            if (!tempDb.objectStoreNames.contains(SESSION_STORE_NAME)) {
                tempDb.createObjectStore(SESSION_STORE_NAME);
            }
        };
    });
    
    return dbPromise;
};

export const addCreation = async (creation: Creation): Promise<void> => {
    try {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.add(creation);

            request.onsuccess = () => resolve();
            request.onerror = () => {
                console.error('Error adding creation:', request.error);
                reject('Could not add creation to the database');
            };
        });
    } catch (e) {
        console.error("DB Initialization failed", e);
        throw e;
    }
};

export const getAllCreations = async (): Promise<Creation[]> => {
    try {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => {
                // Sort by most recent first
                const sorted = request.result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
                resolve(sorted);
            };
            request.onerror = () => {
                console.error('Error getting all creations:', request.error);
                reject('Could not retrieve creations from the database');
            };
        });
    } catch (e) {
        console.error("DB Initialization failed", e);
        return [];
    }
};

export const getRecentCreations = async (limit: number = 4): Promise<Creation[]> => {
    try {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const index = store.index('createdAt');
            const request = index.openCursor(null, 'prev'); // Iterate backwards (newest first)
            
            const results: Creation[] = [];

            request.onsuccess = (event) => {
                const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
                if (cursor && results.length < limit) {
                    results.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(results);
                }
            };
            
            request.onerror = () => {
                console.error('Error getting recent creations:', request.error);
                reject('Could not retrieve recent creations');
            };
        });
    } catch (e) {
        console.error("DB Initialization failed", e);
        return [];
    }
};

export const deleteCreation = async (id: number): Promise<void> => {
    try {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => {
                console.error('Error deleting creation:', request.error);
                reject('Could not delete creation from the database');
            };
        });
    } catch (e) {
        console.error("DB Initialization failed", e);
        throw e;
    }
};

// --- Session Management Functions ---

export const saveSession = async (sessionData: any): Promise<void> => {
    try {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(SESSION_STORE_NAME, 'readwrite');
            const store = transaction.objectStore(SESSION_STORE_NAME);
            const request = store.put(sessionData, 'current'); // Use a fixed key 'current'

            request.onsuccess = () => resolve();
            request.onerror = () => {
                console.error('Error saving session:', request.error);
                reject('Could not save session');
            };
        });
    } catch (e) {
        console.error("DB Initialization failed", e);
    }
};

export const getSession = async (): Promise<any> => {
    try {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(SESSION_STORE_NAME, 'readonly');
            const store = transaction.objectStore(SESSION_STORE_NAME);
            const request = store.get('current');

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => {
                console.error('Error loading session:', request.error);
                reject('Could not load session');
            };
        });
    } catch (e) {
        console.error("DB Initialization failed", e);
        return null;
    }
};

export const clearSession = async (): Promise<void> => {
    try {
        const db = await initDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(SESSION_STORE_NAME, 'readwrite');
            const store = transaction.objectStore(SESSION_STORE_NAME);
            const request = store.delete('current');

            request.onsuccess = () => resolve();
            request.onerror = () => {
                console.error('Error clearing session:', request.error);
                reject('Could not clear session');
            };
        });
    } catch (e) {
        console.error("DB Initialization failed", e);
    }
};