import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const response = await api.post(`/auth/login`, {
        email,
        password,
      });
      setMessage('Login success');
      // Update the auth store with user data
      login(response.data.user);
      navigate('/');
    } catch {
      setMessage('Login failed');
    }
  }

  return (
    <div>
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div style={{marginTop:"10px"}}>
          <button type="submit">Login</button>
        </div>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}
