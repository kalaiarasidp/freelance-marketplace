import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getGigById } from '../api/gigApi';

export default function GigDetail() {
  const { id }                  = useParams();
  const [gig,     setGig]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error,   setError]     = useState('');

  useEffect(() => {
    getGigById(id)
      .then(({ data }) => setGig(data))
      .catch(() => setError('Gig not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="status-msg">Loading…</p>;
  if (error)   return <p className="status-msg error">{error}</p>;

  return (
    <div className="page gig-detail">
      <div className="gig-detail-header">
        <span className="gig-category">{gig.category}</span>
        <h1>{gig.title}</h1>
        <p className="gig-freelancer">by {gig.freelancerId?.name ?? 'Unknown'}</p>
      </div>

      <p className="gig-description">{gig.description}</p>

      {gig.tags?.length > 0 && (
        <div className="gig-tags">
          {gig.tags.map((tag) => <span key={tag} className="tag">{tag}</span>)}
        </div>
      )}

      <div className="gig-detail-meta">
        <p><strong>Price:</strong> ${gig.price}</p>
        {gig.deliveryTime && <p><strong>Delivery:</strong> {gig.deliveryTime} day{gig.deliveryTime !== 1 ? 's' : ''}</p>}
      </div>

      {/* Order functionality will be implemented in a future step */}
      <button className="btn-primary" disabled>Order Now</button>
    </div>
  );
}
