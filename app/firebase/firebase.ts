// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore} from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDuGe5LMb77PC_wA0z8riGMZrtLec0z3js",
  authDomain: "crud-6af5e.firebaseapp.com",
  projectId: "crud-6af5e",
  storageBucket: "crud-6af5e.appspot.com",
  messagingSenderId: "502154971556",
  appId: "1:502154971556:web:e9d18ffe657943c35e9931"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)