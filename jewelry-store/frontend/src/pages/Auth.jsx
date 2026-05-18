import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loginType, setLoginType] = useState('user');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const { login, register, user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.isAdmin) navigate('/admin');
      else navigate('/');
    }
  }, [user, navigate]);

  const handleQuickAdmin = async () => {
    const result = await login('admin@example.com', 'password');
    if (result.success) navigate('/admin');
    else setErrorMsg(result.error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    let result;

    if (isLogin) {
      result = await login(email, password);
    } else {
      // When registering under Admin tab, create an admin account
      const makeAdmin = loginType === 'admin';
      result = await register(name, email, password, makeAdmin);
    }

    if (!result.success) {
      setErrorMsg(result.error);
    } else {
      // After success, redirect based on login type
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (loginType === 'admin' || userInfo.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  };

  return (
    <div className="fade-in flex-center" style={{ minHeight: '60vh' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '3rem 2rem' }}>
        
        {/* Login Type Selector - ALWAYS visible */}
        <div className="flex" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '30px', padding: '4px', marginBottom: '2rem' }}>
          <button 
            onClick={() => { setLoginType('user'); setErrorMsg(''); }}
            style={{ flex: 1, padding: '0.6rem', borderRadius: '25px', border: 'none', background: loginType === 'user' ? 'var(--accent-gold)' : 'transparent', color: loginType === 'user' ? '#000' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
          >
            USER LOGIN
          </button>
          <button 
            onClick={() => { setLoginType('admin'); setErrorMsg(''); }}
            style={{ flex: 1, padding: '0.6rem', borderRadius: '25px', border: 'none', background: loginType === 'admin' ? 'var(--accent-gold)' : 'transparent', color: loginType === 'admin' ? '#000' : 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
          >
            ADMIN LOGIN
          </button>
        </div>

        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          {loginType === 'admin' 
            ? (isLogin ? 'Administrator Sign In' : 'Administrator Sign Up') 
            : (isLogin ? 'Sign In' : 'Create Account')}
        </h2>
        
        {errorMsg && <div style={{ color: '#ff6b6b', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>{errorMsg}</div>}
        
        <form onSubmit={handleSubmit} className="grid" style={{ gap: '1.2rem' }}>
          {!isLogin && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <input 
                type="text" 
                placeholder="Full Name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
              />
            </div>
          )}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            {loginType === 'admin' 
              ? (isLogin ? 'Enter Admin Dashboard' : 'Register as Admin')
              : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        {loginType === 'admin' && isLogin && (
           <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
             <span 
              onClick={handleQuickAdmin}
              style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', cursor: 'pointer', textDecoration: 'underline' }}
             >
               Quick Login with Default Admin Credentials
             </span>
           </div>
        )}

        <p style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem' }} className="text-muted">
          {isLogin ? "Don't have an account?" : "Already have an account?"} 
          <span 
            style={{ color: 'var(--accent-gold)', marginLeft: '0.5rem', cursor: 'pointer' }}
            onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); }}
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Auth;
