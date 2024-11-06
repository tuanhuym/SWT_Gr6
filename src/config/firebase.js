// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { GoogleAuthProvider } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBWgOjwVfHhxjdJwodzbvjw7oV4fu0AyLY",
  authDomain: "student-management-6ebff.firebaseapp.com",
  projectId: "student-management-6ebff",
  storageBucket: "student-management-6ebff.appspot.com",
  messagingSenderId: "805673427245",
  appId: "1:805673427245:web:ec8b89b003251b62eb73a4",
  measurementId: "G-DXT3KWG723",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export { storage, googleProvider };
