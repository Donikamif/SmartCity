import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAUTDxMQkCojDOrNeA_wZYwIsc6b9Ix6Ag",
  authDomain: "smart-city-e0410.firebaseapp.com",
  projectId: "smart-city-e0410",
  storageBucket: "smart-city-e0410.firebasestorage.app",
  messagingSenderId: "593835538322",
  appId: "1:593835538322:web:426aa587438674e9fa734b",
  measurementId: "G-MP30JHD6M0"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app); // Export Auth instance

export default app;