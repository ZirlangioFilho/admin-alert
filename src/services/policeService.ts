import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import type { Unsubscribe } from "firebase/firestore";
import { db } from "../firebase";

export type PoliceItem = {
  uid: string;
  name: string;
  email: string;
  phone: string;
};

export function subscribePolice(callback: (police: PoliceItem[]) => void): Unsubscribe {
  const q = query(
    collection(db, "users"),
    where("role", "==", "police")
  );
  return onSnapshot(q, (snapshot) => {
    const items: PoliceItem[] = [];
    snapshot.forEach((docSnap) => {
      const d = docSnap.data();
      items.push({
        uid: docSnap.id,
        name: d.name ?? "",
        email: d.email ?? "",
        phone: d.phone ?? "",
      });
    });
    items.sort((a, b) => a.name.localeCompare(b.name));
    callback(items);
  });
}

export async function updatePolice(
  uid: string,
  data: { name?: string; email?: string; phone?: string }
): Promise<void> {
  const ref = doc(db, "users", uid);
  const payload: Record<string, string> = {};
  if (data.name !== undefined) payload.name = data.name;
  if (data.email !== undefined) payload.email = data.email;
  if (data.phone !== undefined) payload.phone = data.phone;
  if (Object.keys(payload).length > 0) {
    await updateDoc(ref, payload);
  }
}

export async function deletePolice(uid: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid));
}
