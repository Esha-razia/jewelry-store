import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useContext(AuthContext);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${currentUser.token}` } };
      const { data } = await axios.get('/api/users', config);
      setUsers(data);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${currentUser.token}` } };
        await axios.delete(`/api/users/${id}`, config);
        fetchUsers();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const toggleAdminHandler = async (user) => {
    try {
      const config = { headers: { Authorization: `Bearer ${currentUser.token}` } };
      await axios.put(`/api/users/${user._id}`, { isAdmin: !user.isAdmin }, config);
      fetchUsers();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fade-in">
      <h2 style={{ marginBottom: '2rem' }}>User Management</h2>
      
      {loading ? ( <p>Loading users...</p> ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>NAME</th>
              <th>EMAIL</th>
              <th>ADMIN</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} style={{ fontSize: '0.9rem' }}>
                <td className="text-muted">{user._id.substring(18)}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`badge ${user.isAdmin ? 'badge-success' : 'badge-danger'}`}>
                    {user.isAdmin ? 'Yes' : 'No'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      onClick={() => toggleAdminHandler(user)} 
                      className="btn btn-outline" 
                      style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                    >
                      Toggle Admin
                    </button>
                    {user._id !== currentUser._id && (
                       <button 
                        onClick={() => deleteHandler(user._id)} 
                        className="btn" 
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', background: '#ff6b6b', color: '#fff' }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserManager;
