import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./UserSearch.module.css";
import { searchUsersByUsername } from "./userService";
import useDebounce from "../../shared/hooks/useDebounce";
import { ROUTES } from "../../shared/constants/routes";
import { useAuth } from "../auth/AuthContext";

export default function UserSearch() {
  const { currentUser } = useAuth();

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function runSearch() {
      try {
        if (!debouncedQuery.trim()) {
          setResults([]);
          return;
        }

        setLoading(true);

        const users = await searchUsersByUsername(debouncedQuery, 8);

        const filteredUsers = users.filter(
          (user) => user.uid !== currentUser?.uid
        );

        setResults(filteredUsers);
      } catch (error) {
        toast.error(error.message || "Не удалось выполнить поиск");
      } finally {
        setLoading(false);
      }
    }

    runSearch();
  }, [debouncedQuery, currentUser?.uid]);

  return (
    <section className={styles.wrapper}>
      <div className={styles.searchCard}>
        <div className={styles.top}>
          <div>
            <p className={styles.badge}>Search</p>
            <h2 className={styles.title}>Поиск пользователей</h2>
            <p className={styles.text}>
              Найдите пользователя по username.
            </p>
          </div>
        </div>

        <input
          type="text"
          className={styles.input}
          placeholder="Например: nazik"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />

        {!query.trim() ? (
          <p className={styles.stateText}>Начните вводить username...</p>
        ) : loading ? (
          <div className={styles.skeletonList}>
            <div className={styles.skeletonItem}></div>
            <div className={styles.skeletonItem}></div>
            <div className={styles.skeletonItem}></div>
          </div>
        ) : results.length === 0 ? (
          <p className={styles.stateText}>Пользователи не найдены</p>
        ) : (
          <div className={styles.results}>
            {results.map((user) => {
              const avatarLetter =
                user?.username?.trim()?.[0]?.toUpperCase() || "U";

              return (
                <Link
                  key={user.id}
                  to={ROUTES.profile(user.uid)}
                  className={styles.userCard}
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className={styles.avatarImage}
                    />
                  ) : (
                    <div className={styles.avatarFallback}>{avatarLetter}</div>
                  )}

                  <div className={styles.userInfo}>
                    <h3 className={styles.username}>{user.username}</h3>
                    <p className={styles.email}>{user.email}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}