import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc, collection, getDocs } from "firebase/firestore/lite";
import { getStorage, ref, listAll, getDownloadURL } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAuqw-UTejB_XRZmHTXRbL656RUadWuZ5Q",
  authDomain: "exam-project-89444.firebaseapp.com",
  projectId: "exam-project-89444",
  storageBucket: "exam-project-89444.appspot.com",
  messagingSenderId: "113143863692",
  appId: "1:113143863692:web:c079558dc6278e57291ea9",
  measurementId: "G-02905TKGNY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Firebase Firestore and get a reference to the service
const firestore = getFirestore(app);

// Initialize Firebase Storage and get a reference to the service
const storage = getStorage(app);

export { auth, firestore, storage, setDoc, doc, getDocs, collection, ref, listAll, getDownloadURL, app };
