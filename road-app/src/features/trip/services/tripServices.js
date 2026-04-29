/*

Author: Nathan Rochel                               
Date: 4/23/2026

Description: Trip services that allow users to save and delete a trip.

*/

import { db, auth } from "../../../core/firebase/firebaseConfig"; 
import { doc, collection, addDoc, setDoc, serverTimestamp } from "firebase/firestore";

export const saveTrip = async (tripData, tripId = null) => {

  try {

    const currentUser = auth.currentUser;

    if (tripId) {
      //Editing trip information.
      const tripRef = doc(db, "trips", tripId);
      
      await setDoc(tripRef, {

        ...tripData,
        userId: currentUser.uid,
        updatedAt: serverTimestamp() //Track when the trip was edited.

      }, { merge: true });

      return { success: true, id: tripId };

    } else {
      //Saving a new trip.
      const tripsRef = collection(db, "trips");

      const docRef = await addDoc(tripsRef, {

        ...tripData,
        userId: currentUser.uid,
        createdAt: serverTimestamp() //Track when the trip was created.

      });

      return { success: true, id: docRef.id };
      
    }

  } catch (error) {

    console.error("Error saving/updating trip:", error);
    return { success: false, error: error.message };

  }

};