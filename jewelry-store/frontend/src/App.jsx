import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Auth from './pages/Auth';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import ChatWidget from './components/ChatWidget';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container" style={{ marginTop: '2rem' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
          </Routes>
        </main>
        <Footer />
        <ChatWidget />
      </div>
    </Router>
  );
}

export default App;
