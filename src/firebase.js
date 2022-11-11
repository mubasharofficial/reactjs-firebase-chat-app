// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDsvbyB73rzBLMfTSYrw_0gHuC7A8t7FQ0",
  authDomain: "reactchatapp-54a83.firebaseapp.com",
  projectId: "reactchatapp-54a83",
  storageBucket: "reactchatapp-54a83.appspot.com",
  messagingSenderId: "2404812388",
  appId: "1:2404812388:web:1462ebd2ef1aac135ec171"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
