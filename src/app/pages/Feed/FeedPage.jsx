import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import styles from "./FeedPage.module.css";
import { getFeedPostsForUser } from "../../../features/post/postService";
import PostCard from "../../../features/post/PostCard";
import { useAuth } from "../../../features/auth/AuthContext";
import UserSearch from "../../../features/user/UserSearch";

export default function FeedPage() {
  const { currentUser } = useAuth();

  const [posts, setPosts] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  const loadInitialPosts = useCallback(async () => {
    try {
      if (!currentUser?.uid) {
        return;
      }

      setLoading(true);

      const result = await getFeedPostsForUser(currentUser.uid, null, 6);

      setPosts(result.posts);
      setLastVisible(result.lastVisible);
      setHasMore(result.hasMore);
    } catch (error) {
      toast.error(error.message || "Не удалось загрузить ленту");
    } finally {
      setLoading(false);
    }
  }, [currentUser?.uid]);

  const loadMorePosts = useCallback(async () => {
    if (!currentUser?.uid || !lastVisible || !hasMore || loadingMore) {
      return;
    }

    try {
      setLoadingMore(true);

      const result = await getFeedPostsForUser(currentUser.uid, lastVisible, 6);

      setPosts((prev) => [...prev, ...result.posts]);
      setLastVisible(result.lastVisible);
      setHasMore(result.hasMore);
    } catch (error) {
      toast.error(error.message || "Не удалось загрузить ещё посты");
    } finally {
      setLoadingMore(false);
    }
  }, [currentUser?.uid, lastVisible, hasMore, loadingMore]);

  useEffect(() => {
    loadInitialPosts();
  }, [loadInitialPosts]);

  useEffect(() => {
    const target = loadMoreRef.current;

    if (!target || loading || loadingMore || !hasMore) {
      return;
    }

    observerRef.current?.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];

        if (firstEntry.isIntersecting) {
          loadMorePosts();
        }
      },
      {
        threshold: 0.2,
      }
    );

    observerRef.current.observe(target);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [loading, loadingMore, hasMore, loadMorePosts]);

  if (loading) {
    return (
      <section className={styles.wrapper}>
        <div className={styles.hero}>
          <p className={styles.badge}>Home</p>
          <h1 className={styles.title}>Your Feed</h1>
          <p className={styles.text}>Загружаем персональную ленту...</p>
        </div>

        <UserSearch />

        <div className={styles.grid}>
          <div className={styles.skeletonCard}></div>
          <div className={styles.skeletonCard}></div>
          <div className={styles.skeletonCard}></div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.wrapper}>
      <div className={styles.hero}>
        <p className={styles.badge}>Home</p>
        <h1 className={styles.title}>Your Feed</h1>
        <p className={styles.text}>
          Здесь отображаются ваши посты и посты пользователей, на которых вы подписаны.
        </p>
      </div>

      <UserSearch />

      {posts.length === 0 ? (
        <div className={styles.emptyState}>
          <h2 className={styles.emptyTitle}>Лента пока пустая</h2>
          <p className={styles.emptyText}>
            Подпишитесь на пользователей или создайте свой первый пост.
          </p>
        </div>
      ) : (
        <>
          <div className={styles.grid}>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {loadingMore && (
            <div className={styles.moreLoading}>Загружаем ещё посты...</div>
          )}

          {!hasMore && <p className={styles.endText}>Больше постов нет</p>}

          <div ref={loadMoreRef} className={styles.loadMoreTrigger}></div>
        </>
      )}
    </section>
  );
}