import { useState } from 'react';
import { Plus, MapPin, Check, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';

export default function AddressesPage() {
  const { user, fetchUser } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newAddress, setNewAddress] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    type: 'home',
    isDefault: false
  });

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const currentAddresses = user?.addresses || [];
      const updated = [...currentAddresses, newAddress];
      await authService.updateProfile({ addresses: updated });
      await fetchUser();
      toast.success('Address added successfully!');
      setShowAddModal(false);
      setNewAddress({
        name: user?.name || '',
        phone: user?.phone || '',
        line1: '',
        line2: '',
        city: '',
        state: '',
        pincode: '',
        type: 'home',
        isDefault: false
      });
    } catch (err) {
      toast.error('Failed to add address');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddress = async (index) => {
    try {
      const updated = user.addresses.filter((_, idx) => idx !== index);
      await authService.updateProfile({ addresses: updated });
      await fetchUser();
      toast.success('Address removed');
    } catch (err) {
      toast.error('Failed to remove address');
    }
  };

  return (
    <div className="card p-6 bg-white space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div>
          <h1 className="text-xl font-bold text-navy-900">Saved Addresses</h1>
          <p className="text-xs text-gray-500">Manage delivery locations for quick medicine checkouts</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary text-xs px-4 py-2"
        >
          <Plus size={14} /> Add New Address
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {!user?.addresses || user.addresses.length === 0 ? (
          <p className="text-xs text-gray-400 py-6 col-span-2 text-center">No addresses saved yet.</p>
        ) : (
          user.addresses.map((addr, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl border border-gray-200 space-y-2 relative bg-white hover:border-primary-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="badge bg-primary-100 text-primary-800 text-[10px] font-bold uppercase">
                  {addr.type || 'home'}
                </span>
                <button
                  onClick={() => handleDeleteAddress(idx)}
                  className="text-gray-400 hover:text-rose-500"
                >
                  <Trash2 size={15} />
                </button>
              </div>
              <p className="font-bold text-sm text-navy-900">{addr.name}</p>
              <p className="text-xs text-gray-500 leading-relaxed">
                {addr.line1}, {addr.line2 && `${addr.line2}, `}{addr.city}, {addr.state} - {addr.pincode}
              </p>
              <p className="text-xs text-navy-800 font-medium">Phone: {addr.phone}</p>
            </div>
          ))
        )}
      </div>

      {/* Add Address Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-navy-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card p-6 max-w-lg w-full bg-white space-y-4">
            <h2 className="text-base font-bold text-navy-900">Add New Delivery Address</h2>
            <form onSubmit={handleAddAddress} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Contact Name *</label>
                  <input
                    type="text"
                    value={newAddress.name}
                    onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                    required
                    className="input text-xs"
                  />
                </div>
                <div>
                  <label className="label">Phone Number *</label>
                  <input
                    type="tel"
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    required
                    className="input text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="label">Address Line 1 *</label>
                <input
                  type="text"
                  placeholder="Flat, building, street"
                  value={newAddress.line1}
                  onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })}
                  required
                  className="input text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="label">City *</label>
                  <input
                    type="text"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    required
                    className="input text-xs"
                  />
                </div>
                <div>
                  <label className="label">State *</label>
                  <input
                    type="text"
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    required
                    className="input text-xs"
                  />
                </div>
                <div>
                  <label className="label">Pincode *</label>
                  <input
                    type="text"
                    value={newAddress.pincode}
                    onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                    required
                    className="input text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-outline text-xs px-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary text-xs px-4 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
