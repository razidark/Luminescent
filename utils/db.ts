
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

const initDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        if (db) {
            return resolve(db);
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error('IndexedDB error:', request.error);
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
};

export const addCreation = async (creation: Creation): Promise<void> => {
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
};

export const getAllCreations = async (): Promise<Creation[]> => {
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
};

export const deleteCreation = async (id: number): Promise<void> => {
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
};

// --- Session Management Functions ---

export const saveSession = async (sessionData: any): Promise<void> => {
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
};

export const getSession = async (): Promise<any> => {
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
};

export const clearSession = async (): Promise<void> => {
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
};
