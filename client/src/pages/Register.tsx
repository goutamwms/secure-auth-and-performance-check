import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { getErrorMessage } from '../helper';

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', {
        name,
        email,
        password,
      });

      setMessage('Register success');
      navigate('/login');
    } catch (error) {
      setMessage(getErrorMessage(error, 'Register failed'));
      setLoading(false);
    }
  }

  return (
    <div>
      <h2>Register</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

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
          <button type="submit" disabled={loading}>Register</button>
        </div>
        
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}
