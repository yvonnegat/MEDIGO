//../firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage'; 

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBdfihaOdZZQuNMW65gLg00kHRI0LUkJ34",
  authDomain: "onlineshop-90370.firebaseapp.com",
  projectId: "onlineshop-90370",
  storageBucket: "onlineshop-90370.appspot.com",
  messagingSenderId: "567240158054",
  appId: "1:567240158054:web:6d8b775a3f037739dab6a7",
  measurementId: "G-N7MV22HRQW"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
export const storage = getStorage(app); 

export { auth, db };
