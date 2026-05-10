import { auth } from "../../../core/firebase/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential,
  linkWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
} from "firebase/auth";

// SESSION PERSISTENCE
export function observeAuthState(callback) {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
}

// EMAIL SIGN UP
export async function createUser(email, password) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);

    if (result.user) {
      await sendEmailVerification(result.user);
    }

    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, error: formatError(error) };
  }
}

// EMAIL LOGIN
export async function loginUser(email, password) {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, error: formatError(error) };
  }
}

// GOOGLE LOGIN
export async function handleGoogleAuth(idToken, accessToken) {
  try {
    const credential = GoogleAuthProvider.credential(idToken, accessToken);
    const result = await signInWithCredential(auth, credential);
    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, error: formatError(error) };
  }
}

// LINK GOOGLE ACCOUNT
export async function linkGoogleAccount(idToken, accessToken) {
  try {
    if (!auth?.currentUser) {
      throw new Error("No logged-in user to link account.");
    }

    const credential = GoogleAuthProvider.credential(idToken, accessToken);
    const result = await linkWithCredential(auth.currentUser, credential);

    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, error: formatError(error) };
  }
}

// LOGOUT
export async function logOut() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: formatError(error) };
  }
}

// PASSWORD RESET
export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    return { success: false, error: formatError(error) };
  }
}

// VERIFY EMAIL
export async function verifyEmail() {
  try {
    if (!auth?.currentUser) {
      throw new Error("No user logged in");
    }

    await sendEmailVerification(auth.currentUser);
    return { success: true };
  } catch (error) {
    return { success: false, error: formatError(error) };
  }
}

// CHECK EMAIL VERIFIED (Fixed Crash)
export async function isUserVerified() {
  try {
    if (!auth?.currentUser) return false;
    await auth.currentUser.reload();
    return auth.currentUser.emailVerified;
  } catch (error) {
    console.error("Verification check failed:", error);
    return false;
  }
}

// LEGACY RESET
export async function callReset(email) {
  try {
    if (!auth?.currentUser?.email) {
      throw new Error("No email available");
    }

    await sendPasswordResetEmail(auth, email);
    await logOut();

    return { success: true };
  } catch (error) {
    return { success: false, error: formatError(error) };
  }
}

// ERROR HANDLER
function formatError(error) {
  const code = error?.code;

  switch (code) {
    case "auth/invalid-email":
      return "Invalid email format.";
    case "auth/user-not-found":
      return "No account found.";
    case "auth/wrong-password":
      return "Incorrect password.";
    case "auth/email-already-in-use":
      return "Account already exists.";
    case "auth/network-request-failed":
      return "Network error. Try again.";
    case "auth/invalid-credential":
      return "Invalid login credentials.";
    case "auth/too-many-requests":
      return "Too many attempts. Try again later.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/popup-closed-by-user":
      return "Login cancelled.";
    default:
      return "Authentication failed.";
  }
}