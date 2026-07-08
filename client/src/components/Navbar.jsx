import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CAN_CREATE = ['freelancer', 'both'];

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <Link className="navbar-brand" to="/gigs">FreelanceMarket</Link>
      <div className="navbar-links">
        <Link to="/gigs">Gigs</Link>
        {user && CAN_CREATE.includes(user.role) && (
          <Link to="/gigs/create">Create Gig</Link>
        )}
        {user
          ? <>
              <Link to="/dashboard">Dashboard</Link>
              <button onClick={logout}>Logout</button>
            </>
          : <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
        }
      </div>
    </nav>
  );
}
