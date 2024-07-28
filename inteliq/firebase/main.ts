// Import the functions you need from the SDKs you need
import { initializeApp, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// https://firebase.google.com/docs/web/setup#available-libraries

function initializeAppIfNecessary() {
  try {
    return getApp();
  } catch (any) {
    const firebaseConfig = {
      apiKey: "",
      authDomain: "",
      projectId: "",
      storageBucket: "",
      messagingSenderId: "",
      appId: "",
      measurementId: "",
    };
    return initializeApp(firebaseConfig);
  }
}
// if a Firebase instance doesn't exist, create one
const app = initializeAppIfNecessary();
if (typeof window !== "undefined") {
  getAnalytics(app);
}
export const storage = getStorage(app);
export const db = getFirestore(app);
export const auth = getAuth(app);