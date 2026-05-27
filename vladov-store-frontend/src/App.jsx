import React, { useState, useEffect } from 'react';

function App() {
  const [clothes, setClothes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState({});

  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const [token, setToken] = useState(() => localStorage.getItem('token') || null); 
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem('userEmail') || null); 

  const [orderHistory, setOrderHistory] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const [isAuthOpen, setIsAuthOpen] = useState(false); 
  const [authMode, setAuthMode] = useState('login'); 
  const [authEmail, setAuthEmail] = useState(''); 
  const [authPassword, setAuthPassword] = useState(''); 
  const [authError, setAuthError] = useState(null); 

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000); 
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  useEffect(() => {
    fetch('http://localhost:5010/api/clothes') 
      .then(response => {
        if (!response.ok) throw new Error('Проблем при връзката с бекенда!');
        return response.json();
      })
      .then(data => {
        setClothes(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (userEmail) {
      const savedOrders = localStorage.getItem(`orders_${userEmail}`);
      setOrderHistory(savedOrders ? JSON.parse(savedOrders) : []);
    } else {
      setOrderHistory([]);
    }
  }, [userEmail]);

  const handleCheckout = async () => {
    if (!token) {
      alert('Моля, първо влезте в профила си, за да завършите поръчката! 👤');
      setIsAuthOpen(true);
      return;
    }

    try {
      const promises = cart.map(item => 
        fetch(`http://localhost:5010/api/clothes/${item.id}/buy`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).then(res => {
          if (!res.ok) throw new Error(`Грешка при покупката на ${item.name}`);
          return res.json();
        })
      );

      await Promise.all(promises);

      const newOrder = {
        orderId: `VLD-${Math.floor(100000 + Math.random() * 900000)}`,
        date: new Date().toLocaleString('bg-BG', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        items: [...cart],
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      };

      const updatedHistory = [newOrder, ...orderHistory];
      setOrderHistory(updatedHistory);
      localStorage.setItem(`orders_${userEmail}`, JSON.stringify(updatedHistory));

      alert(`🎉 УСПЕШНА ПОРЪЧКА!\n\nИзпратихме автоматично потвърждение на имейл: ${userEmail}.\nМожете да следите поръчката си в секция "Моите Поръчки"! ✉️🚀`);
      
      setCart([]); 
      setIsCartOpen(false); 
    } catch (err) {
      console.error(err);
      alert('Грешка при финализиране на поръчката: ' + err.message);
    }
  };

  const addToCart = (product) => {
    const size = selectedSizes[product.id] || 'M';
    setCart((prevCart) => {
      const existingItem = prevCart.find(item => item.id === product.id && item.size === size);
      if (existingItem) {
        return prevCart.map(item =>
          (item.id === product.id && item.size === size) ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1, size: size }];
    });

    setToastMessage(`✨ Успешно добавено: ${product.name} (Размер: ${size}) 🛒`);
    setShowToast(true);
  };

  const removeFromCart = (productId, size) => {
    setCart((prevCart) => prevCart.filter(item => !(item.id === productId && item.size === size)));
  };

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
        localStorage.setItem('token', jwtToken);
        localStorage.setItem('userEmail', authEmail);
        setToken(jwtToken);
        setUserEmail(authEmail);
        setIsAuthOpen(false);
        setAuthEmail('');
        setAuthPassword('');
      } else {
        alert('Регистрацията е успешна! Сега можете да влезете в профила си.');
        setAuthMode('login');
      }
    })
    .catch(err => {
      setAuthError(err.message);
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    setToken(null);
    setUserEmail(null);
    setIsHistoryOpen(false);
    alert('Успешно излязохте.');
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif', position: 'relative' }}>
      
      <nav style={{ backgroundColor: '#111', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff', position: 'sticky', top: 0, zIndex: 100 }}>
        <h2 style={{ margin: 0, fontSize: '24px', letterSpacing: '1px', cursor: 'pointer' }}>VLADOV CLOTHING STORE</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          
          <button onClick={() => setIsCartOpen(!isCartOpen)} style={{ backgroundColor: '#fff', border: 'none', color: '#111', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🛒 Количка ({totalItems})
          </button>

          {userEmail ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '14px', color: '#ccc' }}>👤 {userEmail}</span>
              <button onClick={() => setIsHistoryOpen(true)} style={{ backgroundColor: '#333', border: 'none', color: '#fff', padding: '8px 14px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>
                📜 Моите Поръчки ({orderHistory.length})
              </button>
              <button onClick={handleLogout} style={{ backgroundColor: 'transparent', border: '1px solid #ff4d4d', color: '#ff4d4d', padding: '8px 14px', borderRadius: '4px', cursor: 'pointer' }}>Изход</button>
            </div>
          ) : (
            <button onClick={() => { setIsAuthOpen(true); setAuthError(null); }} style={{ backgroundColor: 'transparent', border: '1px solid #fff', color: '#fff', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Вход / Регистрация</button>
          )}
        </div>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        <h3 style={{ textAlign: 'center', marginBottom: '40px', fontWeight: '600', color: '#222' }}>Лятна Колекция 2026 🚀</h3>

        {loading && <h4 style={{ textAlign: 'center', color: '#666' }}>Зареждане на продуктите... ⏳</h4>}
        {error && <div style={{ textAlign: 'center', color: 'red' }}><h5>Грешка: {error}</h5></div>}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
          {clothes.map((cloth) => (
            <div key={cloth.id} style={{ backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
              <img src={cloth.imageUrl && cloth.imageUrl.trim() !== "" ? cloth.imageUrl : "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&q=80"} alt={cloth.name} style={{ width: '100%', height: '350px', objectFit: 'cover' }} />
              
              <div style={{ padding: '20px' }}>
                <span style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>{cloth.categoryName || 'Nike Collection'}</span>
                <h4 style={{ fontSize: '16px', margin: '5px 0 10px 0', color: '#333', height: '40px', overflow: 'hidden' }}>{cloth.name}</h4>
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '8px', fontWeight: '500' }}>Изберете размер:</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['S', 'M', 'L', 'XL'].map((size) => {
                      const isSelected = (selectedSizes[cloth.id] || 'M') === size;
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setSelectedSizes({ ...selectedSizes, [cloth.id]: size })}
                          style={{
                            flex: 1,
                            padding: '8px 0',
                            border: isSelected ? '1px solid #111' : '1px solid #ddd',
                            backgroundColor: isSelected ? '#111' : '#fff',
                            color: isSelected ? '#fff' : '#111',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
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
                    <div style={{ fontSize: '11px', color: '#fff', backgroundColor: '#111', display: 'inline-block', padding: '2px 6px', borderRadius: '3px', marginBottom: '5px', fontWeight: 'bold' }}>Размер: {item.size}</div>
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
              <button onClick={handleCheckout} style={{ backgroundColor: '#111', color: '#fff', border: 'none', width: '100%', padding: '15px', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
                Завърши поръчката
              </button>
            </div>
          )}
        </div>
      )}

      {isHistoryOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '8px', width: '550px', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', position: 'relative' }}>
            <button onClick={() => setIsHistoryOpen(false)} style={{ position: 'absolute', top: '15px', right: '15px', backgroundColor: 'transparent', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#888' }}>✕</button>
            <h4 style={{ margin: '0 0 5px 0', fontSize: '24px', fontWeight: 'bold' }}>📜 История на Вашите Поръчки</h4>
            <p style={{ fontSize: '13px', color: '#666', marginBottom: '25px' }}>Потребител: {userEmail}</p>

            {orderHistory.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#888', padding: '30px 0' }}>Все още нямате направени поръчки. 🛍️</p>
            ) : (
              orderHistory.map((order) => (
                <div key={order.orderId} style={{ border: '1px solid #ddd', borderRadius: '6px', padding: '15px', marginBottom: '20px', backgroundColor: '#fdfdfd' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #eee', paddingBottom: '10px', marginBottom: '10px' }}>
                    <span style={{ fontWeight: 'bold', color: '#111' }}>Поръчка № {order.orderId}</span>
                    <span style={{ fontSize: '13px', color: '#666' }}>📅 {order.date}</span>
                  </div>
                  <div>
                    {order.items.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '6px', color: '#444' }}>
                        <span>• {item.name} <strong>({item.size})</strong> x{item.quantity}</span>
                        <span>{(item.price * item.quantity).toFixed(2)} лв.</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ textAlign: 'right', marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #eee', fontWeight: 'bold', fontSize: '16px', color: '#111' }}>
                    Обща сума: {order.total.toFixed(2)} лв.
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {showToast && (
        <div style={{
          position: 'fixed',
          bottom: '30px',
          left: '30px',
          backgroundColor: '#111',
          color: '#fff',
          padding: '16px 28px',
          borderRadius: '8px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
          zIndex: 3000,
          fontSize: '14px',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          {toastMessage}
        </div>
      )}

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