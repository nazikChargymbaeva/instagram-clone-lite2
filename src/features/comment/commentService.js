import {
  collection,
  doc,
  getDocs,
  limit,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "../../services/firebase/firebaseConfig";

function getTimestampValue(createdAt) {
  if (typeof createdAt?.toDate === "function") {
    return createdAt.toDate().getTime();
  }

  return 0;
}

export async function getPostComments(postId, maxResults = 20) {
  if (!postId) {
    throw new Error("Пост не найден");
  }

  const commentsRef = collection(db, "comments");
  const commentsQuery = query(
    commentsRef,
    where("postId", "==", postId),
    limit(maxResults)
  );

  const snapshot = await getDocs(commentsQuery);

  const comments = snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));

  comments.sort(
    (a, b) => getTimestampValue(a.createdAt) - getTimestampValue(b.createdAt)
  );

  return comments;
}

export async function addCommentToPost({ postId, userId, text }) {
  const cleanText = text.trim();

  if (!postId) {
    throw new Error("Пост не найден");
  }

  if (!userId) {
    throw new Error("Пользователь не авторизован");
  }

  if (!cleanText) {
    throw new Error("Введите комментарий");
  }

  const postRef = doc(db, "posts", postId);
  const userRef = doc(db, "users", userId);
  const commentRef = doc(collection(db, "comments"));

  return runTransaction(db, async (transaction) => {
    const postSnap = await transaction.get(postRef);
    const userSnap = await transaction.get(userRef);

    if (!postSnap.exists()) {
      throw new Error("Пост не найден");
    }

    if (!userSnap.exists()) {
      throw new Error("Пользователь не найден");
    }

    const postData = postSnap.data();
    const userData = userSnap.data();

    const currentComments = postData.commentsCount ?? 0;
    const nextComments = currentComments + 1;

    transaction.set(commentRef, {
      postId,
      userId,
      username: userData.username || "User",
      userAvatar: userData.avatar || "",
      text: cleanText,
      createdAt: serverTimestamp(),
    });

    transaction.update(postRef, {
      commentsCount: nextComments,
    });

    return {
      id: commentRef.id,
      postId,
      userId,
      username: userData.username || "User",
      userAvatar: userData.avatar || "",
      text: cleanText,
      createdAt: new Date(),
      commentsCount: nextComments,
    };
  });
}