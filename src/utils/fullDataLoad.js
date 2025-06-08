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
  // Build a map of clinic_id to name from clinics and clinicIdNameList
  const clinicIdNameMap = {};
  if (Array.isArray(data.clinics)) {
    for (const c of data.clinics) clinicIdNameMap[c.id] = c.name;
  }
  if (Array.isArray(data.clinicIdNameList)) {
    for (const c of data.clinicIdNameList) clinicIdNameMap[c.id] = c.name;
  }
  // Store expenses with clinic_name
  for (const expense of data.expenses) {
    let clinic_name = "";
    if (expense.clinic_name) {
      clinic_name = expense.clinic_name;
    } else if (expense.clinic && expense.clinic.name) {
      clinic_name = expense.clinic.name;
    } else if (clinicIdNameMap[expense.clinic_id]) {
      clinic_name = clinicIdNameMap[expense.clinic_id];
    }
    await db.put("expenses", { ...expense, clinic_name });
  }
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
