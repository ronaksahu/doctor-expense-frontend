// src/utils/fullDataLoad.js
import { apiFetch } from "./apiFetch";
import { dbPromise } from "./db";
import { BASE_URL } from "./constants";

export async function fullDataLoad() {
  const token = localStorage.getItem("doctor_token");
  const res = await apiFetch(`${BASE_URL}/doctor/fullDataLoad`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to load all data");
  const data = await res.json();
  const db = await dbPromise;
  await db.clear("clinics");
  await db.clear("expenses");
  await db.clear("payments");
  for (const clinic of data.clinics) await db.put("clinics", clinic);
  for (const expense of data.expenses) await db.put("expenses", expense);
  for (const payment of data.payments) await db.put("payments", payment);
  // Clear the queue after successful sync
  await db.clear("queue");
  await db.clear("clinicNameList");
  // Save clinicIdNameList to IndexedDB if present
  if (data.clinicIdNameList && Array.isArray(data.clinicIdNameList)) {
    for (const clinicData of data.clinicIdNameList) {
      await db.put("clinicNameList", clinicData);
    }
  }
  return data;
}
