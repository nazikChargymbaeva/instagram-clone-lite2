import { NavLink, Route, Routes, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

import styles from "./App.module.css";
import ProtectedRoute from "./features/auth/ProtectedRoute";
import PublicOnlyRoute from "./features/auth/PublicOnlyRoute";
import { useAuth } from "./features/auth/AuthContext";
import { logoutUser } from "./features/auth/authService";
import { ROUTES } from "./shared/constants/routes";
import LoginPage from "./app/pages/Login/LoginPage";
import RegisterPage from "./app/pages/Register/RegisterPage";
import FeedPage from "./app/pages/Feed/FeedPage";
import ProfilePage from "./app/pages/Profile/ProfilePage";
import CreatePostPage from "./app/pages/CreatePost/CreatePostPage";

function Header() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleLogout = async () => {
    try {
      await logoutUser();
      toast.success("Вы вышли из аккаунта");
      navigate(ROUTES.login, { replace: true });
    } catch (error) {
      toast.error(error.message || "Не удалось выйти");
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.logo}>Instagram Clone Lite</div>

      <nav className={styles.nav}>
        {!currentUser ? (
          <>
            <NavLink
              to={ROUTES.login}
              className={({ isActive }) =>
                isActive ? `${styles.link} ${styles.active}` : styles.link
              }
            >
              Login
            </NavLink>

            <NavLink
              to={ROUTES.register}
              className={({ isActive }) =>
                isActive ? `${styles.link} ${styles.active}` : styles.link
              }
            >
              Register
            </NavLink>
          </>
        ) : (
          <>
            <NavLink
              to={ROUTES.feed}
              className={({ isActive }) =>
                isActive ? `${styles.link} ${styles.active}` : styles.link
              }
            >
              Feed
            </NavLink>

            <NavLink
              to={ROUTES.profile(currentUser.uid)}
              className={({ isActive }) =>
                isActive ? `${styles.link} ${styles.active}` : styles.link
              }
            >
              Profile
            </NavLink>

            <NavLink
              to={ROUTES.create}
              className={({ isActive }) =>
                isActive ? `${styles.link} ${styles.active}` : styles.link
              }
            >
              Create Post
            </NavLink>

            <button className={styles.logoutButton} onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </nav>
    </header>
  );
}

function App() {
  return (
    <div className={styles.app}>
      <Header />

      <main className={styles.main}>
        <Routes>
          <Route
            path={ROUTES.login}
            element={
              <PublicOnlyRoute>
                <LoginPage/>
              </PublicOnlyRoute>
            }
          />

          <Route
            path={ROUTES.register}
            element={
              <PublicOnlyRoute>
                <RegisterPage/>
              </PublicOnlyRoute>
            }
          />

          <Route
            path={ROUTES.feed}
            element={
              <ProtectedRoute>
                <FeedPage/>
              </ProtectedRoute>
            }
          />

          <Route
            path={`${ROUTES.profileBase}/:uid`}
            element={
              <ProtectedRoute>
                <ProfilePage/>
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.create}
            element={
              <ProtectedRoute>
                <CreatePostPage/>
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      <ToastContainer position="top-right" autoClose={2500} />
    </div>
  );
}

export default App;