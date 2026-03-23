import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD_f_Fk7XvwOIeedi_j88q-8KmThooo6SU",
  authDomain: "igreja-batista-medaberel-faf32.firebaseapp.com",
  projectId: "igreja-batista-medaberel-faf32",
  storageBucket: "igreja-batista-medaberel-faf32.firebasestorage.app",
  messagingSenderId: "147835059386",
  appId: "1:147835059386:web:66cacb26841136ea905683"
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