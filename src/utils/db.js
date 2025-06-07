// src/utils/db.js
import { openDB } from 'idb';

export const dbPromise = openDB('doctor-expense-db', 2, { // <-- bump version
  upgrade(db) {
    if (!db.objectStoreNames.contains('clinics')) {
      db.createObjectStore('clinics', { keyPath: 'id' });
    }
    if (!db.objectStoreNames.contains('expenses')) {
      db.createObjectStore('expenses', { keyPath: 'id' });
    }
    if (!db.objectStoreNames.contains('payments')) {
      db.createObjectStore('payments', { keyPath: 'id' });
    }
    if (!db.objectStoreNames.contains('queue')) {
      db.createObjectStore('queue', { autoIncrement: true });
    }
    if (!db.objectStoreNames.contains('clinicNameList')) {
      db.createObjectStore('clinicNameList', { keyPath: 'id' });
    }
  },
});

// Debug: log clinics in cache if running in browser
typeof window !== 'undefined' && window.getAllClinicsFromCache === undefined && (window.getAllClinicsFromCache = async () => {
  const db = await dbPromise;
  const clinics = await db.getAll('clinics');
  console.log('Clinics in cache:', clinics);
  return clinics;
});

// Helper to get all items from a store
export async function getAllFromStore(store) {
  const db = await dbPromise;
  return db.getAll(store);
}
// Helper to put an item into a store
export async function putToStore(store, value) {
  const db = await dbPromise;
  return db.put(store, value);
}
// Helper to clear a store
export async function clearStore(store) {
  const db = await dbPromise;
  return db.clear(store);
}
// Helper to delete an item from a store
export async function deleteFromStore(store, key) {
  const db = await dbPromise;
  return db.delete(store, key);
}
