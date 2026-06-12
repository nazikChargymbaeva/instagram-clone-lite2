import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAt,
  endAt,
} from "firebase/firestore";
import { db } from "../../services/firebase/firebaseConfig";

export async function getUserById(uid) {
  if (!uid) {
    throw new Error("UID пользователя не найден");
  }

  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    throw new Error("Пользователь не найден");
  }

  return {
    id: userSnap.id,
    ...userSnap.data(),
  };
}

export async function searchUsersByUsername(searchText, maxResults = 8) {
  const cleanSearch = searchText.trim().toLowerCase();

  if (!cleanSearch) {
    return [];
  }

  const usersRef = collection(db, "users");
  const usersQuery = query(
    usersRef,
    orderBy("usernameLowercase"),
    startAt(cleanSearch),
    endAt(cleanSearch + "\uf8ff"),
    limit(maxResults)
  );

  const snapshot = await getDocs(usersQuery);

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
}