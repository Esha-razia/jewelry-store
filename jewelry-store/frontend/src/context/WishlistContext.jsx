import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const { user } = useContext(AuthContext);

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
