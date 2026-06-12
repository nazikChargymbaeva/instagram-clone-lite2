import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "../../services/firebase/firebaseConfig";

function getFollowDocId(followerId, followingId) {
  return `${followerId}_${followingId}`;
}

export async function isFollowingUser(followerId, followingId) {
  if (!followerId || !followingId || followerId === followingId) {
    return false;
  }

  const followRef = doc(db, "follows", getFollowDocId(followerId, followingId));
  const followSnap = await getDoc(followRef);

  return followSnap.exists();
}

export async function toggleFollowUser({ followerId, followingId }) {
  if (!followerId) {
    throw new Error("Пользователь не авторизован");
  }

  if (!followingId) {
    throw new Error("Профиль не найден");
  }

  if (followerId === followingId) {
    throw new Error("Нельзя подписаться на самого себя");
  }

  const followRef = doc(db, "follows", getFollowDocId(followerId, followingId));
  const followSnap = await getDoc(followRef);

  if (followSnap.exists()) {
    await deleteDoc(followRef);

    return {
      following: false,
    };
  }

  await setDoc(followRef, {
    followerId,
    followingId,
    createdAt: serverTimestamp(),
  });

  return {
    following: true,
  };
}

export async function getFollowStats(userId) {
  if (!userId) {
    return {
      followersCount: 0,
      followingCount: 0,
    };
  }

  const followsRef = collection(db, "follows");

  const followersQuery = query(followsRef, where("followingId", "==", userId));
  const followingQuery = query(followsRef, where("followerId", "==", userId));

  const [followersSnap, followingSnap] = await Promise.all([
    getDocs(followersQuery),
    getDocs(followingQuery),
  ]);

  return {
    followersCount: followersSnap.data().count,
    followingCount: followingSnap.data().count,
  };
}

export async function getFollowingIds(userId) {
  if (!userId) {
    return [];
  }

  const followsRef = collection(db, "follows");
  const followsQuery = query(followsRef, where("followerId", "==", userId));
  const snapshot = await getDocs(followsQuery);

  return snapshot.docs
    .map((docItem) => docItem.data().followingId)
    .filter(Boolean);
}