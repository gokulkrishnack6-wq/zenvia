/// <reference types="vite/client" />
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import firebaseAppletConfig from "../../firebase-applet-config.json";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseAppletConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseAppletConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseAppletConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseAppletConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseAppletConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || firebaseAppletConfig.appId,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Use custom firestore database ID if specified in config, else default
export const db = firebaseAppletConfig.firestoreDatabaseId && firebaseAppletConfig.firestoreDatabaseId !== "(default)"
  ? getFirestore(app, firebaseAppletConfig.firestoreDatabaseId)
  : getFirestore(app);

export default app;
