import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import styles from "./ProfilePage.module.css";
import { getUserById } from "../../../features/user/userService";
import { useAuth } from "../../../features/auth/AuthContext";

function formatCreatedAt(createdAt) {
  if (!createdAt) {
    return "Дата неизвестна";
  }

  if (typeof createdAt?.toDate === "function") {
    return createdAt.toDate().toLocaleDateString("ru-RU");
  }

  return "Дата неизвестна";
}

export default function ProfilePage() {
  const { uid } = useParams();
  const { currentUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        const userData = await getUserById(uid);

        if (isMounted) {
          setProfile(userData);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Не удалось загрузить профиль");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [uid]);

  const isOwnProfile = currentUser?.uid === uid;

  const avatarLetter = useMemo(() => {
    if (profile?.username?.trim()) {
      return profile.username.trim()[0].toUpperCase();
    }

    return "U";
  }, [profile]);

  if (loading) {
    return (
      <section className={styles.wrapper}>
        <div className={styles.stateCard}>Загрузка профиля...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.wrapper}>
        <div className={styles.stateCardError}>{error}</div>
      </section>
    );
  }

  return (
    <section className={styles.wrapper}>
      <div className={styles.profileCard}>
        <div className={styles.topBlock}>
          {profile?.avatar ? (
            <img
              src={profile.avatar}
              alt={profile.username}
              className={styles.avatarImage}
            />
          ) : (
            <div className={styles.avatarFallback}>{avatarLetter}</div>
          )}

          <div className={styles.info}>
            <div className={styles.headRow}>
              <div>
                <p className={styles.badge}>Profile</p>
                <h1 className={styles.title}>{profile?.username || "User"}</h1>
              </div>

              {isOwnProfile && (
                <span className={styles.ownProfileTag}>Это ваш профиль</span>
              )}
            </div>

            <p className={styles.email}>{profile?.email}</p>

            <p className={styles.bio}>
              {profile?.bio?.trim()
                ? profile.bio
                : "Пользователь пока не добавил описание."}
            </p>

            <div className={styles.stats}>
              <div className={styles.statItem}>
                <span className={styles.statValue}>0</span>
                <span className={styles.statLabel}>Посты</span>
              </div>

              <div className={styles.statItem}>
                <span className={styles.statValue}>
                  {profile?.followersCount ?? 0}
                </span>
                <span className={styles.statLabel}>Подписчики</span>
              </div>

              <div className={styles.statItem}>
                <span className={styles.statValue}>
                  {profile?.followingCount ?? 0}
                </span>
                <span className={styles.statLabel}>Подписки</span>
              </div>
            </div>

            <div className={styles.meta}>
              <span>UID: {profile?.uid}</span>
              <span>
                Зарегистрирован: {formatCreatedAt(profile?.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.postsSection}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Посты пользователя</h2>
          <p className={styles.sectionText}>
            Здесь на следующем этапе будут реальные посты пользователя.
          </p>
        </div>

        <div className={styles.postsGrid}>
          <div className={styles.postPlaceholder}></div>
          <div className={styles.postPlaceholder}></div>
          <div className={styles.postPlaceholder}></div>
        </div>
      </div>
    </section>
  );
}
