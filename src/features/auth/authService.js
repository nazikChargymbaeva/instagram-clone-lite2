import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../../services/firebase/firebaseConfig";

export async function registerUser({ username, email, password }) {
  const cleanUsername = username.trim();
  const cleanEmail = email.trim();

  if (!cleanUsername) {
    throw new Error("Введите username");
  }

  if (!cleanEmail) {
    throw new Error("Введите email");
  }

  if (!password) {
    throw new Error("Введите пароль");
  }

  const userCredential = await createUserWithEmailAndPassword(
    auth,
    cleanEmail,
    password
  );

  const { user } = userCredential;

  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    username: cleanUsername,
    usernameLowercase: cleanUsername.toLowerCase(),
    email: user.email,
    avatar: "",
    bio: "",
    followersCount: 0,
    followingCount: 0,
    createdAt: serverTimestamp(),
  });

  return user;
}

export async function loginUser({ email, password }) {
  const cleanEmail = email.trim();

  if (!cleanEmail) {
    throw new Error("Введите email");
  }

  if (!password) {
    throw new Error("Введите пароль");
  }

  const userCredential = await signInWithEmailAndPassword(
    auth,
    cleanEmail,
    password
  );

  return userCredential.user;
}

export async function logoutUser() {
  await signOut(auth);
}