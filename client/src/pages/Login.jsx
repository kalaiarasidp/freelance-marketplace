import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate   = useNavigate();

  const [fields,     setFields]     = useState({ email: '', password: '' });
  const [error,      setError]      = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) =>
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(fields.email, fields.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message ?? 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Sign in</h2>
        {error && <p className="auth-error">{error}</p>}
        <label>
          Email
          <input name="email" type="email" value={fields.email} onChange={handleChange} required />
        </label>
        <label>
          Password
          <input name="password" type="password" value={fields.password} onChange={handleChange} required />
        </label>
        <button type="submit" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
        <p>No account? <Link to="/register">Register</Link></p>
      </form>
    </div>
  );
}
