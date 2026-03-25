import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAeXXu8wljtXR_5y0iNnDELXNQHvnoR1YI",
  authDomain: "igreja-batista-medaberel-ed528.firebaseapp.com",
  projectId: "igreja-batista-medaberel-ed528",
  storageBucket: "igreja-batista-medaberel-ed528.firebasestorage.app",
  messagingSenderId: "674589446512",
  appId: "1:674589446512:web:57ce01c9beeab495b33fb5"
};

const firebaseReady = Object.values(firebaseConfig).every(
  (value) => typeof value === "string" && value.length > 0 && !value.startsWith("SEU_") && !value.startsWith("SUA_")
);

let app = null;
let db = null;
let auth = null;

if (firebaseReady) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

export { app, auth, db, firebaseReady };