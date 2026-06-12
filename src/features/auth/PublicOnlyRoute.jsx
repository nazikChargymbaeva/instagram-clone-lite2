import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { ROUTES } from "../../shared/constants/routes";

export default function PublicOnlyRoute({ children }) {
  const { currentUser, authLoading } = useAuth();

  if (authLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          fontSize: "20px",
          fontWeight: "700",
        }}
      >
        Загрузка...
      </div>
    );
  }

  if (currentUser) {
    return <Navigate to={ROUTES.feed} replace />;
  }

  return children;
}