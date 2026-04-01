import { useEffect, useState } from 'react';
import api from '../api';
import { useAuthStore } from '../store/authStore';

type User = {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: string;
};

export default function Home() {
  const { user, logout: storeLogout, isAuthenticated } = useAuthStore();
  const [message, setMessage] = useState('');
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    async function loadme() {
      try {
        const res = await api.get(`/auth/me`);
        if (res.data) {
          useAuthStore.getState().login(res.data);
        }
      } catch {
        // User is not authenticated, store should already be cleared
      }
    }

    loadme();
  }, []);

  async function logout() {
    try {
      await api.post(`/auth/logout`);
      storeLogout(); // Use store logout
      setUsers([]);
      setMessage('Logged out successfully');
    } catch {
      setMessage('Logout failed');
    }
  }

  async function fetchAllUsers() {
    try {
      const res = await api.get('/auth/users');
      setUsers(res.data.data || res.data.users || []);
    } catch {
      setUsers([]);
    }
  }

  return (
    <div>
      <h2>Home</h2>
      {message && <p>{message}</p>}
      {isAuthenticated && user ? (
        <div>
          <p>Logged in as: {user.name}</p>
          <p>Email: {user.email}</p>
          <p>Role: {user.role}</p>

          <h1>Admin test</h1>
          <button onClick={fetchAllUsers}>Get all users</button>

          <button onClick={logout}>Logout botom</button>
        </div>
      ) : (
        <p>Please login to access this page</p>
      )}

      {users.length > 0 && (
        <div>
          <h3>All Users:</h3>
          <ul>
            {users.map((u) => (
              <li key={u._id}>
                {u.name} ({u.email}) - {u.role}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
