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

export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const staffCount = await User.countDocuments({ role: 'staff' });
    const citizenCount = await User.countDocuments({ role: 'citizen' });
    const adminCount = await User.countDocuments({ role: 'admin' });
    
    res.status(200).json({
      totalUsers,
      staffCount,
      citizenCount,
      adminCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching admin stats' });
  }
};
