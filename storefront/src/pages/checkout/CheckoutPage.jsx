import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  CreditCard,
  Truck,
  CheckCircle,
  ArrowRight,
  Upload,
  FileText,
  Lock,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useStore } from '../../contexts/StoreContext';
import { orderService } from '../../services/orderService';
import { paymentService } from '../../services/paymentService';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, hasPrescriptionItems, fetchCart } = useCart();
  const { user } = useAuth();
  const { settings } = useStore();

  const [step, setStep] = useState(1); // 1: Address, 2: Prescription (if needed), 3: Payment Method, 4: Demo Gateway

  // Address state
  const [address, setAddress] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    line1: user?.addresses?.[0]?.line1 || '',
    line2: user?.addresses?.[0]?.line2 || '',
    city: user?.addresses?.[0]?.city || 'Bangalore',
    state: user?.addresses?.[0]?.state || 'Karnataka',
    pincode: user?.addresses?.[0]?.pincode || '560001',
    country: 'India'
  });

  // Prescription state
  const [prescriptionFiles, setPrescriptionFiles] = useState([]);
  const [uploadedPrescriptionId, setUploadedPrescriptionId] = useState(null);
  const [uploadingPrescription, setUploadingPrescription] = useState(false);

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('demo_upi');
  const [createdOrder, setCreatedOrder] = useState(null);
  const [transactionRef, setTransactionRef] = useState(null);
  const [simulationOutcome, setSimulationOutcome] = useState('success'); // 'success' | 'failure' | 'pending'
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    if (!cart?.items || cart.items.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  const subtotal = cart?.subtotal || 0;
  const freeThreshold = Number(settings?.freeShippingThreshold || 599);
  const shippingCharge = subtotal >= freeThreshold ? 0 : Number(settings?.shippingCharge || 49);
  const discount = cart?.couponDiscount || 0;
  const totalAmount = Math.max(0, subtotal - discount + shippingCharge);

  // Handle Prescription Upload
  const handlePrescriptionUpload = async () => {
    if (prescriptionFiles.length === 0) {
      toast.error('Please select at least one prescription file');
      return;
    }
    setUploadingPrescription(true);
    try {
      const formData = new FormData();
      prescriptionFiles.forEach((f) => formData.append('files', f));

      const res = await api.post('/prescriptions/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadedPrescriptionId(res.data?.data?._id);
      toast.success('Prescription attached to order!');
      setStep(3);
    } catch (err) {
      toast.error('Prescription upload failed');
    } finally {
      setUploadingPrescription(false);
    }
  };

  // Step 1 -> Next
  const handleProceedFromAddress = (e) => {
    e.preventDefault();
    if (!address.name || !address.phone || !address.line1 || !address.city || !address.pincode) {
      toast.error('Please complete all required address fields');
      return;
    }
    if (hasPrescriptionItems && !uploadedPrescriptionId) {
      setStep(2);
    } else {
      setStep(3);
    }
  };

  // Initiate Order and Launch Demo Payment Modal
  const handlePlaceOrder = async () => {
    setProcessingPayment(true);
    try {
      const orderData = {
        shippingAddress: address,
        customerInfo: { name: address.name, email: address.email, phone: address.phone },
        paymentMethod,
        prescriptionId: uploadedPrescriptionId || undefined
      };

      const orderRes = await orderService.createOrder(orderData);
      const order = orderRes.data?.data;
      setCreatedOrder(order);

      if (paymentMethod === 'cod') {
        // Cash on delivery doesn't need simulation gateway
        await fetchCart();
        toast.success('Order placed successfully via Cash on Delivery!');
        navigate(`/order-success/${order._id}`);
        return;
      }

      // Initiate Demo Payment Gateway
      const payRes = await paymentService.initiatePayment(order._id, paymentMethod);
      setTransactionRef(payRes.data?.data?.transactionRef);
      setStep(4); // Move to Demo Payment Simulation Screen
    } catch (err) {
      toast.error(err.message || 'Failed to place order');
    } finally {
      setProcessingPayment(false);
    }
  };

  // Complete Simulated Payment in Step 4
  const handleVerifyDemoPayment = async () => {
    if (!transactionRef) return;
    setProcessingPayment(true);
    try {
      const res = await paymentService.verifyPayment({
        transactionRef,
        simulationOutcome,
        mockCardNumber: '4111222233334444',
        mockUpiId: 'demo@okhdfcbank'
      });

      if (simulationOutcome === 'success') {
        await fetchCart();
        toast.success('Payment verified successfully (Demo)!');
        navigate(`/order-success/${createdOrder._id}`);
      } else if (simulationOutcome === 'failure') {
        toast.error('Simulated payment declined. You can retry.');
      } else {
        await fetchCart();
        toast.success('Payment pending confirmation.');
        navigate(`/order-success/${createdOrder._id}`);
      }
    } catch (err) {
      toast.error(err.message || 'Payment simulation failed');
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Checkout Progress Stepper */}
      <div className="card p-4 bg-white">
        <div className="flex items-center justify-around max-w-2xl mx-auto text-xs font-bold">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary-600' : 'text-gray-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-400'}`}>1</span>
            <span>Delivery</span>
          </div>
          {hasPrescriptionItems && (
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary-600' : 'text-gray-400'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-400'}`}>2</span>
              <span>Prescription</span>
            </div>
          )}
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-primary-600' : 'text-gray-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
              {hasPrescriptionItems ? 3 : 2}
            </span>
            <span>Payment</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Checkout Steps */}
        <div className="lg:col-span-8">
          {/* STEP 1: Delivery Address */}
          {step === 1 && (
            <div className="card p-6 bg-white space-y-6">
              <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">
                <Truck size={20} className="text-primary-600" />
                Shipping & Contact Information
              </h2>

              <form onSubmit={handleProceedFromAddress} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Full Name *</label>
                    <input
                      type="text"
                      value={address.name}
                      onChange={(e) => setAddress({ ...address, name: e.target.value })}
                      required
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Phone Number *</label>
                    <input
                      type="tel"
                      value={address.phone}
                      onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                      required
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Email Address (for order tracking) *</label>
                  <input
                    type="email"
                    value={address.email}
                    onChange={(e) => setAddress({ ...address, email: e.target.value })}
                    required
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Flat / House No. / Street Address *</label>
                  <input
                    type="text"
                    value={address.line1}
                    onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                    required
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Area / Landmark (Optional)</label>
                  <input
                    type="text"
                    value={address.line2}
                    onChange={(e) => setAddress({ ...address, line2: e.target.value })}
                    className="input"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="label">City *</label>
                    <input
                      type="text"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      required
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">State *</label>
                    <input
                      type="text"
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      required
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Pincode *</label>
                    <input
                      type="text"
                      value={address.pincode}
                      onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                      required
                      className="input font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full justify-center text-sm py-3.5 shadow-lg shadow-primary-500/25 mt-4"
                >
                  Proceed to {hasPrescriptionItems ? 'Prescription Upload' : 'Payment'} <ArrowRight size={16} />
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: Prescription Attachment (Required if Rx items present) */}
          {step === 2 && (
            <div className="card p-6 bg-white space-y-6">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900">
                <ShieldAlert size={22} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold">Prescription Required For Your Order</p>
                  <p className="mt-0.5">
                    Your cart includes medications that require a registered doctor's prescription. Please attach your prescription document before proceeding.
                  </p>
                </div>
              </div>

              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center bg-gray-50/50">
                <input
                  type="file"
                  id="checkout-rx"
                  onChange={(e) => setPrescriptionFiles(Array.from(e.target.files))}
                  multiple
                  accept="image/jpeg,image/png,image/jpg,application/pdf"
                  className="hidden"
                />
                <label htmlFor="checkout-rx" className="cursor-pointer space-y-2 block">
                  <Upload size={28} className="mx-auto text-primary-600" />
                  <p className="text-xs font-bold text-navy-900">Choose Prescription Document (Photo / PDF)</p>
                  <p className="text-[11px] text-gray-400">Max file size: 5MB</p>
                </label>
              </div>

              {prescriptionFiles.length > 0 && (
                <div className="space-y-1">
                  {prescriptionFiles.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg text-xs font-medium text-navy-800">
                      <FileText size={14} className="text-primary-600" />
                      <span className="truncate flex-1">{f.name}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-outline text-xs px-4"
                >
                  Back to Address
                </button>
                <button
                  type="button"
                  onClick={handlePrescriptionUpload}
                  disabled={uploadingPrescription || prescriptionFiles.length === 0}
                  className="btn-primary flex-1 justify-center text-xs py-3 disabled:opacity-50"
                >
                  {uploadingPrescription ? 'Attaching Prescription...' : 'Attach Prescription & Continue'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Payment Method Selection */}
          {step === 3 && (
            <div className="card p-6 bg-white space-y-6">
              <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">
                <CreditCard size={20} className="text-primary-600" />
                Select Payment Method
              </h2>

              <div className="space-y-3">
                <label className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'demo_upi' ? 'border-primary-500 bg-primary-50/20' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      value="demo_upi"
                      checked={paymentMethod === 'demo_upi'}
                      onChange={() => setPaymentMethod('demo_upi')}
                      className="w-4 h-4 text-primary-600"
                    />
                    <div>
                      <p className="text-xs font-bold text-navy-900">Demo UPI (GPay, PhonePe, Paytm)</p>
                      <p className="text-[11px] text-gray-500">Simulate instant UPI transaction</p>
                    </div>
                  </div>
                  <span className="badge bg-primary-100 text-primary-800 text-[10px] font-bold">Recommended</span>
                </label>

                <label className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'demo_card' ? 'border-primary-500 bg-primary-50/20' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      value="demo_card"
                      checked={paymentMethod === 'demo_card'}
                      onChange={() => setPaymentMethod('demo_card')}
                      className="w-4 h-4 text-primary-600"
                    />
                    <div>
                      <p className="text-xs font-bold text-navy-900">Demo Credit / Debit Card</p>
                      <p className="text-[11px] text-gray-500">Simulate Visa, Mastercard or RuPay</p>
                    </div>
                  </div>
                </label>

                <label className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'demo_netbanking' ? 'border-primary-500 bg-primary-50/20' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      value="demo_netbanking"
                      checked={paymentMethod === 'demo_netbanking'}
                      onChange={() => setPaymentMethod('demo_netbanking')}
                      className="w-4 h-4 text-primary-600"
                    />
                    <div>
                      <p className="text-xs font-bold text-navy-900">Demo Net Banking</p>
                      <p className="text-[11px] text-gray-500">Simulate bank transfer</p>
                    </div>
                  </div>
                </label>

                <label className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-primary-500 bg-primary-50/20' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="w-4 h-4 text-primary-600"
                    />
                    <div>
                      <p className="text-xs font-bold text-navy-900">Cash on Delivery (COD)</p>
                      <p className="text-[11px] text-gray-500">Pay when your order arrives at your door</p>
                    </div>
                  </div>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(hasPrescriptionItems ? 2 : 1)}
                  className="btn-outline text-xs px-4"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={processingPayment}
                  className="btn-primary flex-1 justify-center text-sm py-3.5 shadow-lg shadow-primary-500/25 disabled:opacity-50"
                >
                  {processingPayment ? 'Placing Order...' : `Confirm & Pay ₹${totalAmount}`}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Simulated Payment Gateway Modal Screen */}
          {step === 4 && (
            <div className="card p-6 bg-white space-y-6 border-2 border-primary-500">
              <div className="text-center space-y-2">
                <span className="badge bg-primary-100 text-primary-800 text-xs font-bold">
                  Demo Payment Gateway
                </span>
                <h2 className="text-2xl font-black text-navy-900">Simulate Payment</h2>
                <p className="text-xs text-gray-500">
                  Transaction Ref: <span className="font-mono text-navy-800 font-bold">{transactionRef}</span>
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertTriangle size={15} className="text-amber-600" /> Demonstration Mode Notice:
                </p>
                <p>
                  This is a mock payment sandbox. No real bank credentials or money will be charged. Select the desired simulation outcome to test the system workflow.
                </p>
              </div>

              <div className="space-y-3">
                <label className="label">Choose Simulated Outcome:</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setSimulationOutcome('success')}
                    className={`p-3 rounded-xl border-2 text-xs font-bold transition-all ${simulationOutcome === 'success' ? 'border-green-500 bg-green-50 text-green-800' : 'border-gray-200 text-gray-600'}`}
                  >
                    ✓ Simulate Success
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimulationOutcome('failure')}
                    className={`p-3 rounded-xl border-2 text-xs font-bold transition-all ${simulationOutcome === 'failure' ? 'border-rose-500 bg-rose-50 text-rose-800' : 'border-gray-200 text-gray-600'}`}
                  >
                    ✗ Simulate Failure
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimulationOutcome('pending')}
                    className={`p-3 rounded-xl border-2 text-xs font-bold transition-all ${simulationOutcome === 'pending' ? 'border-amber-500 bg-amber-50 text-amber-800' : 'border-gray-200 text-gray-600'}`}
                  >
                    ⏳ Simulate Pending
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleVerifyDemoPayment}
                disabled={processingPayment}
                className="btn-primary w-full justify-center text-sm py-3.5 shadow-lg shadow-primary-500/25 disabled:opacity-50"
              >
                {processingPayment ? 'Processing Mock Gateway...' : `Complete Simulated Payment (₹${totalAmount})`}
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Order Summary Snapshot */}
        <div className="lg:col-span-4 space-y-4">
          <div className="card p-6 bg-white space-y-4">
            <h3 className="text-sm font-extrabold text-navy-900 pb-3 border-b border-gray-100">
              Order Snapshot ({cart?.items?.length || 0} Items)
            </h3>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {cart?.items?.map((item) => (
                <div key={item._id} className="flex items-center gap-3 text-xs">
                  <img
                    src={item.image || item.product?.images?.[0]?.url || 'https://placehold.co/100x100?text=Medicine'}
                    alt=""
                    className="w-12 h-12 object-contain rounded-xl bg-gray-50 p-1 border border-gray-100 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-navy-900 truncate">{item.name || item.product?.name}</p>
                    <p className="text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-bold text-navy-900">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-navy-900">₹{subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600 font-semibold">
                  <span>Coupon Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span>{shippingCharge === 0 ? <strong className="text-green-600">FREE</strong> : `₹${shippingCharge}`}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between text-sm font-black text-navy-900">
                <span>Total Due</span>
                <span className="text-primary-600 text-lg">₹{totalAmount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
