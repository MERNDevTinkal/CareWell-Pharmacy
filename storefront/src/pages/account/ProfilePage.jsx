import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, fetchUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authService.updateProfile({ name, phone });
      await fetchUser();
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card p-6 bg-white space-y-6">
      <div className="pb-4 border-b border-gray-100">
        <h1 className="text-xl font-bold text-navy-900">Personal Information</h1>
        <p className="text-xs text-gray-500">Update your account name and contact number</p>
      </div>

      <form onSubmit={handleSave} className="space-y-4 max-w-lg">
        <div>
          <label className="label">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="input"
          />
        </div>

        <div>
          <label className="label">Email Address (Read-Only)</label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="input bg-gray-50 text-gray-500 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="label">Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="input"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn-primary text-xs px-6 py-2.5 disabled:opacity-50"
        >
          {saving ? 'Saving Changes...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
