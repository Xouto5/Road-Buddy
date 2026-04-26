/*

Author: Nathan Rochel                               
Date: 4/23/2026

Description: Trip services that allow users to save, delete, or update a trip.

*/

import { db, auth } from "../../../core/firebase/firebaseConfig"; 
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const saveTrip = async (tripData) => {

  try {

    const tripsRef = collection(db, "trips");

    const currentUser = auth.currentUser;

    const docRef = await addDoc(tripsRef, {
      ...tripData,            
      userId: currentUser.uid,         
      createdAt: serverTimestamp(),
    });

    return { success: true, id: docRef.id };

  } catch (error) {

    console.error("Error saving trip:", error);
    return { success: false, error: error.message };

  }

};