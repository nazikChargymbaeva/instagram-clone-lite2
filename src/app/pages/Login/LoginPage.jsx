import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./LoginPage.module.css";
import { loginUser } from "../../../features/auth/authService";
import { ROUTES } from "../../../shared/constants/routes";

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      await loginUser(formData);
      toast.success("Вы успешно вошли");
      navigate(ROUTES.feed, { replace: true });
    } catch (error) {
      toast.error(error.message || "Не удалось войти");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className={styles.wrapper}>
      <div className={styles.card}>
        <p className={styles.badge}>Auth</p>
        <h1 className={styles.title}>Login Page</h1>
        <p className={styles.text}>Войдите в свой аккаунт.</p>

        <form className={styles.formMock} onSubmit={handleSubmit}>
          <input
            className={styles.input}
            type="email"
            name="email"
            placeholder="Email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            className={styles.input}
            type="password"
            name="password"
            placeholder="Пароль"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button
            className={styles.button}
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Входим..." : "Войти"}
          </button>
        </form>

        <div className={styles.bottomText}>
          Нет аккаунта?{" "}
          <Link className={styles.switchLink} to={ROUTES.register}>
            Зарегистрироваться
          </Link>
        </div>
      </div>
    </section>
  );
}