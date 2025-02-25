
import { useState, useEffect } from "react";
import axios from "axios";
import styles from "../styles/search.module.css";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (query.length > 0) {
      axios
        .get(`http://localhost:8000/users?search=${query}`)
        .then((response) => {
          setUsers(response.data);
        })
        .catch((error) => console.error("❌ Xatolik:", error));
    } else {
      setUsers([]); // 🔹 Qidiruv bo‘sh bo‘lsa, ro‘yxatni tozalash
    }
  }, [query]);

  const handleUserClick = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:8000/users/${userId}`);

      // 🔹 Agar `photo` qiymati mavjud bo‘lsa, unga to‘liq URL qo‘shamiz
      let userData = response.data;
      if (userData.photo && !userData.photo.startsWith("http")) {
        userData.photo = `http://localhost:8000/uploads/${userData.photo}`;
      }

      setSelectedUser(userData);
      console.log("ℹ️ Tanlangan user:", userData);
    } catch (error) {
      console.error("❌ Foydalanuvchini yuklashda xatolik:", error);
    }
  };

  return (
    <div className={styles.searchContainer}>
      <h1>Foydalanuvchini qidiring</h1>
      <input
        type="text"
        placeholder="Ism, familiya yoki millat bo‘yicha qidiring..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className={styles.searchInput}
      />

      {/* 🔹 Agar foydalanuvchilar bo‘lsa, ularni ko‘rsatamiz */}
      {users.length > 0 ? (
        <ul className={styles.userList}>
          {users.map((user) => (
            <li key={user.id} onClick={() => handleUserClick(user.id)} className={styles.userItem}>
              <img
                src={user.photo ? `http://localhost:8000/uploads/${user.photo}` : "/avatars.jpg"}
                alt={user.first_name}
                className={styles.userPhoto}
              />
              <span>{user.first_name} {user.last_name}</span>
            </li>
          ))}
        </ul>
      ) : (
        query.length > 0 && <p className={styles.noResults}>❌ Hech narsa topilmadi</p>
      )}

      {/* 🔹 Modal oynasi */}
      {selectedUser && (
        <div className={styles.modalOverlay} onClick={() => setSelectedUser(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>{selectedUser.first_name} {selectedUser.last_name}</h2>

            {/* 🔹 Rasm faqat mavjud bo‘lsa chiqadi */}
            {selectedUser.photo && (
              <img src={selectedUser.photo} alt={selectedUser.first_name} className={styles.modalPhoto} />
            )}

            <p><strong>Otasining ismi:</strong> {selectedUser.middle_name}</p>
            <p><strong>Tug‘ilgan yili:</strong> {selectedUser.birth_date}</p>
            <p><strong>Millati:</strong> {selectedUser.nationality}</p>
            <p><strong>Fuqaroligi:</strong> {selectedUser.citizenship}</p>
            <p><strong>Yashash joyi:</strong> {selectedUser.address}</p>
            <p><strong>Passport ID:</strong> {selectedUser.passport_id}</p>

            <button onClick={() => setSelectedUser(null)} className={styles.closeButton}>Yopish</button>
          </div>
        </div>
      )}
    </div>
  );
}
