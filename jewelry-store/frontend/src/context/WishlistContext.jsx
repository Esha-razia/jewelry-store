import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const { user } = useContext(AuthContext);

  // Naya useEffect: jab bhi user load ho (login/refresh), wishlist fetch karo
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) {
        setWishlist([]);
        return;
      }
      try {
        const config = {
          headers: { Authorization: `Bearer ${user.token}` },
        };
        const { data } = await axios.get('/api/users/wishlist', config);
        setWishlist(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchWishlist();
  }, [user]);

  const toggleWishlist = async (productId) => {
    if (!user) return alert('Please login to modify wishlist');
    
    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };
      const { data } = await axios.post(`/api/users/wishlist/${productId}`, {}, config);
      setWishlist(data); // data is array of ObjectIDs
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};