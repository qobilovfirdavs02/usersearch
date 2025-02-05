import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import styles from "../styles/admin.module.css";

export default function AdminEdit() {
  const router = useRouter();
  const { userId } = router.query;
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    middle_name: "",
    birth_date: "",
    nationality: "",
    citizenship: "",
    address: "",
    passport_id: "",
    photo: null,
  });

  useEffect(() => {
    if (userId) {
      axios.get(`http://localhost:8000/users/${userId}`)
        .then(response => {
          setUser(response.data);
          setFormData({ ...response.data, photo: null });
        })
        .catch(error => console.error("Xatolik:", error));
    }
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, photo: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null) formDataToSend.append(key, value);
    });

    try {
      await axios.put(`http://localhost:8000/users/${userId}`, formDataToSend);
      alert("Foydalanuvchi ma'lumotlari yangilandi!");
      router.push("/admin"); // Admin panelga qaytish
    } catch (error) {
      console.error("Xatolik:", error);
      alert("Tahrirlashda xatolik yuz berdi!");
    }
  };

  if (!user) return <p>Yuklanmoqda...</p>;

  return (
    <div className={styles.adminContainer}>
      <h1>Foydalanuvchini tahrirlash</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
  <label>Ism:</label>
  <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className={styles.inputField} required />

  <label>Familiya:</label>
  <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className={styles.inputField} required />

  <label>Fuqaroligi:</label>
  <input type="text" name="citizenship" value={formData.citizenship} onChange={handleChange} className={styles.inputField} required />

  <button type="submit" className={styles.saveButton}>Saqlash</button>
</form>

    </div>
  );
}
