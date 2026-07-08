const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (userId, role) =>
  jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: '7d' });

const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ message: 'Name, email and password are required' });

  if (await User.findOne({ email }))
    return res.status(409).json({ message: 'Email already in use' });

  const user = await User.create({ name, email, password, role });
  res.status(201).json({ token: signToken(user._id, user.role) });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required' });

  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password)))
    return res.status(401).json({ message: 'Invalid credentials' });

  res.json({ token: signToken(user._id, user.role) });
};

module.exports = { register, login };
