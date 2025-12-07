import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';

const CreateUserForm = ({ onCreated }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'staff',
    department: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axiosInstance.post('/api/users/register', formData);
      alert('User created successfully!');
      setFormData({
        username: '',
        email: '',
        password: '',
        role: 'staff',
        department: ''
      });
      onCreated();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-6 max-w-md mx-auto">
      <h2 className="font-orbitron text-xl mb-6 text-yellow-400">Create New User</h2>
      
      {error && (
        <div className="bg-red-400/20 border border-red-400/50 text-red-300 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-white/70 text-sm mb-2">Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-white/70 text-sm mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-white/70 text-sm mb-2">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-white/70 text-sm mb-2">Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white focus:ring-2 focus:ring-blue-400"
          >
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div>
          <label className="block text-white/70 text-sm mb-2">Department</label>
          <input
            type="text"
            name="department"
            value={formData.department}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-400 text-black font-bold rounded-lg px-6 py-3 shadow-lg hover:bg-blue-300 transition disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create User'}
        </button>
      </form>
    </div>
  );
};

export default CreateUserForm;
