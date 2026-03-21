import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import type { ButtonType } from "../constants/buttons";
import type { Unsubscribe } from "firebase/firestore";

export type ReportItem = {
  id: string;
  name: string;
  category: ButtonType;
  report: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  /** true = usuário ainda está enviando localização; false ou undefined = parou ou nunca enviou em tempo real */
  locationUpdatesActive?: boolean;
  /** Preenchido quando o usuário para o envio de localização (para notificar o policial) */
  locationStoppedAt?: Date | null;
};

function parseTimestamp(v: unknown): Date | null {
  if (!v || typeof v !== "object") return null;
  const o = v as { seconds?: number; toDate?: () => Date };
  if (typeof o.toDate === "function") return o.toDate();
  if (typeof o.seconds === "number") return new Date(o.seconds * 1000);
  return null;
}

export function subscribeReports(
  callback: (reports: ReportItem[]) => void
): Unsubscribe {
  const unsubscribe = onSnapshot(collection(db, "data"), (querySnapshot) => {
    const reports: ReportItem[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      reports.push({
        id: docSnap.id,
        name: data.name,
        category: data.category,
        report: data.report,
        address: data.address,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        locationUpdatesActive: data.locationUpdatesActive ?? false,
        locationStoppedAt: parseTimestamp(data.locationStoppedAt),
      });
    });
    callback(reports);
  });

  return unsubscribe;
}
