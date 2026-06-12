import {
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  where,
   getCountFromServer,
} from "firebase/firestore";
import { db } from "../../services/firebase/firebaseConfig";
import { getFollowingIds } from "../follow/followService";

export async function getUserPostsCount(userId) {
  if (!userId) {
    return 0;
  }

  const postsRef = collection(db, "posts");
  const postsQuery = query(postsRef, where("userId", "==", userId));
  const snapshot = await getCountFromServer(postsQuery);

  return snapshot.data().count;
}
export async function createPost({
  userId,
  username,
  userAvatar = "",
  imageUrl,
  caption = "",
}) {
  const cleanImageUrl = imageUrl.trim();
  const cleanCaption = caption.trim();
  const cleanUsername = username.trim();

  if (!userId) {
    throw new Error("Пользователь не авторизован");
  }

  if (!cleanUsername) {
    throw new Error("Не найден username пользователя");
  }

  if (!cleanImageUrl) {
    throw new Error("Добавьте ссылку на изображение");
  }

  const docRef = await addDoc(collection(db, "posts"), {
    userId,
    username: cleanUsername,
    userAvatar,
    imageUrl: cleanImageUrl,
    caption: cleanCaption,
    likesCount: 0,
    commentsCount: 0,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function getFeedPostsForUser(currentUserId, lastVisibleDoc = null, pageSize = 6) {
  if (!currentUserId) {
    throw new Error("Пользователь не авторизован");
  }

  const followingIds = await getFollowingIds(currentUserId);
  const allowedUserIds = Array.from(new Set([currentUserId, ...followingIds]));

  const postsRef = collection(db, "posts");

  let postsQuery = query(
    postsRef,
    where("userId", "in", allowedUserIds),
    orderBy("createdAt", "desc"),
    limit(pageSize)
  );

  if (lastVisibleDoc) {
    postsQuery = query(
      postsRef,
      where("userId", "in", allowedUserIds),
      orderBy("createdAt", "desc"),
      startAfter(lastVisibleDoc),
      limit(pageSize)
    );
  }

  const snapshot = await getDocs(postsQuery);

  const posts = snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));

  const newLastVisible =
    snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;

  const hasMore = snapshot.docs.length === pageSize;

  return {
    posts,
    lastVisible: newLastVisible,
    hasMore,
  };
}