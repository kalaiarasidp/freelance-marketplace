const Order = require('../models/Order');
const Gig   = require('../models/Gig');

// ---------------------------------------------------------------------------
// Status transition rules
//
// Each key is the CURRENT status; its value is the set of statuses that are
// allowed as the NEXT status, keyed further by which role may make that move.
//
// Transition map:
//   pending      → in_progress  (freelancer accepts the order)
//   pending      → cancelled    (either party can cancel before work starts)
//   in_progress  → delivered    (freelancer submits the delivery)
//   in_progress  → cancelled    (either party can still cancel mid-work)
//   delivered    → completed    (client accepts the delivery)
//   delivered    → disputed     (client raises a dispute instead of accepting)
//
// "completed" and "disputed" are terminal — no further transitions allowed.
// ---------------------------------------------------------------------------
const TRANSITIONS = {
  pending: {
    in_progress: ['freelancer', 'both'],
    cancelled:   ['client', 'freelancer', 'both'],
  },
  in_progress: {
    delivered:  ['freelancer', 'both'],
    cancelled:  ['client', 'freelancer', 'both'],
  },
  delivered: {
    completed: ['client', 'both'],
    disputed:  ['client', 'both'],
  },
};

// Returns true if `role` is permitted to move `order` to `nextStatus`.
const canTransition = (currentStatus, nextStatus, role) => {
  const allowed = TRANSITIONS[currentStatus]?.[nextStatus];
  return Array.isArray(allowed) && allowed.includes(role);
};

// ---------------------------------------------------------------------------

const createOrder = async (req, res) => {
  const { gigId, requirements } = req.body;

  const gig = await Gig.findById(gigId);
  if (!gig || !gig.isActive)
    return res.status(404).json({ message: 'Gig not found or inactive' });

  // Prevent a freelancer from ordering their own gig.
  if (gig.freelancerId.toString() === req.user._id.toString())
    return res.status(400).json({ message: 'You cannot order your own gig' });

  // Price and freelancerId are always sourced from the gig document — never
  // from the request body — so the client cannot manipulate either value.
  const order = await Order.create({
    gigId,
    clientId:     req.user._id,
    freelancerId: gig.freelancerId,
    price:        gig.price,
    requirements,
  });

  res.status(201).json(order);
};

const getMyOrders = async (req, res) => {
  const userId = req.user._id;

  // Return every order where the logged-in user is a participant, regardless
  // of which side of the transaction they are on.
  const orders = await Order.find({
    $or: [{ clientId: userId }, { freelancerId: userId }],
  })
    .populate('gigId',        'title')
    .populate('clientId',     'name')
    .populate('freelancerId', 'name')
    .sort({ createdAt: -1 });

  res.json(orders);
};

const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('gigId',        'title')
    .populate('clientId',     'name')
    .populate('freelancerId', 'name');

  if (!order) return res.status(404).json({ message: 'Order not found' });

  // Only the two parties involved in the order may view it.
  const userId = req.user._id.toString();
  const isParty = [order.clientId._id.toString(), order.freelancerId._id.toString()].includes(userId);
  if (!isParty) return res.status(403).json({ message: 'Not authorised to view this order' });

  res.json(order);
};

const updateOrderStatus = async (req, res) => {
  const { status: nextStatus } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  // Only the two parties involved may change the status.
  const userId = req.user._id.toString();
  const isParty = [order.clientId.toString(), order.freelancerId.toString()].includes(userId);
  if (!isParty) return res.status(403).json({ message: 'Not authorised to update this order' });

  // Validate the requested transition against the rules defined in TRANSITIONS.
  // This rejects both illegal next-states (e.g. pending → completed) and moves
  // attempted by the wrong role (e.g. client trying to mark an order delivered).
  if (!canTransition(order.status, nextStatus, req.user.role)) {
    return res.status(400).json({
      message: `Cannot transition from "${order.status}" to "${nextStatus}" as role "${req.user.role}"`,
    });
  }

  order.status = nextStatus;

  // Stamp the relevant timestamp when entering a terminal-adjacent state.
  if (nextStatus === 'delivered') order.deliveredAt = new Date();
  if (nextStatus === 'completed') order.completedAt = new Date();

  await order.save();
  res.json(order);
};

module.exports = { createOrder, getMyOrders, getOrderById, updateOrderStatus };
