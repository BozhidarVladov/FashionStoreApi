import React, { useState, useEffect } from 'react';

const AdminPanel = () => {
  const [clothes, setClothes] = useState([]);
  const [categories, setCategories] = useState([
    { id: 1, name: "Тениски" },
    { id: 2, name: "Суитшърти" },
    { id: 3, name: "Якета" },
    { id: 4, name: "Дънки" }
  ]); // Можеш да промениш тези имена според твоите категории в базата данни!

  // Състояние на формата
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    price: '',
    categoryId: 1,
    imageUrl: '',
    description: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');

  // Вземане на токена за Admin права
  const token = localStorage.getItem('token'); 

  // 1. Зареждане на продуктите при отваряне на страницата
  const fetchClothes = async () => {
    try {
      const response = await fetch('http://localhost:5010/api/clothes');
      if (response.ok) {
        const data = await response.json();
        setClothes(data);
      }
    } catch (error) {
      console.error("Грешка при зареждане на продуктите:", error);
    }
  };

  useEffect(() => {
    fetchClothes();
  }, []);

  // Хендлър за промяна на полетата във формата
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // 2. Добавяне или Редактиране на продукт
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const url = isEditing 
      ? `http://localhost:5010/api/clothes/${formData.id}`
      : 'http://localhost:5010/api/clothes';
      
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Задължително пращаме токена на Админа
        },
        body: JSON.stringify({
          name: formData.name,
          price: parseFloat(formData.price),
          categoryId: parseInt(formData.categoryId),
          imageUrl: formData.imageUrl,
          description: formData.description
        })
      });

      if (response.ok) {
        setMessage(isEditing ? "Продуктът е обновен успешно! 🎉" : "Продуктът е добавен успешно! 🚀");
        resetForm();
        fetchClothes(); // Презареждаме списъка
      } else {
        const errText = await response.text();
        setMessage(`Грешка: ${errText || 'Неуспешна операция'}`);
      }
    } catch (error) {
      setMessage("Грешка при връзка със сървъра.");
    }
  };

  // 3. Изтриване на продукт
  const handleDelete = async (id) => {
    if (!window.confirm("Сигурни ли сте, че искате да изтриете този продукт?")) return;

    try {
      const response = await fetch(`http://localhost:5010/api/clothes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMessage("Продуктът е изтрит успешно!");
        fetchClothes();
      } else {
        setMessage("Грешка при триене.");
      }
    } catch (error) {
      console.error("Грешка:", error);
    }
  };

  // Зареждане на данни за редакция
  const startEdit = (item) => {
    setIsEditing(true);
    // Намираме ID на категорията по име или слагаме 1 по подразбиране
    const cat = categories.find(c => c.name === item.categoryName) || { id: 1 };
    
    setFormData({
      id: item.id,
      name: item.name,
      price: item.price,
      categoryId: cat.id,
      imageUrl: item.imageUrl || '',
      description: item.description || ''
    });
  };

  const resetForm = () => {
    setFormData({ id: null, name: '', price: '', categoryId: 1, imageUrl: '', description: '' });
    setIsEditing(false);
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: '"Segoe UI", sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px', letterSpacing: '1px' }}>УПРАВЛЕНИЕ НА ПРОДУКТИ (ADMIN)</h1>
      
      {message && <div style={{ padding: '12px', backgroundColor: '#e2f0d9', color: '#385723', borderRadius: '4px', marginBottom: '20px', textAlign: 'center', fontWeight: 'bold' }}>{message}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '4px', alignItems: 'start' }}>
        
        {/* ФОРМА ЗА ДОБАВЯНЕ / РЕДАКЦИЯ */}
        <div style={{ backgroundColor: '#f8f9fa', padding: '25px', borderRadius: '8px', border: '1px solid #ddd' }}>
          <h3>{isEditing ? "📝 Редактирай продукт" : "➕ Добави нов продукт"}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Име на продукта:</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Цена (в EUR €):</label>
              <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Категория:</label>
              <select name="categoryId" value={formData.categoryId} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>URL на Изображение:</label>
              <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange} style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Описание на дрехата:</label>
              <textarea name="description" rows="4" value={formData.description} onChange={handleChange} placeholder="Добави детайлно описание за материя, размери..." style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', resize: 'vertical' }}></textarea>
            </div>

            <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#111', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '10px' }}>
              {isEditing ? "Запази промените" : "Създай продукт"}
            </button>
            
            {isEditing && (
              <button type="button" onClick={resetForm} style={{ width: '100%', padding: '10px', backgroundColor: '#aaa', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                Отказ
              </button>
            )}
          </form>
        </div>

        {/* ТАБЛИЦА С ТЕКУЩИТЕ ПРОДУКТИ */}
        <div style={{ paddingLeft: '20px' }}>
          <h3>📦 Всички налични продукти ({clothes.length})</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px', border: '1px solid #ddd' }}>
            <thead>
              <tr style={{ backgroundColor: '#111', color: '#fff' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Снимка</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Име</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Категория</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Цена</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {clothes.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '10px' }}>
                    <img src={item.imageUrl || 'https://via.placeholder.com/50'} alt={item.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                  </td>
                  <td style={{ padding: '10px', fontWeight: '600' }}>
                    {item.name}
                    <div style={{ fontSize: '12px', color: '#666', fontWeight: 'normal', marginTop: '4px', maxWidth: '250px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {item.description || 'Няма описание'}
                    </div>
                  </td>
                  <td style={{ padding: '10px', color: '#555' }}>{item.categoryName}</td>
                  <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: '#28a745' }}>{item.price.toFixed(2)} €</td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    <button onClick={() => startEdit(item)} style={{ padding: '6px 12px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px', fontWeight: '600' }}>Редактирай</button>
                    <button onClick={() => handleDelete(item.id)} style={{ padding: '6px 12px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>Изтрий</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default AdminPanel;