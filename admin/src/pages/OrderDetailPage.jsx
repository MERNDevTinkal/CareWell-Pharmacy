import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Truck,
  CheckCircle,
  Clock,
  Printer,
  FileCheck,
  ShieldAlert,
  MapPin,
  CreditCard,
  User,
  Package
} from 'lucide-react';
import { orderService } from '../services/orderService';
import PageHeader from '../components/ui/PageHeader';
import StatusBadge from '../components/ui/StatusBadge';
import toast from 'react-hot-toast';

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [trackingUpdating, setTrackingUpdating] = useState(false);

  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');

  const [trackingData, setTrackingData] = useState({
    courier: '',
    trackingNumber: '',
    trackingUrl: ''
  });

  const fetchOrder = () => {
    setLoading(true);
    orderService.getOrder(id)
      .then((res) => {
        const o = res.data?.data;
        setOrder(o);
        if (o) {
          setTrackingData({
            courier: o.courier || '',
            trackingNumber: o.trackingNumber || '',
            trackingUrl: o.trackingUrl || ''
          });
        }
      })
      .catch(() => toast.error('Failed to load order'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const getAvailableNextStatuses = (current) => {
    const map = {
      pending_confirmation: ['confirmed', 'processing', 'cancelled'],
      prescription_review_pending: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['packed', 'cancelled'],
      packed: ['shipped', 'cancelled'],
      shipped: ['delivered', 'cancelled'],
      delivered: ['return_requested'],
      return_requested: ['returned', 'delivered'],
      returned: ['refund_pending', 'refunded'],
      refund_pending: ['refunded'],
      cancelled: [],
      refunded: []
    };
    return map[current] || [];
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStatus) {
      toast.error('Select a new status');
      return;
    }

    setStatusUpdating(true);
    try {
      await orderService.updateOrderStatus(order._id, selectedStatus, statusNote);
      toast.success(`Order status updated to ${selectedStatus}`);
      setSelectedStatus('');
      setStatusNote('');
      fetchOrder();
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleTrackingSubmit = async (e) => {
    e.preventDefault();
    if (!trackingData.trackingNumber || !trackingData.courier) {
      toast.error('Courier and Tracking Number are required');
      return;
    }

    setTrackingUpdating(true);
    try {
      await orderService.addTracking(order._id, trackingData);
      toast.success('Courier tracking details saved');
      fetchOrder();
    } catch (err) {
      toast.error(err.message || 'Failed to update tracking');
    } finally {
      setTrackingUpdating(false);
    }
  };

  const printInvoice = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Order not found.</p>
        <Link to="/admin/orders" className="btn-primary mt-4 inline-flex">
          Back to Orders
        </Link>
      </div>
    );
  }

  const nextStatuses = getAvailableNextStatuses(order.status);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/orders"
            className="p-2 text-gray-400 hover:text-navy-900 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-black text-navy-900 font-mono tracking-tight">
                {order.orderNumber}
              </h1>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
        </div>

        <button
          onClick={printInvoice}
          className="btn-outline text-xs px-4 py-2"
        >
          <Printer size={15} /> Print / Download Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Order Items & Summary */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="card bg-white p-6 space-y-4">
            <h3 className="font-bold text-navy-900 text-sm flex items-center gap-2 border-b border-gray-100 pb-3">
              <Package size={16} className="text-primary-500" /> Purchased Medicines & Items
            </h3>

            <div className="divide-y divide-gray-100">
              {order.items?.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.image || 'https://placehold.co/100x100?text=Medicine'}
                      alt=""
                      className="w-12 h-12 object-contain rounded-lg border border-gray-100 p-1 flex-shrink-0 bg-gray-50"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-navy-900 text-xs truncate">{item.productName}</p>
                      <p className="text-[11px] text-gray-400 font-mono">SKU: {item.sku || 'N/A'}</p>
                      {item.prescriptionRequired && (
                        <span className="badge bg-amber-100 text-amber-800 text-[10px] mt-0.5 inline-flex items-center gap-1">
                          <ShieldAlert size={10} /> Rx Required
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-navy-900 text-xs">₹{item.price} &times; {item.quantity}</p>
                    <p className="text-[11px] font-semibold text-primary-600">
                      ₹{item.price * item.quantity}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="pt-4 border-t border-gray-100 space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>₹{order.subtotal}</span>
              </div>
              {order.couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Coupon Discount ({order.couponCode})</span>
                  <span>-₹{order.couponDiscount}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-500">
                <span>Shipping Fee</span>
                <span>{order.shippingCharge === 0 ? 'Free' : `₹${order.shippingCharge}`}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Estimated Taxes (incl.)</span>
                <span>₹{order.taxAmount || 0}</span>
              </div>
              <div className="flex justify-between text-navy-900 font-black text-sm pt-2 border-t border-gray-100">
                <span>Grand Total</span>
                <span className="text-primary-600 font-mono">₹{order.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Status Progression & Note Form */}
          <div className="card bg-white p-6 space-y-4">
            <h3 className="font-bold text-navy-900 text-sm flex items-center gap-2 border-b border-gray-100 pb-3">
              <Clock size={16} className="text-primary-500" /> Update Order Status
            </h3>

            {nextStatuses.length > 0 ? (
              <form onSubmit={handleStatusSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Transition To *</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      required
                      className="input text-xs"
                    >
                      <option value="">Select Next Status</option>
                      {nextStatuses.map((s) => (
                        <option key={s} value={s}>
                          {s.replace(/_/g, ' ').toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label">Internal / Customer Note</label>
                    <input
                      type="text"
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                      placeholder="e.g. Packed in sealed tamper-proof box"
                      className="input text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={statusUpdating}
                    className="btn-primary text-xs px-4 py-2"
                  >
                    {statusUpdating ? 'Updating...' : 'Apply Status Change'}
                  </button>
                </div>
              </form>
            ) : (
              <p className="text-xs text-gray-400 italic">
                This order is in a final state ({order.status}). No further transitions available.
              </p>
            )}

            {/* Status History Timeline */}
            <div className="pt-4 border-t border-gray-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                Status History
              </h4>
              <div className="space-y-3">
                {order.statusHistory?.map((h, i) => (
                  <div key={i} className="flex items-start gap-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 flex-shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-navy-900 capitalize">
                          {h.status?.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(h.timestamp).toLocaleString()}
                        </span>
                      </div>
                      {h.note && <p className="text-gray-500 mt-0.5">{h.note}</p>}
                      {h.updatedByName && (
                        <p className="text-[10px] text-gray-400">by {h.updatedByName}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Customer, Delivery, Payment, Prescriptions */}
        <div className="space-y-6">
          {/* Customer & Shipping */}
          <div className="card bg-white p-6 space-y-4">
            <h3 className="font-bold text-navy-900 text-sm flex items-center gap-2 border-b border-gray-100 pb-3">
              <User size={16} className="text-primary-500" /> Customer & Delivery Address
            </h3>

            <div>
              <p className="font-bold text-navy-900 text-xs">
                {order.customerInfo?.name || order.shippingAddress?.name}
              </p>
              <p className="text-xs text-gray-500">{order.customerInfo?.email || 'No email'}</p>
              <p className="text-xs text-gray-500">{order.customerInfo?.phone || order.shippingAddress?.phone}</p>
            </div>

            <div className="pt-2 border-t border-gray-50 text-xs text-gray-600 flex items-start gap-2">
              <MapPin size={15} className="text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <p>{order.shippingAddress?.line1}</p>
                {order.shippingAddress?.line2 && <p>{order.shippingAddress?.line2}</p>}
                <p>
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                </p>
                <p>{order.shippingAddress?.country || 'India'}</p>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="card bg-white p-6 space-y-3">
            <h3 className="font-bold text-navy-900 text-sm flex items-center gap-2 border-b border-gray-100 pb-3">
              <CreditCard size={16} className="text-primary-500" /> Payment Information
            </h3>

            <div className="text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Method:</span>
                <span className="font-semibold uppercase text-navy-900">
                  {order.paymentMethod?.replace('demo_', '')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Payment Status:</span>
                <span className={`badge ${
                  order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Prescription Review (if applicable) */}
          {order.requiresPrescription && (
            <div className="card bg-white p-6 space-y-3 border-amber-200">
              <h3 className="font-bold text-amber-900 text-sm flex items-center gap-2 border-b border-amber-100 pb-2">
                <ShieldAlert size={16} className="text-amber-500" /> Prescription Required
              </h3>

              {order.prescription ? (
                <div className="text-xs space-y-2">
                  <p className="text-gray-600">Prescription Attached:</p>
                  <Link
                    to="/admin/prescriptions"
                    className="text-xs font-bold text-primary-600 hover:underline flex items-center gap-1"
                  >
                    <FileCheck size={14} /> Open in Pharmacist Review Queue &rarr;
                  </Link>
                </div>
              ) : (
                <p className="text-xs text-rose-600 font-semibold">
                  Awaiting customer prescription upload.
                </p>
              )}
            </div>
          )}

          {/* Courier Tracking */}
          <div className="card bg-white p-6 space-y-4">
            <h3 className="font-bold text-navy-900 text-sm flex items-center gap-2 border-b border-gray-100 pb-3">
              <Truck size={16} className="text-primary-500" /> Dispatch & Courier Tracking
            </h3>

            <form onSubmit={handleTrackingSubmit} className="space-y-3">
              <div>
                <label className="label">Courier Partner</label>
                <input
                  type="text"
                  value={trackingData.courier}
                  onChange={(e) => setTrackingData({ ...trackingData, courier: e.target.value })}
                  placeholder="e.g. Blue Dart / Delhivery"
                  className="input text-xs"
                />
              </div>

              <div>
                <label className="label">Tracking Number / AWB</label>
                <input
                  type="text"
                  value={trackingData.trackingNumber}
                  onChange={(e) => setTrackingData({ ...trackingData, trackingNumber: e.target.value })}
                  placeholder="e.g. AWB987654321"
                  className="input text-xs"
                />
              </div>

              <div>
                <label className="label">Tracking URL (Optional)</label>
                <input
                  type="url"
                  value={trackingData.trackingUrl}
                  onChange={(e) => setTrackingData({ ...trackingData, trackingUrl: e.target.value })}
                  placeholder="https://track.courier.com/..."
                  className="input text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={trackingUpdating}
                className="btn-secondary w-full text-xs py-2 justify-center"
              >
                {trackingUpdating ? 'Saving...' : 'Save Tracking Information'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
