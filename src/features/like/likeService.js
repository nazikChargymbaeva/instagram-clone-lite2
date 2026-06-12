import { doc, getDoc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "../../services/firebase/firebaseConfig";

function getLikeDocId(postId, userId) {
  return `${postId}_${userId}`;
}

export async function hasUserLikedPost(postId, userId) {
  if (!postId || !userId) {
    return false;
  }

  const likeRef = doc(db, "likes", getLikeDocId(postId, userId));
  const likeSnap = await getDoc(likeRef);

  return likeSnap.exists();
}

export async function togglePostLike({ postId, userId }) {
  if (!postId) {
    throw new Error("Пост не найден");
  }

  if (!userId) {
    throw new Error("Пользователь не авторизован");
  }

  const likeRef = doc(db, "likes", getLikeDocId(postId, userId));
  const postRef = doc(db, "posts", postId);

  return runTransaction(db, async (transaction) => {
    const postSnap = await transaction.get(postRef);

    if (!postSnap.exists()) {
      throw new Error("Пост не найден");
    }

    const likeSnap = await transaction.get(likeRef);
    const postData = postSnap.data();
    const currentLikes = postData.likesCount ?? 0;

    if (likeSnap.exists()) {
      const nextLikes = Math.max(0, currentLikes - 1);

      transaction.delete(likeRef);
      transaction.update(postRef, {
        likesCount: nextLikes,
      });

      return {
        liked: false,
        likesCount: nextLikes,
      };
    }

    const nextLikes = currentLikes + 1;

    transaction.set(likeRef, {
      postId,
      userId,
      createdAt: serverTimestamp(),
    });

    transaction.update(postRef, {
      likesCount: nextLikes,
    });

    return {
      liked: true,
      likesCount: nextLikes,
    };
  });
}