import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getGigs } from '../api/gigApi';

const CATEGORIES = ['Design', 'Development', 'Writing', 'Marketing', 'Video', 'Music', 'Other'];

export default function Gigs() {
  const [gigs,     setGigs]     = useState([]);
  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState('');
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    // Build params object — omit empty strings so the server doesn't receive blank filters.
    const params = {};
    if (search)   params.search   = search;
    if (category) params.category = category;

    getGigs(params)
      .then(({ data }) => setGigs(data.gigs))
      .catch(() => setError('Failed to load gigs'))
      .finally(() => setLoading(false));
  }, [search, category]);

  return (
    <div className="page">
      <div className="gigs-filters">
        <input
          type="text"
          placeholder="Search gigs…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading && <p className="status-msg">Loading…</p>}
      {error   && <p className="status-msg error">{error}</p>}

      {!loading && !error && gigs.length === 0 && (
        <p className="status-msg">No gigs found.</p>
      )}

      <div className="gig-grid">
        {gigs.map((gig) => (
          <Link key={gig._id} className="gig-card" to={`/gigs/${gig._id}`}>
            <p className="gig-category">{gig.category}</p>
            <h3 className="gig-title">{gig.title}</h3>
            <p className="gig-freelancer">by {gig.freelancerId?.name ?? 'Unknown'}</p>
            <p className="gig-price">${gig.price}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
