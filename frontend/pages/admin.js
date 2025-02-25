import { useState, useEffect } from "react";
import axios from "axios";
import styles from "../styles/admin.module.css";

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ username: "", password: "" });

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    middle_name: "",
    birth_date: "",
    nationality: "",
    citizenship: "",
    address: "",
    passport_id: "",
  });

  const [photo, setPhoto] = useState(null);

  // 🔹 Login form inputlarini yangilash
  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  // 🔹 Admin panelga kirish
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (loginData.username === "admin" && loginData.password === "12340") {
      setIsAuthenticated(true);
      fetchUsers();
    } else {
      alert("❌ Login yoki parol noto‘g‘ri!");
    }
  };

  // 🔹 Foydalanuvchilarni yuklash
  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:8000/users/");
      const updatedUsers = response.data.map((user) => ({
        ...user,
        photo: user.photo ? `http://localhost:8000/uploads/${user.photo}` : "/avatars.jpg",
      }));
      setUsers(updatedUsers);
    } catch (error) {
      console.error("❌ Xatolik:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated]);

  // 🔹 Foydalanuvchini tahrirlash uchun tanlash
  const handleEditClick = (user) => {
    setSelectedUser(user);
    setFormData({
      first_name: user.first_name,
      last_name: user.last_name,
      middle_name: user.middle_name,
      birth_date: user.birth_date,
      nationality: user.nationality,
      citizenship: user.citizenship,
      address: user.address,
      passport_id: user.passport_id,
    });
  };

  // 🔹 Input qiymatlarini yangilash
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  // 🔹 Foydalanuvchi qo‘shish yoki yangilash
  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = new FormData();
    Object.keys(formData).forEach((key) => {
      userData.append(key, formData[key]);
    });

    if (photo) {
      userData.append("photo", photo);
    }

    try {
      if (selectedUser) {
        await axios.put(`http://localhost:8000/users/${selectedUser.id}/`, userData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("✅ Foydalanuvchi yangilandi!");
      } else {
        await axios.post("http://localhost:8000/users/", userData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("✅ Foydalanuvchi qo‘shildi!");
      }
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error("❌ Xatolik:", error);
    }
  };

  // 🔹 Foydalanuvchini o‘chirish
  const handleDelete = async (userId) => {
    if (confirm("❌ Ushbu foydalanuvchini o‘chirishni istaysizmi?")) {
      try {
        await axios.delete(`http://localhost:8000/users/${userId}/`);
        alert("🗑 Foydalanuvchi o‘chirildi!");
        fetchUsers();
      } catch (error) {
        console.error("❌ Xatolik:", error);
      }
    }
  };

  return (
    <div className={styles.adminContainer}>
      {!isAuthenticated ? (
        <div className={styles.loginForm}>
          <h1 className={styles.adminTitle}>Admin Kirish</h1>
          <form onSubmit={handleLoginSubmit}>
            <input type="text" name="username" placeholder="Login" onChange={handleLoginChange} className={styles.adminInput} />
            <input type="password" name="password" placeholder="Parol" onChange={handleLoginChange} className={styles.adminInput} />
            <button type="submit" className={styles.adminButton}>Kirish</button>
          </form>
        </div>
      ) : (
        <>
          <h1 className={styles.adminTitle}>Admin Panel</h1>

          {/* 🔹 Foydalanuvchilar ro‘yxati */}
          <h2 className={styles.subtitle}>Foydalanuvchilar ro‘yxati</h2>
          <ul className={styles.userList}>
            {users.map((user) => (
              <li key={user.id} className={styles.userItem}>
                <img src={user.photo} alt={user.first_name} className={styles.userPhoto} />
                <span>{user.first_name} {user.last_name}</span>
                <button onClick={() => handleEditClick(user)} className={styles.editButton}>✏️ Tahrirlash</button>
                <button onClick={() => handleDelete(user.id)} className={styles.deleteButton}>🗑 O‘chirish</button>
              </li>
            ))}
          </ul>

          {/* 🔹 Foydalanuvchi qo‘shish / tahrirlash formi */}
          <h2 className={styles.subtitle}>{selectedUser ? "Foydalanuvchini tahrirlash" : "Yangi foydalanuvchi qo‘shish"}</h2>
          <form onSubmit={handleSubmit}>
            <input type="text" name="first_name" placeholder="Ism" value={formData.first_name} onChange={handleChange} className={styles.adminInput} />
            <input type="text" name="last_name" placeholder="Familiya" value={formData.last_name} onChange={handleChange} className={styles.adminInput} />
            <input type="text" name="middle_name" placeholder="Otasining ismi" value={formData.middle_name} onChange={handleChange} className={styles.adminInput} />
            <input type="date" name="birth_date" value={formData.birth_date} onChange={handleChange} className={styles.adminInput} />
            <input type="text" name="nationality" placeholder="Millati" value={formData.nationality} onChange={handleChange} className={styles.adminInput} />
            <input type="text" name="citizenship" placeholder="Fuqaroligi" value={formData.citizenship} onChange={handleChange} className={styles.adminInput} />
            <input type="text" name="address" placeholder="Yashash joyi" value={formData.address} onChange={handleChange} className={styles.adminInput} />
            <input type="text" name="passport_id" placeholder="Passport ID" value={formData.passport_id} onChange={handleChange} className={styles.adminInput} />
            <input type="file" name="photo" onChange={handleFileChange} className={styles.fileInput} />

            <button type="submit" className={styles.adminButton}>{selectedUser ? "Yangilash" : "Qo‘shish"}</button>
          </form>
        </>
      )}
    </div>
  );
}
