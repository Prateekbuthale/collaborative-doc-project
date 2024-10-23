import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyD3-TXlS9gmsIoWRgxtWYhQekEgbZTyn5g",
    authDomain: "collaborative-doc-de7ec.firebaseapp.com",
    projectId: "collaborative-doc-de7ec",
    storageBucket: "collaborative-doc-de7ec.appspot.com",
    messagingSenderId: "823640933038",
    appId: "1:823640933038:web:2840cf06ded7814c72e33f",
    measurementId: "G-9J1DBFMZWF"
  };

  const app = initializeApp(firebaseConfig);

  // Initialize Firestore and Auth
  const database = getFirestore(app); // Correct Firestore initialization
  const auth = getAuth(app);
  const storage = getStorage(app); // Create a storage instance


export { app, auth, database, storage };
