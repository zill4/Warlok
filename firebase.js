import firebase from "firebase/app"
import "firebase/auth"
import "firebase/database";
import "firebase/firestore";
import "firebase/storage";


const FirebaseCredentials = {
  apiKey: process.env.NEXT_PUBLIC_REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_REACT_APP_FIREBASE_MEASUREMENT_ID
}

if (!firebase.apps.length)
{
    firebase.initializeApp(FirebaseCredentials)
}

export const auth = firebase.auth()
export const database = firebase.database();
export const firestore = firebase.firestore();
export const storage = firebase.storage();
export default firebase;    