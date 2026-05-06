import { auth } from "../../../core/firebase/firebaseConfig";
import { createUserWithEmailAndPassword , sendEmailVerification, sendPasswordResetEmail} from "firebase/auth";
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
export async function loginUser(email, password) {
  const auth = getAuth();
  await signInWithEmailAndPassword(auth, email, password)
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
  auth.currentUser.reload();
  return true;
}

export function checkIfUserSignedIn() {
  const auth = getAuth();
  const user = auth.currentUser;
  console.log(user);
  if (user == null) {
    return false;
  } else {
    return true;
  }
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

export function verifyEmail(){
  sendEmailVerification(auth.currentUser)
}

export function isUserVerified(){
  const auth = getAuth();
  return auth.currentUser.emailVerified
}

export function callReset(){
  const auth = getAuth();
  sendPasswordResetEmail(auth, auth.currentUser.email)
    .then(() => {
      // Password reset email sent!
     // ..
     logOut()
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log(errorMessage)
  });
}


