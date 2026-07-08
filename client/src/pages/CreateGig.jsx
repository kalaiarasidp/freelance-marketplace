import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createGig } from '../api/gigApi';

const CATEGORIES = ['Design', 'Development', 'Writing', 'Marketing', 'Video', 'Music', 'Other'];
const CAN_CREATE  = ['freelancer', 'both'];

export default function CreateGig() {
  const { user }     = useAuth();
  const navigate     = useNavigate();

  const [fields,     setFields]     = useState({ title: '', description: '', category: '', price: '', deliveryTime: '', tags: '' });
  const [error,      setError]      = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Role guard — the route is already protected by PrivateRoute, but we also
  // check the role here so a "client" who navigates directly sees a clear message.
  if (!CAN_CREATE.includes(user?.role))
    return <p className="status-msg error">Only freelancers can create gigs.</p>;

  const handleChange = (e) =>
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      // Convert tags from a comma-separated string to a trimmed array, filtering blanks.
      const payload = {
        ...fields,
        price:        Number(fields.price),
        deliveryTime: fields.deliveryTime ? Number(fields.deliveryTime) : undefined,
        tags:         fields.tags.split(',').map((t) => t.trim()).filter(Boolean),
      };
      await createGig(payload);
      navigate('/gigs');
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to create gig');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page">
      <form className="gig-form" onSubmit={handleSubmit}>
        <h2>Create a Gig</h2>
        {error && <p className="auth-error">{error}</p>}

        <label>
          Title
          <input name="title" value={fields.title} onChange={handleChange} required />
        </label>
        <label>
          Description
          <textarea name="description" rows={4} value={fields.description} onChange={handleChange} required />
        </label>
        <label>
          Category
          <select name="category" value={fields.category} onChange={handleChange} required>
            <option value="">Select a category</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label>
          Price ($)
          <input name="price" type="number" min="1" value={fields.price} onChange={handleChange} required />
        </label>
        <label>
          Delivery Time (days)
          <input name="deliveryTime" type="number" min="1" value={fields.deliveryTime} onChange={handleChange} />
        </label>
        <label>
          Tags <span className="hint">(comma-separated)</span>
          <input name="tags" value={fields.tags} onChange={handleChange} placeholder="e.g. logo, branding, design" />
        </label>

        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Creating…' : 'Create Gig'}
        </button>
      </form>
    </div>
  );
}
