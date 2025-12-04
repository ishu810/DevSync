import User from '../models/User.js';

export const getAllStaff = async (req, res) => {
  try {
    const staff = await User.find({ role: 'staff' }).select('_id username email');
    res.status(200).json(staff);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching staff' });
  }
};
