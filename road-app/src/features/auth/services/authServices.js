import { auth } from "../../../core/firebase/firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getAuth } from "firebase/auth";
import { signOut } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";

const email = "";
const password = "";

//Sayf Aldayafleh

//Creates user through firebase, must be valid email and password must be 12 characters long
//TODO - Set and discuss password requirements
export function createUser(email, password) {
  const auth = getAuth();
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed up
      const user = userCredential.user;
      // ...
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      // ..
    });

  // onAuthStateChanged(auth, (user) => {
  //     if (user) {
  //     console.log(user.uid)
  //     } else {
  //         // User is signed out
  //         // ...
  //     }
  // });
}

//Logs in user through firebase, if sucessful returns 200 and saves user info to the auth instance
export function loginUser(email, password) {
  const auth = getAuth();
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user;
      // ...
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
    });

  //   onAuthStateChanged(auth, (user) => {
  //     if (user) {
  //     console.log(user.uid)
  //     } else {
  //         // User is signed out
  //         // ...
  //     }
  // });
}

//Signs out user through firebase by resetting auth instance
export function logOut() {
  const auth = getAuth();
  signOut(auth)
    .then(() => {
      // Sign-out successful.
    })
    .catch((error) => {
      // An error happened.
    });
}
