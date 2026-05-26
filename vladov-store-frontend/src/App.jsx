import React, { useState, useEffect } from 'react';

function App() {
  const [clothes, setClothes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // --- СЪСТОЯНИЯ ЗА КОЛИЧКАТА ---
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // --- СЪСТОЯНИЕ ЗА ИЗБРАНИТЕ РАЗМЕРИ В КАТАЛОГА ---
  const [selectedSizes, setSelectedSizes] = useState({}); // Пази избрания размер за всяка дреха по нейното ID

  // --- СЪСТОЯНИЯ ЗА ПОТРЕБИТЕЛ (AUTH) ---
  const [token, setToken] = useState(null); 
  const [userEmail, setUserEmail] = useState(null); 
  const [isAuthOpen, setIsAuthOpen] = useState(false); 
  const [authMode, setAuthMode] = useState('login'); 
  const [authEmail, setAuthEmail] = useState(''); 
  const [authPassword, setAuthPassword] = useState(''); 
  const [authError, setAuthError] = useState(null); 

  useEffect(() => {
    fetch('http://localhost:5010/api/clothes') 
      .then(response => {
        if (!response.ok) {
          throw new Error('Проблем при връзката с бекенда!');
        }
        return response.json();
      })
      .then(data => {
        console.log("Ето какво точно идва от базата данни:", data);
        setClothes(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Грешка при зареждане:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // --- ФУНКЦИЯ ЗА ЗАВЪРШВАНЕ НА ПОРЪЧКАТА (ИЗПРАЩАНЕ КЪМ БЕКЕНДА И ИМЕЙЛ) ---
  const handleCheckout = async () => {
    if (!token) {
      alert('Моля, първо влезте в профила си, за да завършите поръчката и да получите имейл! 👤');
      setIsAuthOpen(true);
      return;
    }

    try {
      // Тъй като бекендът изисква поръчка за всяко ID поотделно (/api/clothes/{id}/buy),
      // ще завъртим цикъл през всички неща в количката и ще ги изстреляме едновременно.
      const promises = cart.map(item => 
        fetch(`http://localhost:5010/api/clothes/${item.id}/buy`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`, // Предаваме JWT токена за сигурност
            'Content-Type': 'application/json'
          }
        }).then(res => {
          if (!res.ok) {
            throw new Error(`Проблем при покупката на ${item.name}`);
          }
          return res.text();
        })
      );

      // Изчакваме бекендът да обработи всички продукти
      await Promise.all(promises);

      // БЕКЕНДЪТ Е ВЪРНАЛ 200 OK -> ИМЕЙЛЪТ Е ИЗПРАТЕН АВТОМАТИЧНО!
      alert(`🎉 Успешна поръчка, ${userEmail}! Проверете пощата си за имейл известие от нас! ✉️🚀`);
      
      setCart([]); // Изчистваме количката
      setIsCartOpen(false); // Затваряме панела
    } catch (err) {
      console.error(err);
      alert('Грешка при финализиране на поръчката: ' + err.message);
    }
  };

  // --- ФУНКЦИЯ ЗА ДОБАВЯНЕ В КОЛИЧКАТА (С РАЗМЕР) ---
  const addToCart = (product) => {
    // Вземаме избрания размер за тази дреха (ако няма избран, слагаме по подразбиране 'M')
    const size = selectedSizes[product.id] || 'M';

    setCart((prevCart) => {
      // Проверяваме дали същата дреха СЪС СЪЩИЯ РАЗМЕР вече е вътре
      const existingItem = prevCart.find(item => item.id === product.id && item.size === size);
      if (existingItem) {
        return prevCart.map(item =>
          (item.id === product.id && item.size === size) ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1, size: size }];
    });
    setIsCartOpen(true);
  };

  // --- ФУНКЦИЯ ЗА ПРЕМАХВАНЕ ОТ КОЛИЧКАТА ---
  const removeFromCart = (productId, size) => {
    setCart((prevCart) => prevCart.filter(item => !(item.id === productId && item.size === size)));
  };

  // --- ВХОД И РЕГИСТРАЦИЯ ---
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setAuthError(null);
    const endpoint = authMode === 'login' ? 'login' : 'register';
    
    fetch(`http://localhost:5010/api/Auth/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: authEmail, password: authPassword })
    })
    .then(async response => {
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Грешка при автентикация!');
      }
      return response.text().then(text => text ? JSON.parse(text) : {});
    })
    .then(data => {
      if (authMode === 'login') {
        const jwtToken = data.token || data; 
        setToken(jwtToken);
        setUserEmail(authEmail);
        setIsAuthOpen(false);
        alert(`Добре дошли, ${authEmail}! 👋`);
        setAuthEmail('');
        setAuthPassword('');
      } else {
        alert('Регистрацията е успешна! Сега можете да влезете с трика за тест.');
        setAuthMode('login');
      }
    })
    .catch(err => {
      console.error(err);
      setAuthError(err.message);
    });
  };

  const handleLogout = () => {
    setToken(null);
    setUserEmail(null);
    alert('Успешно излязохте.');
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif', position: 'relative', overflowX: 'hidden' }}>
      
      {/* НАВИГАЦИЯ */}
      <nav style={{ backgroundColor: '#111', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff', position: 'sticky', top: 0, zIndex: 100 }}>
        <h2 style={{ margin: 0, fontSize: '24px', letterSpacing: '1px' }}>VLADOV CLOTHING</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button onClick={() => setIsCartOpen(!isCartOpen)} style={{ backgroundColor: '#fff', border: 'none', color: '#111', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🛒 Количка ({totalItems})
          </button>

          {userEmail ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{ fontSize: '14px', color: '#ccc' }}>👤 {userEmail}</span>
              <button onClick={handleLogout} style={{ backgroundColor: 'transparent', border: '1px solid #ff4d4d', color: '#ff4d4d', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Изход</button>
            </div>
          ) : (
            <button onClick={() => { setIsAuthOpen(true); setAuthError(null); }} style={{ backgroundColor: 'transparent', border: '1px solid #fff', color: '#fff', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Вход / Регистрация</button>
          )}
        </div>
      </nav>

      {/* КАТАЛОГ С ПРОДУКТИ */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        <h3 style={{ textAlign: 'center', marginBottom: '40px', fontWeight: '600', color: '#222' }}>Нова Колекция 2026 🚀</h3>

        {loading && <h4 style={{ textAlign: 'center', color: '#666' }}>Зареждане на продуктите... ⏳</h4>}
        {error && <div style={{ textAlign: 'center', color: 'red' }}><h5>Грешка: {error}</h5></div>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
          {clothes.map((cloth) => (
            <div key={cloth.id} style={{ backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
              <img src={cloth.imageUrl && cloth.imageUrl.trim() !== "" ? cloth.imageUrl : "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&q=80"} alt={cloth.name} style={{ width: '100%', height: '350px', objectFit: 'cover' }} />
              
              <div style={{ padding: '20px' }}>
                <span style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>{cloth.categoryName || 'Summer Collection'}</span>
                <h4 style={{ fontSize: '16px', margin: '5px 0 10px 0', color: '#333', height: '40px', overflow: 'hidden' }}>{cloth.name}</h4>
                
                {/* --- НОВО: ИЗБОР НА РАЗМЕР В КАТАЛОГА --- */}
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '5px' }}>Изберете размер:</label>
                  <select 
                    value={selectedSizes[cloth.id] || 'M'} 
                    onChange={(e) => setSelectedSizes({ ...selectedSizes, [cloth.id]: e.target.value })}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', backgroundColor: '#fff', cursor: 'pointer' }}
                  >
                    <option value="S">Размер S</option>
                    <option value="M">Размер M</option>
                    <option value="L">Размер L</option>
                    <option value="XL">Размер XL</option>
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                  <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#111' }}>{cloth.price ? cloth.price.toFixed(2) : '0.00'} лв.</span>
                  <button onClick={() => addToCart(cloth)} style={{ backgroundColor: '#111', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '4px', fontWeight: '600', cursor: 'pointer' }}>Купи</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- СТРАНИЧЕН ПАНЕЛ ЗА КОЛИЧКАТА (SIDEBAR) --- */}
      {isCartOpen && (
        <div style={{ position: 'fixed', top: 0, right: 0, width: '360px', height: '100vh', backgroundColor: '#fff', boxShadow: '-5px 0 25px rgba(0,0,0,0.15)', zIndex: 1000, display: 'flex', flexDirection: 'column', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '20px' }}>
            <h4 style={{ margin: 0, fontSize: '20px' }}>Твоята количка</h4>
            <button onClick={() => setIsCartOpen(false)} style={{ backgroundColor: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#888' }}>✕</button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {cart.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#888', marginTop: '40px' }}>Количката ти е празна. 🛒</p>
            ) : (
              cart.map((item) => (
                <div key={`${item.id}-${item.size}`} style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'center', borderBottom: '1px solid #f9f9f9', paddingBottom: '10px' }}>
                  <img src={item.imageUrl} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                  <div style={{ flex: 1 }}>
                    <h5 style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#333' }}>{item.name}</h5>
                    {/* ПОКАЗВАМЕ ИЗБРАНИЯ РАЗМЕР В КОЛИЧКАТА */}
                    <div style={{ fontSize: '12px', color: '#fff', backgroundColor: '#555', display: 'inline-block', padding: '2px 6px', borderRadius: '3px', marginBottom: '5px', fontWeight: 'bold' }}>Размер: {item.size}</div>
                    <br/>
                    <span style={{ fontSize: '14px', color: '#666' }}>{item.quantity} x {item.price.toFixed(2)} лв.</span>
                  </div>
                  <button onClick={() => removeFromCart(item.id, item.size)} style={{ backgroundColor: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>Изтрий</button>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div style={{ borderTop: '1px solid #eee', paddingTop: '20px', marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', marginBottom: '20px' }}>
                <span>Общо:</span>
                <span>{totalPrice.toFixed(2)} лв.</span>
              </div>
              {/* СВЪРЗВАНЕ НА ИСТИНСКАТА ФУНКЦИЯ ТУК */}
              <button 
                onClick={handleCheckout} 
                style={{ backgroundColor: '#111', color: '#fff', border: 'none', width: '100%', padding: '15px', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Завърши поръчката
              </button>
            </div>
          )}
        </div>
      )}

      {/* --- ПРОЗОРЕЦ ЗА ВХОД / РЕГИСТРАЦИЯ (AUTH MODAL) --- */}
      {/* ... остава същият код за формата за लॉगिन ... */}
      {isAuthOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '8px', width: '340px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', position: 'relative' }}>
            <button onClick={() => setIsAuthOpen(false)} style={{ position: 'absolute', top: '15px', right: '15px', backgroundColor: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#888' }}>✕</button>
            <h4 style={{ margin: '0 0 20px 0', fontSize: '22px', textAlign: 'center' }}>{authMode === 'login' ? 'Вход в профила' : 'Регистрация'}</h4>
            {authError && <div style={{ color: 'red', fontSize: '14px', marginBottom: '15px', textAlign: 'center' }}>⚠️ {authError}</div>}
            <form onSubmit={handleAuthSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#555' }}>Имейл адрес:</label>
                <input type="email" required value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} placeholder="your@email.com" />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#555' }}>Парола:</label>
                <input type="password" required value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} placeholder="••••••••" />
              </div>
              <button type="submit" style={{ backgroundColor: '#111', color: '#fff', border: 'none', width: '100%', padding: '12px', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '15px' }}>{authMode === 'login' ? 'Влез' : 'Регистрирай се'}</button>
            </form>
            <div style={{ textAlign: 'center', fontSize: '14px', color: '#666' }}>
              {authMode === 'login' ? (
                <span>Нямате профил? <a href="#" onClick={(e) => { e.preventDefault(); setAuthMode('register'); setAuthError(null); }} style={{ color: '#111', fontWeight: 'bold' }}>Регистрирайте се</a></span>
              ) : (
                <span>Вече имате профил? <a href="#" onClick={(e) => { e.preventDefault(); setAuthMode('login'); setAuthError(null); }} style={{ color: '#111', fontWeight: 'bold' }}>Влезте оттук</a></span>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;