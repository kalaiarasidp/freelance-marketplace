const Gig = require('../models/Gig');

const createGig = async (req, res) => {
  // freelancerId is taken from the verified token via req.user, never from the body,
  // so a user cannot create a gig on behalf of someone else.
  const gig = await Gig.create({ ...req.body, freelancerId: req.user._id });
  res.status(201).json(gig);
};

const getGigs = async (req, res) => {
  const { category, search, page = 1, limit = 10 } = req.query;

  const filter = { isActive: true };

  if (category) filter.category = category;

  // Search matches either title or description (case-insensitive).
  if (search) {
    const regex = new RegExp(search, 'i');
    filter.$or = [{ title: regex }, { description: regex }];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [gigs, total] = await Promise.all([
    Gig.find(filter).skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
    Gig.countDocuments(filter),
  ]);

  res.json({ total, page: Number(page), limit: Number(limit), gigs });
};

const getGigById = async (req, res) => {
  const gig = await Gig.findById(req.params.id)
    .populate('freelancerId', 'name rating');

  if (!gig) return res.status(404).json({ message: 'Gig not found' });
  res.json(gig);
};

const updateGig = async (req, res) => {
  const gig = await Gig.findById(req.params.id);
  if (!gig) return res.status(404).json({ message: 'Gig not found' });

  // Ownership check: compare the gig's freelancerId to the authenticated user's _id.
  // toString() is required because freelancerId is an ObjectId, not a plain string.
  if (gig.freelancerId.toString() !== req.user._id.toString())
    return res.status(403).json({ message: 'Not authorised to update this gig' });

  // Prevent callers from overwriting the owner by including freelancerId in the body.
  const { freelancerId, ...updates } = req.body;
  const updated = await Gig.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  res.json(updated);
};

const deleteGig = async (req, res) => {
  const gig = await Gig.findById(req.params.id);
  if (!gig) return res.status(404).json({ message: 'Gig not found' });

  // Ownership check: same ObjectId-to-string comparison as updateGig.
  // Only the freelancer who created the gig may delete it.
  if (gig.freelancerId.toString() !== req.user._id.toString())
    return res.status(403).json({ message: 'Not authorised to delete this gig' });

  // Soft delete: set isActive to false so the record is preserved in the DB
  // (useful for order history, auditing, etc.) but excluded from public listings.
  await Gig.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ message: 'Gig deleted' });
};

module.exports = { createGig, getGigs, getGigById, updateGig, deleteGig };
