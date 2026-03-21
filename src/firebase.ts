import { getApp, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/** Nome da app secundária: criar usuários (policial) sem trocar a sessão do admin na app principal. */
export const SECONDARY_APP_NAME = "admin-alert-secondary-auth";

const firebaseConfig = {
  // Aceita VITE_* e EXPO_PUBLIC_* para facilitar ambientes iniciais.
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? import.meta.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? import.meta.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID ?? import.meta.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ??
    import.meta.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ??
    import.meta.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? import.meta.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId:
    import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ??
    import.meta.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

if (!firebaseConfig.apiKey) {
  throw new Error("Firebase API key ausente no admin-alert (.env).");
}

const app = initializeApp(firebaseConfig);

/** Auth principal: admin logado aqui. */
export const auth = getAuth(app);
export const db = getFirestore(app);

/** Auth secundária: só para `createUserWithEmailAndPassword` do policial (não altera quem está logado em `auth`). */
function getSecondaryApp() {
  try {
    return getApp(SECONDARY_APP_NAME);
  } catch {
    return initializeApp(firebaseConfig, SECONDARY_APP_NAME);
  }
}
export const secondaryAuth = getAuth(getSecondaryApp());

