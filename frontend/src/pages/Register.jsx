import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

function Register() {
  const { role } = useParams(); // 'staff' or 'resident'
  const [form, setForm] = useState({
    // default fields, adjust per role if needed
    username: '',
    password: '',
    ...(role === 'staff' && { staff_id: '', name: '', contact: '' }),
    ...(role === 'resident' && { full_name: '', address: '', age: '', gender: 'male', contact: '' }),
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/${role}/register`, form);

      alert(`${role.charAt(0).toUpperCase() + role.slice(1)} registered! Please login.`);
      navigate(`/${role}/`);
    } catch (err) {
      alert(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>{role.charAt(0).toUpperCase() + role.slice(1)} Register</h2>
      <form onSubmit={handleSubmit}>
        {role === 'staff' && (
          <>
            <input name="staff_id" placeholder="Staff ID" value={form.staff_id} onChange={handleChange} required />
            <br />
            <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
            <br />
            <input name="contact" placeholder="Contact" value={form.contact} onChange={handleChange} />
            <br />
          </>
        )}
        {role === 'resident' && (
          <>
            <input name="full_name" placeholder="Full Name" value={form.full_name} onChange={handleChange} required />
            <br />
            <input name="address" placeholder="Address" value={form.address} onChange={handleChange} required />
            <br />
            <input
              type="number"
              name="age"
              placeholder="Age"
              value={form.age}
              onChange={handleChange}
              required
              min={0}
            />
            <br />
            <select name="gender" value={form.gender} onChange={handleChange}>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <br />
            <input name="contact" placeholder="Contact" value={form.contact} onChange={handleChange} />
            <br />
          </>
        )}
        <input name="username" placeholder="Username" value={form.username} onChange={handleChange} required />
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
        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;
