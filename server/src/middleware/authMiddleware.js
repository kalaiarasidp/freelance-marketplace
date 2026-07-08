const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verifies the JWT from the Authorization header and attaches the user to req.user.
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Reject early if the header is missing or not in "Bearer <token>" format.
  if (!authHeader?.startsWith('Bearer '))
    return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1];

  // Verify the token signature and expiry against JWT_SECRET.
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  // Load the user from the DB so req.user always reflects the current DB state.
  // Exclude the password field — it should never travel beyond the auth layer.
  const user = await User.findById(payload.userId).select('-password');
  if (!user) return res.status(401).json({ message: 'User no longer exists' });

  req.user = user;
  next();
};

// Restricts access to users whose role is in the allowed list.
// Must be used after protect so that req.user is already set.
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({ message: `Role "${req.user.role}" is not allowed` });
  next();
};

module.exports = { protect, authorize };
