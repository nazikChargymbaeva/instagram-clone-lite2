import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./RegisterPage.module.css";
import { registerUser } from "../../../features/auth/authService";
import { ROUTES } from "../../../shared/constants/routes";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
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
      await registerUser(formData);
      toast.success("Регистрация прошла успешно");
      navigate(ROUTES.feed, { replace: true });
    } catch (error) {
      toast.error(error.message || "Не удалось зарегистрироваться");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className={styles.wrapper}>
      <div className={styles.card}>
        <p className={styles.badge}>Auth</p>
        <h1 className={styles.title}>Register Page</h1>
        <p className={styles.text}>Создайте новый аккаунт.</p>

        <form className={styles.formMock} onSubmit={handleSubmit}>
          <input
            className={styles.input}
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />

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
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button
            className={styles.button}
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Создаём..." : "Создать аккаунт"}
          </button>
        </form>

        <div className={styles.bottomText}>
          Уже есть аккаунт?{" "}
          <Link className={styles.switchLink} to={ROUTES.login}>
            Войти
          </Link>
        </div>
      </div>
    </section>
  );
}