/* ======================================== //
CREDITS:
MANUEL: 
// ======================================== */

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // ADDED THIS
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc,
  addDoc
} from "firebase/firestore"; 

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase App
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialize Auth and EXPORT it
export const auth = getAuth(app); // ADDED THIS

// Initialize Firestore
export const db = getFirestore(app);

export const performFirestoreOperations = async (name, lastname, email, carType, phone) => {
  try {
    // Check if auth exists and has a user before accessing UID
    if (!auth?.currentUser) {
      throw new Error("No authenticated user found.");
    }

    await addDoc(collection(db, "users"), {
      firstname: name,
      lastname: lastname,
      email: email,
      carType: carType,
      phone: phone,
      isVerified: false,
      userID: auth.currentUser.uid
    });
  } catch (e) {
    console.error("Error processing Firestore operations: ", e);
  }
};

export async function getUserData(){
  if (!auth?.currentUser) return null; // Added safety check
  const q = query(collection(db, "users"), where("userID", "==", auth.currentUser.uid));
  const querySnapshot = await getDocs(q);
  return querySnapshot.empty ? null : querySnapshot.docs[0].data();
}

export async function updateUserData(updatedData) {
  try {
    if (!auth?.currentUser) throw new Error("Not authenticated");
    
    const q = query(collection(db, "users"), where("userID", "==", auth.currentUser.uid));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userDocRef = querySnapshot.docs[0].ref;
      await updateDoc(userDocRef, updatedData);
    } else {
      throw new Error("No user document found to update");
    }
  } catch (e) {
    console.error("Error updating user data: ", e);
    throw e;
  }
}

export default app;