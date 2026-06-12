import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import styles from "./PostCard.module.css";
import { useAuth } from "../auth/AuthContext";
import { hasUserLikedPost, togglePostLike } from "../like/likeService";
import {
  addCommentToPost,
  getPostComments,
} from "../comment/commentService";

function formatPostDate(createdAt) {
  if (!createdAt) {
    return "Только что";
  }

  if (typeof createdAt?.toDate === "function") {
    return createdAt.toDate().toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  if (createdAt instanceof Date) {
    return createdAt.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  return "Дата неизвестна";
}

function formatCommentDate(createdAt) {
  if (!createdAt) {
    return "Сейчас";
  }

  if (typeof createdAt?.toDate === "function") {
    return createdAt.toDate().toLocaleString("ru-RU");
  }

  if (createdAt instanceof Date) {
    return createdAt.toLocaleString("ru-RU");
  }

  return "Недавно";
}

export default function PostCard({ post }) {
  const { currentUser } = useAuth();

  const [liked, setLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  const [likesCount, setLikesCount] = useState(post?.likesCount ?? 0);
  const [commentsCount, setCommentsCount] = useState(post?.commentsCount ?? 0);

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);

  const [commentText, setCommentText] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  const avatarLetter = post?.username?.trim()?.[0]?.toUpperCase() || "U";

  useEffect(() => {
    setLikesCount(post?.likesCount ?? 0);
  }, [post?.likesCount]);

  useEffect(() => {
    setCommentsCount(post?.commentsCount ?? 0);
  }, [post?.commentsCount]);

  useEffect(() => {
    async function checkLikeStatus() {
      try {
        if (!currentUser?.uid || !post?.id) {
          setLiked(false);
          return;
        }

        const result = await hasUserLikedPost(post.id, currentUser.uid);
        setLiked(result);
      } catch (error) {
        setLiked(false);
      }
    }

    checkLikeStatus();
  }, [currentUser?.uid, post?.id]);

  const handleToggleLike = async () => {
    try {
      setLikeLoading(true);

      const result = await togglePostLike({
        postId: post.id,
        userId: currentUser.uid,
      });

      setLiked(result.liked);
      setLikesCount(result.likesCount);
    } catch (error) {
      toast.error(error.message || "Не удалось изменить лайк");
    } finally {
      setLikeLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      setCommentsLoading(true);
      const result = await getPostComments(post.id, 20);
      setComments(result);
    } catch (error) {
      toast.error(error.message || "Не удалось загрузить комментарии");
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleToggleComments = async () => {
    const nextState = !showComments;
    setShowComments(nextState);

    if (nextState && comments.length === 0) {
      await loadComments();
    }
  };

  const handleCommentSubmit = async (event) => {
    event.preventDefault();

    try {
      setCommentSubmitting(true);

      const newComment = await addCommentToPost({
        postId: post.id,
        userId: currentUser.uid,
        text: commentText,
      });

      setComments((prev) => [...prev, newComment]);
      setCommentsCount(newComment.commentsCount);
      setCommentText("");
      setShowComments(true);

      toast.success("Комментарий добавлен");
    } catch (error) {
      toast.error(error.message || "Не удалось добавить комментарий");
    } finally {
      setCommentSubmitting(false);
    }
  };

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <div className={styles.user}>
          {post?.userAvatar ? (
            <img
              src={post.userAvatar}
              alt={post.username}
              className={styles.avatarImage}
            />
          ) : (
            <div className={styles.avatarFallback}>{avatarLetter}</div>
          )}

          <div>
            <h3 className={styles.username}>{post?.username || "Unknown user"}</h3>
            <p className={styles.date}>{formatPostDate(post?.createdAt)}</p>
          </div>
        </div>
      </div>

      <div className={styles.imageWrap}>
        <img
          src={post.imageUrl}
          alt={post.caption || "Post image"}
          className={styles.image}
        />
      </div>

      <div className={styles.content}>
        <p className={styles.caption}>
          {post?.caption?.trim() ? post.caption : "Без описания"}
        </p>

        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.actionButton} ${liked ? styles.liked : ""}`}
            onClick={handleToggleLike}
            disabled={likeLoading}
          >
            {liked ? "❤️ Лайк поставлен" : "🤍 Лайк"} · {likesCount}
          </button>

          <button
            type="button"
            className={styles.actionButton}
            onClick={handleToggleComments}
          >
            💬 Комментарии · {commentsCount}
          </button>
        </div>

        {showComments && (
          <div className={styles.commentsBlock}>
            <form className={styles.commentForm} onSubmit={handleCommentSubmit}>
              <input
                type="text"
                className={styles.commentInput}
                placeholder="Напишите комментарий..."
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
              />

              <button
                type="submit"
                className={styles.commentButton}
                disabled={commentSubmitting}
              >
                {commentSubmitting ? "Отправка..." : "Отправить"}
              </button>
            </form>

            {commentsLoading ? (
              <p className={styles.commentsState}>Загрузка комментариев...</p>
            ) : comments.length === 0 ? (
              <p className={styles.commentsState}>Комментариев пока нет</p>
            ) : (
              <div className={styles.commentsList}>
                {comments.map((comment) => {
                  const commentAvatarLetter =
                    comment?.username?.trim()?.[0]?.toUpperCase() || "U";

                  return (
                    <div key={comment.id} className={styles.commentItem}>
                      {comment?.userAvatar ? (
                        <img
                          src={comment.userAvatar}
                          alt={comment.username}
                          className={styles.commentAvatarImage}
                        />
                      ) : (
                        <div className={styles.commentAvatarFallback}>
                          {commentAvatarLetter}
                        </div>
                      )}

                      <div className={styles.commentContent}>
                        <div className={styles.commentTop}>
                          <span className={styles.commentName}>
                            {comment.username}
                          </span>
                          <span className={styles.commentDate}>
                            {formatCommentDate(comment.createdAt)}
                          </span>
                        </div>

                        <p className={styles.commentText}>{comment.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}