import AdminPanel from './AdminPanel';
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

  const [isAddClothOpen, setIsAddClothOpen] = useState(false);
  const [newClothName, setNewClothName] = useState('');
  const [newClothPrice, setNewClothPrice] = useState('');
  const [newClothCategoryId, setNewClothCategoryId] = useState('1');
  const [newClothImageUrl, setNewClothImageUrl] = useState('');
  const [newClothDescription, setNewClothDescription] = useState('');

  const [selectedCloth, setSelectedCloth] = useState(null);          
  const [selectedQuantities, setSelectedQuantities] = useState({}); 

  const [isCheckoutStage, setIsCheckoutStage] = useState(false); 
  const [deliveryName, setDeliveryName] = useState('');
  const [deliveryPhone, setDeliveryPhone] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Наложен платеж');

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const loadClothes = () => {
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
  };

  useEffect(() => {
    loadClothes();
  }, []);

  useEffect(() => {
    if (userEmail) {
      const savedOrders = localStorage.getItem(`orders_${userEmail}`);
      setOrderHistory(savedOrders ? JSON.parse(savedOrders) : []);
    } else {
      setOrderHistory([]);
    }
  }, [userEmail]);

  const handleAddClothSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      alert('Трябва да сте логнат като Админ!');
      return;
    }

    const clothData = {
      name: newClothName,
      price: parseFloat(newClothPrice),
      categoryId: parseInt(newClothCategoryId) || 1,
      imageUrl: newClothImageUrl,
      description: newClothDescription 
    };

    try {
      const response = await fetch('http://localhost:5010/api/clothes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(clothData)
      });

      if (!response.ok) {
        if (response.status === 403) throw new Error('Достъпът е отказан! Нужни са "Admin" права. 🔑');
        const errorDetail = await response.text();
        throw new Error(`Грешка: ${errorDetail}`);
      }

      alert('🎉 Артикулът беше добавен успешно в магазина!');
      setNewClothName('');
      setNewClothPrice('');
      setNewClothImageUrl('');
      setNewClothDescription(''); 
      setIsAddClothOpen(false);
      loadClothes();
    } catch (err) {
      alert('⚠️ Грешка: ' + err.message);
    }
  };

  const handleDeleteCloth = async (id) => {
    const isConfirmed = window.confirm('Сигурен ли сте, че искате да премахнете този артикул? 🗑️');
    if (!isConfirmed) return;
    
    try {
      const response = await fetch(`http://localhost:5010/api/clothes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        if (response.status === 403) throw new Error('Нямате админски права! 🔑');
        throw new Error('Възникна проблем при изтриването.');
      }

      alert('🎉 Артикулът беше премахнат успешно!');
      loadClothes(); 
    } catch (err) {
      alert('⚠️ Грешка: ' + err.message);
    }
  };

  const handleFinalOrderSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      alert('Моля, първо влезте в профила си! 👤');
      setIsAuthOpen(true);
      return;
    }

    const orderData = {
      userEmail: userEmail,
      fullName: deliveryName,
      phoneNumber: deliveryPhone,
      city: deliveryCity,
      deliveryAddress: deliveryAddress,
      paymentMethod: paymentMethod,
      items: cart.map(item => ({
        clothingItemId: item.id,
        size: item.size,
        quantity: item.quantity
      }))
    };

    try {
      const response = await fetch('http://localhost:5010/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'Неуспешна поръчка.');
      }

      const shippingFee = totalPrice >= 100 ? 0 : 5;
      const newOrderForHistory = {
        orderId: `VLD-${Math.floor(100000 + Math.random() * 900000)}`,
        date: new Date().toLocaleString('bg-BG'),
        items: [...cart],
        total: totalPrice + shippingFee
      };

      const updatedHistory = [newOrderForHistory, ...orderHistory];
      setOrderHistory(updatedHistory);
      localStorage.setItem(`orders_${userEmail}`, JSON.stringify(updatedHistory));

      alert(`🎉 УСПЕШНА ПОРЪЧКА!\n\nТя беше записана в системата.\n\n🚚 Доставка: ${shippingFee === 0 ? 'БЕЗПЛАТНА' : shippingFee.toFixed(2) + ' €'}\n📦 Опция: Преглед и тест включени!\nПолучател: ${deliveryName}`);
      
      setCart([]);
      setIsCartOpen(false);
      setIsCheckoutStage(false);
      setDeliveryName('');
      setDeliveryPhone('');
      setDeliveryCity('');
      setDeliveryAddress('');
    } catch (err) {
      alert('Грешка при изпращане на поръчката: ' + err.message);
    }
  };

  const addToCart = (product, customQuantity = 1) => {
    const size = selectedSizes[product.id] || 'M';
    setCart((prevCart) => {
      const existingItem = prevCart.find(item => item.id === product.id && item.size === size);
      if (existingItem) {
        return prevCart.map(item =>
          (item.id === product.id && item.size === size) ? { ...item, quantity: item.quantity + customQuantity } : item
        );
      }
      return [...prevCart, { ...product, quantity: customQuantity, size: size }];
    });

    setToastMessage(`✨ Добавено: ${product.name} (${customQuantity}бр., Размер: ${size}) 🛒`);
    setShowToast(true);
  };

  const updateCartQuantity = (productId, size, newQty) => {
    if (newQty < 1) return;
    setCart(prevCart => prevCart.map(item => 
      (item.id === productId && item.size === size) ? { ...item, quantity: newQty } : item
    ));
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
      return response.json();
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
    setIsAddClothOpen(false);
    alert('Успешно излязохте.');
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const shippingCost = totalPrice >= 100 ? 0 : 5.00; 
  const finalPriceWithShipping = totalPrice + shippingCost;

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
              <button onClick={() => setIsAddClothOpen(true)} style={{ backgroundColor: '#007bff', border: 'none', color: '#fff', padding: '8px 14px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>
                ➕ Добави Дреха
              </button>
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

        <div style={{ backgroundColor: '#111', color: '#fff', textAlign: 'center', padding: '10px', borderRadius: '6px', marginBottom: '30px', fontWeight: 'bold', letterSpacing: '0.5px', fontSize: '14px' }}>
          ✨ БЕЗПЛАТНА ДОСТАВКА ЗА ПОРЪЧКИ НАД 100.00 € | Включена опция "Преглед и тест" за всяка доставка! 📦
        </div>

        <h3 style={{ textAlign: 'center', marginBottom: '40px', fontWeight: '600', color: '#222' }}>Лятна Колекция 2026 🚀</h3>
        {loading && <h4 style={{ textAlign: 'center', color: '#666' }}>Зареждане на продуктите... ⏳</h4>}
        {error && <div style={{ textAlign: 'center', color: 'red' }}><h5>Грешка: {error}</h5></div>}
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
          {clothes.map((cloth) => {
            const currentQty = selectedQuantities[cloth.id] || 1;
            return (
              <div key={cloth.id} style={{ backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                
                <img 
                  src={cloth.imageUrl && cloth.imageUrl.trim() !== "" ? cloth.imageUrl : "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&q=80"} 
                  alt={cloth.name} 
                  onClick={() => setSelectedCloth(cloth)}
                  style={{ width: '100%', height: '350px', objectFit: 'cover', cursor: 'pointer' }} 
                />
                
                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>{cloth.categoryName || 'Nike Collection'}</span>
                    <h4 
                      onClick={() => setSelectedCloth(cloth)}
                      style={{ fontSize: '16px', margin: '5px 0 10px 0', color: '#333', height: '40px', overflow: 'hidden', cursor: 'pointer' }}
                    >
                      {cloth.name}
                    </h4>
           
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '6px', fontWeight: '500' }}>Изберете размер:</label>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {['S', 'M', 'L', 'XL'].map((size) => {
                          const isSelected = (selectedSizes[cloth.id] || 'M') === size;
                          return (
                            <button
                              key={size}
                              type="button"
                              onClick={() => setSelectedSizes({ ...selectedSizes, [cloth.id]: size })}
                              style={{
                                flex: 1,
                                padding: '6px 0',
                                border: isSelected ? '1px solid #111' : '1px solid #ddd',
                                backgroundColor: isSelected ? '#111' : '#fff',
                                color: isSelected ? '#fff' : '#111',
                                borderRadius: '4px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                fontSize: '13px'
                              }}
                            >
                              {size}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div style={{ marginBottom: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <label style={{ fontSize: '12px', color: '#666', fontWeight: '500' }}>Бройки (Количество):</label>
                      <select 
                        value={currentQty} 
                        onChange={(e) => setSelectedQuantities({ ...selectedQuantities, [cloth.id]: parseInt(e.target.value) })}
                        style={{ padding: '5px 10px', borderRadius: '4px', border: '1px solid #ccc', fontWeight: 'bold', backgroundColor: '#fff' }}
                      >
                        {[...Array(10).keys()].map(x => (
                          <option key={x + 1} value={x + 1}>{x + 1}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                    <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#111' }}>{cloth.price ? cloth.price.toFixed(2) : '0.00'} €</span>
                    
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {token && (
                        <button 
                          onClick={() => handleDeleteCloth(cloth.id)} 
                          style={{ backgroundColor: '#ff4d4d', color: '#fff', border: 'none', padding: '10px 12px', borderRadius: '4px', fontWeight: '600', cursor: 'pointer' }}
                        >
                          🗑️
                        </button>
                      )}
                      <button 
                        onClick={() => addToCart(cloth, currentQty)} 
                        style={{ backgroundColor: '#111', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '4px', fontWeight: '600', cursor: 'pointer' }}
                      >
                        Купи
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedCloth && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '12px', width: '480px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', position: 'relative', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <button onClick={() => setSelectedCloth(null)} style={{ position: 'absolute', top: '15px', right: '15px', backgroundColor: 'transparent', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#888' }}>✕</button>
            
            <img src={selectedCloth.imageUrl && selectedCloth.imageUrl.trim() !== "" ? selectedCloth.imageUrl : "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&q=80"} alt={selectedCloth.name} style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '6px' }} />
            
            <div>
              <span style={{ fontSize: '12px', color: '#888', textTransform: 'uppercase', fontWeight: 'bold' }}>{selectedCloth.categoryName || 'Nike Collection'}</span>
              <h3 style={{ margin: '5px 0 5px 0', color: '#111', fontSize: '22px', fontWeight: '600' }}>{selectedCloth.name}</h3>
              <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#28a745' }}>{selectedCloth.price ? selectedCloth.price.toFixed(2) : '0.00'} €</span>
            </div>

            <div style={{ borderTop: '1px solid #eee', paddingTop: '10px' }}>
              <h5 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#111', fontWeight: 'bold' }}>📋 Описание и състав на артикула:</h5>
              <p style={{ margin: 0, fontSize: '14px', color: '#555', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                {selectedCloth.description && selectedCloth.description.trim() !== "" 
                  ? selectedCloth.description 
                  : "Този артикул е част от ексклузивната ни колекция. Изработен от висококачествени първокласни материали за максимален комфорт."
                }
              </p>
            </div>
            
            <button onClick={() => setSelectedCloth(null)} style={{ backgroundColor: '#111', color: '#fff', border: 'none', padding: '12px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
              Затвори детайлите
            </button>
          </div>
        </div>
      )}

      {isCartOpen && (
        <div style={{ position: 'fixed', top: 0, right: 0, width: '380px', height: '100vh', backgroundColor: '#fff', boxShadow: '-5px 0 25px rgba(0,0,0,0.15)', zIndex: 1000, display: 'flex', flexDirection: 'column', padding: '20px', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '20px' }}>
            <h4 style={{ margin: 0, fontSize: '20px' }}>{isCheckoutStage ? '📋 Данни за Доставка' : 'Твоята количка'}</h4>
            <button onClick={() => { setIsCartOpen(false); setIsCheckoutStage(false); }} style={{ backgroundColor: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#888' }}>✕</button>
          </div>

          {!isCheckoutStage ? (
            <>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {cart.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#888', marginTop: '40px' }}>Количката ти е празна. 🛒</p>
                ) : (
                  cart.map((item) => (
                    <div key={`${item.id}-${item.size}`} style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'center', borderBottom: '1px solid #f9f9f9', paddingBottom: '10px' }}>
                      <img src={item.imageUrl && item.imageUrl.trim() !== "" ? item.imageUrl : "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&q=80"} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                      <div style={{ flex: 1 }}>
                        <h5 style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#333' }}>{item.name}</h5>
                        <div style={{ fontSize: '11px', color: '#fff', backgroundColor: '#111', display: 'inline-block', padding: '2px 6px', borderRadius: '3px', marginBottom: '8px', fontWeight: 'bold' }}>Размер: {item.size}</div>
                        <br/>
                        <span style={{ fontSize: '13px', color: '#666' }}>Количество: </span>
                        <select 
                          value={item.quantity} 
                          onChange={(e) => updateCartQuantity(item.id, item.size, parseInt(e.target.value))}
                          style={{ padding: '2px 5px', borderRadius: '4px', border: '1px solid #ccc', fontWeight: 'bold', marginRight: '5px' }}
                        >
                          {[...Array(10).keys()].map(x => (
                            <option key={x + 1} value={x + 1}>{x + 1}</option>
                          ))}
                        </select>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#111' }}>{(item.price * item.quantity).toFixed(2)} €</span>
                      </div>
                      <button onClick={() => removeFromCart(item.id, item.size)} style={{ backgroundColor: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>Изтрий</button>
                    </div>
                  ))
                )}
              </div>
              {cart.length > 0 && (
                <div style={{ borderTop: '1px solid #eee', paddingTop: '20px', marginTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', marginBottom: '8px' }}>
                    <span>Междинна сума:</span>
                    <span>{totalPrice.toFixed(2)} €</span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', marginBottom: '15px', color: shippingCost === 0 ? '#28a745' : '#111', fontWeight: shippingCost === 0 ? 'bold' : 'normal' }}>
                    <span>Доставка:</span>
                    <span>{shippingCost === 0 ? 'БЕЗПЛАТНА 🎉' : `${shippingCost.toFixed(2)} €`}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', borderTop: '1px solid #f1f1f1', paddingTop: '10px' }}>
                    <span>Общо:</span>
                    <span>{finalPriceWithShipping.toFixed(2)} €</span>
                  </div>

                  <button 
                    onClick={() => {
                      if (!token) {
                        alert('Моля, първо влезте в профила си! 👤');
                        setIsAuthOpen(true);
                      } else {
                        setIsCheckoutStage(true);
                      }
                    }} 
                    style={{ backgroundColor: '#111', color: '#fff', border: 'none', width: '100%', padding: '15px', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    Продължи към Доставка
                  </button>
                </div>
              )}
            </>
          ) : (

            <form onSubmit={handleFinalOrderSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflowY: 'auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                <div style={{ backgroundColor: '#e9f7ef', border: '1px solid #28a745', padding: '10px', borderRadius: '6px', fontSize: '13px', color: '#196f3d', fontWeight: '500' }}>
                  🔍 <strong>Включена опция: Преглед и Тест!</strong> Имената и пратката ще бъдат изпратени с право да отворите и пробвате дрехите преди да платите на куриера.
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', color: '#555', fontWeight: '600' }}>Име и Фамилия на получателя:</label>
                  <input type="text" required value={deliveryName} onChange={(e) => setDeliveryName(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} placeholder="Иван Иванов" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', color: '#555', fontWeight: '600' }}>Телефон за връзка:</label>
                  <input type="tel" required value={deliveryPhone} onChange={(e) => setDeliveryPhone(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} placeholder="08XXXXXXXX" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', color: '#555', fontWeight: '600' }}>Град/Село:</label>
                  <input type="text" required value={deliveryCity} onChange={(e) => setDeliveryCity(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} placeholder="София" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', color: '#555', fontWeight: '600' }}>Адрес за доставка (Офис на Еконт / Спиди или личен):</label>
                  <input type="text" required value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} placeholder="Офис на Еконт - ул. Централна 12" />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', color: '#555', fontWeight: '600' }}>Начин на плащане:</label>
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px', fontWeight: 'bold' }}>
                    <option value="Наложен платеж">Наложен платеж (в брой/карта на куриера)</option>
                    <option value="Карта">Онлайн плащане с Карта</option>
                  </select>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #eee', paddingTop: '15px', marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '5px' }}>
                  <span>Доставка:</span>
                  <span>{shippingCost === 0 ? 'БЕЗПЛАТНА' : `${shippingCost.toFixed(2)} €`}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', marginBottom: '15px' }}>
                  <span>Крайна сума:</span>
                  <span>{finalPriceWithShipping.toFixed(2)} €</span>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" onClick={() => setIsCheckoutStage(false)} style={{ flex: 1, backgroundColor: '#ccc', color: '#111', border: 'none', padding: '12px', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>Назад</button>
                  <button type="submit" style={{ flex: 2, backgroundColor: '#28a745', color: '#fff', border: 'none', padding: '12px', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>Потвърди поръчката 🚀</button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}

    
      {isAddClothOpen && (
  <div style={{ 
    position: 'fixed', 
    top: 0, 
    left: 0, 
    width: '100vw', 
    height: '100vh', 
    backgroundColor: '#ffffff', 
    zIndex: 2000, 
    overflowY: 'auto', 
    padding: '20px',
    boxSizing: 'border-box'
  }}>

    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '10px 0', display: 'flex', justifyContent: 'flex-end' }}>
      <button 
        onClick={() => { 
          setIsAddClothOpen(false); 
          loadClothes(); 
        }} 
        style={{ 
          padding: '10px 20px', 
          backgroundColor: '#dc3545', 
          color: '#fff', 
          border: 'none', 
          borderRadius: '4px', 
          cursor: 'pointer', 
          fontWeight: 'bold',
          fontSize: '14px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
        }}
      >
        ❌ Затвори и се върни в Магазина
      </button>
    </div>
    
    
    <AdminPanel />
  </div>
)}

     
      {isHistoryOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '8px', width: '550px', maxHeight: '80vh', overflowY: 'auto', position: 'relative' }}>
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
                        <span>{(item.price * item.quantity).toFixed(2)} €</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ textAlign: 'right', marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #eee', fontWeight: 'bold', fontSize: '16px', color: '#111' }}>
                    Обща сума (с дост.): {order.total.toFixed(2)} €
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {showToast && (
        <div style={{ position: 'fixed', bottom: '30px', left: '30px', backgroundColor: '#111', color: '#fff', padding: '16px 28px', borderRadius: '8px', zIndex: 3000, fontSize: '14px', fontWeight: '600' }}>
          {toastMessage}
        </div>
      )}

  
      {isAuthOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '8px', width: '340px', position: 'relative' }}>
            <button onClick={() => setIsAuthOpen(false)} style={{ position: 'absolute', top: '15px', right: '15px', backgroundColor: 'transparent', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#888' }}>✕</button>
            <h4 style={{ margin: '0 0 20px 0', fontSize: '22px', textAlign: 'center' }}>{authMode === 'login' ? 'Вход в профила' : 'Регистрация'}</h4>
            {authError && <div style={{ color: 'red', fontSize: '14px', marginBottom: '15px', textAlign: 'center' }}>⚠️ {authError}</div>}
            <form onSubmit={handleAuthSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#555' }}>Имейл адрес:</label>
                <input type="email" required value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#555' }}>Парола:</label>
                <input type="password" required value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
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