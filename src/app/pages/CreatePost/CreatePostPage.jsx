import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./CreatePostPage.module.css";
import { useAuth } from "../../../features/auth/AuthContext";
import { getUserById } from "../../../features/user/userService";
import { createPost } from "../../../features/post/postService";
import { ROUTES } from "../../../shared/constants/routes";

export default function CreatePostPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [formData, setFormData] = useState({
    imageUrl: "",
    caption: "",
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

      const userProfile = await getUserById(currentUser.uid);

      await createPost({
        userId: currentUser.uid,
        username: userProfile.username,
        userAvatar: userProfile.avatar || "",
        imageUrl: formData.imageUrl,
        caption: formData.caption,
      });

      toast.success("Пост опубликован");

      setFormData({
        imageUrl: "",
        caption: "",
      });

      navigate(ROUTES.feed, { replace: true });
    } catch (error) {
      toast.error(error.message || "Не удалось опубликовать пост");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.headerBlock}>
          <p className={styles.badge}>Post</p>
          <h1 className={styles.title}>Create Post</h1>
          <p className={styles.text}>
            Пока на этом этапе добавляем пост по ссылке на изображение.
            Загрузку файла через Bunny подключим позже.
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.left}>
            <label className={styles.label}>Ссылка на изображение</label>
            <input
              className={styles.input}
              type="url"
              name="imageUrl"
              placeholder="https://example.com/photo.jpg"
              value={formData.imageUrl}
              onChange={handleChange}
              required
            />

            <label className={styles.label}>Описание</label>
            <textarea
              className={styles.textarea}
              name="caption"
              placeholder="Напишите описание поста..."
              value={formData.caption}
              onChange={handleChange}
            />

            <button
              type="submit"
              className={styles.button}
              disabled={submitting}
            >
              {submitting ? "Публикуем..." : "Опубликовать"}
            </button>
          </div>

          <div className={styles.right}>
            <p className={styles.previewTitle}>Preview</p>

            <div className={styles.previewCard}>
              {formData.imageUrl.trim() ? (
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className={styles.previewImage}
                />
              ) : (
                <div className={styles.emptyPreview}>
                  Здесь будет превью изображения
                </div>
              )}

              <div className={styles.previewContent}>
                <div className={styles.previewUser}>
                  <div className={styles.avatar}>
                    {currentUser?.email?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <h3 className={styles.previewName}>Новый пост</h3>
                    <p className={styles.previewMeta}>Instagram Clone Lite</p>
                  </div>
                </div>

                <p className={styles.previewCaption}>
                  {formData.caption.trim() || "Описание поста появится здесь."}
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}