import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const { role } = useParams(); // 'admin' or 'staff' or 'resident'
  const [form, setForm] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/${role}/login`, form);

      localStorage.setItem('token', res.data.token);


        // Redirect based on role
    if (role === 'resident') {
      navigate('/resident/dashboard');
    } else if (role === 'admin') {
      navigate('/dashboard');  // Assuming admin dashboard is /dashboard
    } else if (role === 'staff') {
      navigate('/staff/dashboard'); // Create this route if you have staff dashboard
    } else {
      navigate('/'); // fallback
    }
  } catch (err) {
    alert(err.response?.data?.error || 'Login failed');
  }
};
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>{role.charAt(0).toUpperCase() + role.slice(1)} Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          required
        />
        <br />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <br />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
