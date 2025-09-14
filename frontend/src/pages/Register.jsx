import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FaUserCircle, FaEye, FaEyeSlash } from 'react-icons/fa';

function Register() {
  const { role } = useParams(); // "staff" or "resident"
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    password: '',
    ...(role === 'staff' && { staff_id: '', name: '', contact: '' }),
    ...(role === 'resident' && { full_name: '', address: '', age: '', gender: 'male', contact: '' }),
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');

  const inputStyle = (error) => ({
    width: '100%',
    padding: '12px',
    borderRadius: '10px',
    border: error ? '1px solid #e74c3c' : '1px solid #ccc',
    fontSize: '15px',
    boxSizing: 'border-box',
    marginBottom: '5px',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.username.trim()) newErrors.username = 'Username is required';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    if (role === 'staff') {
      if (!form.staff_id.trim()) newErrors.staff_id = 'Staff ID is required';
      if (!form.name.trim()) newErrors.name = 'Name is required';
    }

    if (role === 'resident') {
      if (!form.full_name.trim()) newErrors.full_name = 'Full Name is required';
      if (!form.address.trim()) newErrors.address = 'Address is required';
      if (!form.age) newErrors.age = 'Age is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  setIsLoading(true);
  setMessage("");
  setErrors({});

  try {
    const url = `${import.meta.env.VITE_API_URL}/api/auth/${role}/register`;

    const res = await axios.post(url, form);

    setMessage(`${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully!`);

    // Clear form
    setForm({
      username: '',
      password: '',
      ...(role === 'staff' && { staff_id: '', name: '', contact: '' }),
      ...(role === 'resident' && { full_name: '', address: '', age: '', gender: 'male', contact: '' }),
    });

    // Redirect to login after 2 seconds
    setTimeout(() => navigate('/'), 2000);
  } catch (err) {
    console.error("Registration error:", err);

    if (err.response) {
      setErrors({ submit: err.response.data.error || 'Registration failed' });
    } else if (err.request) {
      setErrors({ submit: 'No response from server' });
    } else {
      setErrors({ submit: err.message });
    }
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundImage: 'url("/pic1.jpg")', backgroundSize: 'cover', backgroundPosition: 'center', padding: '15px' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '30px', borderRadius: '20px', background: 'rgba(255,255,255,0.95)', textAlign: 'center', boxShadow: '0 15px 30px rgba(0,0,0,0.3)' }}>
        <FaUserCircle style={{ fontSize: '60px', color: '#A43259', marginBottom: '15px' }} />
        <h2 style={{ marginBottom: '20px', color: '#333' }}>{role.charAt(0).toUpperCase() + role.slice(1)} Registration</h2>

        <form onSubmit={handleSubmit}>
          {role === 'staff' && (
            <>
              <input name="staff_id" placeholder="Staff ID" value={form.staff_id} onChange={handleChange} style={inputStyle(errors.staff_id)} />
              {errors.staff_id && <p style={{ color: '#e74c3c', fontSize: '12px' }}>{errors.staff_id}</p>}

              <input name="name" placeholder="Name" value={form.name} onChange={handleChange} style={inputStyle(errors.name)} />
              {errors.name && <p style={{ color: '#e74c3c', fontSize: '12px' }}>{errors.name}</p>}

              <input name="contact" placeholder="Contact" value={form.contact} onChange={handleChange} style={inputStyle(errors.contact)} />
            </>
          )}

          {role === 'resident' && (
            <>
              <input name="full_name" placeholder="Full Name" value={form.full_name} onChange={handleChange} style={inputStyle(errors.full_name)} />
              {errors.full_name && <p style={{ color: '#e74c3c', fontSize: '12px' }}>{errors.full_name}</p>}

              <input name="address" placeholder="Address" value={form.address} onChange={handleChange} style={inputStyle(errors.address)} />
              {errors.address && <p style={{ color: '#e74c3c', fontSize: '12px' }}>{errors.address}</p>}

              <input type="number" name="age" placeholder="Age" value={form.age} onChange={handleChange} style={inputStyle(errors.age)} min={0} />
              {errors.age && <p style={{ color: '#e74c3c', fontSize: '12px' }}>{errors.age}</p>}

              <select name="gender" value={form.gender} onChange={handleChange} style={{ ...inputStyle(), padding: '10px', marginBottom: '5px' }}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>

              <input name="contact" placeholder="Contact" value={form.contact} onChange={handleChange} style={inputStyle(errors.contact)} />
            </>
          )}

          <input name="username" placeholder="Username" value={form.username} onChange={handleChange} style={inputStyle(errors.username)} />
          {errors.username && <p style={{ color: '#e74c3c', fontSize: '12px' }}>{errors.username}</p>}

          <div style={{ position: 'relative', marginBottom: '15px' }}>
            <input type={showPassword ? 'text' : 'password'} name="password" placeholder="Password" value={form.password} onChange={handleChange} style={inputStyle(errors.password)} />
            <span onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '15px', top: '14px', cursor: 'pointer', color: '#777' }}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
            {errors.password && <p style={{ color: '#e74c3c', fontSize: '12px' }}>{errors.password}</p>}
          </div>

          {errors.submit && <div style={{ color: '#e74c3c', fontSize: '14px', marginBottom: '15px', padding: '10px', backgroundColor: '#fadbd8', borderRadius: '5px' }}>{errors.submit}</div>}

          <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: isLoading ? '#ccc' : '#A43259', color: 'white', fontWeight: 'bold', cursor: isLoading ? 'not-allowed' : 'pointer', marginBottom: '15px' }}>
            {isLoading ? 'Registering...' : 'Register'}
          </button>
        </form>

        {message && <p style={{ color: 'green', marginTop: '10px' }}>{message}</p>}

        <p style={{ marginTop: '15px', fontSize: '14px', color: '#555' }}>
          Already have an account? <span onClick={() => navigate('/')} style={{ color: '#A43259', textDecoration: 'underline', cursor: 'pointer', fontWeight: 'bold' }}>Go to Role Selection</span>
        </p>
      </div>
    </div>
  );
}

export default Register;
