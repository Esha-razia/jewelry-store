import { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const items = localStorage.getItem('cartItems');
    if (items) {
      setCartItems(JSON.parse(items));
    }
  }, []);

  const addToCart = (product, qty) => {
    const existItem = cartItems.find((x) => x.product === product._id);
    let updatedCart;
    if (existItem) {
      updatedCart = cartItems.map((x) =>
        x.product === existItem.product ? { ...product, product: product._id, qty } : x
      );
    } else {
      updatedCart = [...cartItems, { ...product, product: product._id, qty }];
    }
    setCartItems(updatedCart);
    localStorage.setItem('cartItems', JSON.stringify(updatedCart));
  };

  const removeFromCart = (id) => {
    const updatedCart = cartItems.filter((x) => x.product !== id);
    setCartItems(updatedCart);
    localStorage.setItem('cartItems', JSON.stringify(updatedCart));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cartItems');
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
