import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate      = useNavigate();

  const [fields,     setFields]     = useState({ name: '', email: '', password: '', role: 'client' });
  const [error,      setError]      = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) =>
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(fields.name, fields.email, fields.password, fields.role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message ?? 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Create account</h2>
        {error && <p className="auth-error">{error}</p>}
        <label>
          Name
          <input name="name" type="text" value={fields.name} onChange={handleChange} required />
        </label>
        <label>
          Email
          <input name="email" type="email" value={fields.email} onChange={handleChange} required />
        </label>
        <label>
          Password
          <input name="password" type="password" value={fields.password} onChange={handleChange} required />
        </label>
        <label>
          Role
          <select name="role" value={fields.role} onChange={handleChange}>
            <option value="client">Client</option>
            <option value="freelancer">Freelancer</option>
            <option value="both">Both</option>
          </select>
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
        <p>Already have an account? <Link to="/login">Sign in</Link></p>
      </form>
    </div>
  );
}
