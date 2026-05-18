import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Home, Check, MapPin, CreditCard, Smartphone, Truck, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from '../hooks/use-toast';

const STEPS = ['Delivery Address', 'Review Order', 'Payment'];

const Checkout = () => {
  const { items, subtotal, shippingFee, discount, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [processing, setProcessing] = useState(false);

  const [address, setAddress] = useState(user?.addresses?.[0] || null);
  const [showAddForm, setShowAddForm] = useState(!user?.addresses?.length);
  const [newAddr, setNewAddr] = useState({ name: user?.name || '', phone: user?.phone || '', street: '', city: 'Dhaka', district: 'Dhaka', postalCode: '' });
  const [payment, setPayment] = useState('cod');

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-brand-dark mb-3">Your cart is empty</h1>
        <Link to="/products" className="inline-block bg-brand-gradient text-white font-semibold px-6 py-3 rounded-full">Browse Gifts</Link>
      </div>
    );
  }

  const next = () => {
    if (step === 0 && !address && (!newAddr.name || !newAddr.phone || !newAddr.street)) {
      toast({ title: 'Please fill the address' });
      return;
    }
    if (step === 0 && !address) setAddress({ ...newAddr, id: 'new', isDefault: true, label: 'Home' });
    setStep(step + 1);
  };

  const placeOrder = () => {
    setProcessing(true);
    setTimeout(() => {
      const orderNumber = `PRZ-2024-${String(Math.floor(Math.random() * 90000) + 10000)}`;
      const lastOrder = { orderNumber, items, address: address || newAddr, payment, total, subtotal, shippingFee, discount, date: new Date().toISOString() };
      localStorage.setItem('prizzy_last_order', JSON.stringify(lastOrder));
      clearCart();
      setProcessing(false);
      navigate(`/order-success/${orderNumber}`);
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-5">
        <Link to="/" className="flex items-center hover:text-brand-pink"><Home size={14} /></Link>
        <ChevronRight size={14} />
        <Link to="/cart" className="hover:text-brand-pink">Cart</Link>
        <ChevronRight size={14} />
        <span className="text-brand-dark font-medium">Checkout</span>
      </nav>

      {/* Stepper */}
      <div className="flex items-center justify-between mb-8 bg-white border border-gray-100 rounded-2xl p-4 md:p-6">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-sm ${i <= step ? 'bg-brand-gradient text-white shadow-brand' : 'bg-gray-100 text-gray-400'}`}>
                {i < step ? <Check size={18} /> : i + 1}
              </div>
              <span className={`hidden md:block font-semibold text-sm ${i <= step ? 'text-brand-dark' : 'text-gray-400'}`}>{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`flex-1 h-1 mx-2 md:mx-4 rounded-full ${i < step ? 'bg-brand-gradient' : 'bg-gray-100'}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Step 0 — Address */}
          {step === 0 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <h2 className="font-bold text-lg text-brand-dark mb-4 flex items-center gap-2"><MapPin size={18} className="text-brand-pink" /> Delivery Address</h2>
              {user?.addresses?.length > 0 && (
                <div className="space-y-3 mb-4">
                  {user.addresses.map(a => (
                    <button key={a.id} onClick={() => { setAddress(a); setShowAddForm(false); }} className={`w-full text-left p-4 rounded-xl border-2 ${address?.id === a.id ? 'border-brand-pink bg-brand-pink/5' : 'border-gray-100 hover:border-brand-pink/30'}`}>
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${address?.id === a.id ? 'border-brand-pink bg-brand-pink' : 'border-gray-300'}`}>
                          {address?.id === a.id && <Check size={12} className="text-white" />}
                        </div>
                        <div>
                          <p className="font-semibold text-brand-dark">{a.label} <span className="text-xs font-normal text-gray-500">• {user.name}</span></p>
                          <p className="text-sm text-gray-600">{a.street}, {a.city}, {a.district} - {a.postalCode}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{user.phone}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {!showAddForm ? (
                <button onClick={() => { setShowAddForm(true); setAddress(null); }} className="w-full p-4 border-2 border-dashed border-brand-pink/30 rounded-xl text-brand-pink font-semibold hover:bg-brand-pink/5 flex items-center justify-center gap-2">
                  <Plus size={16} /> Add New Address
                </button>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Field label="Full Name" value={newAddr.name} onChange={(v) => setNewAddr({ ...newAddr, name: v })} />
                  <Field label="Phone Number" value={newAddr.phone} onChange={(v) => setNewAddr({ ...newAddr, phone: v })} />
                  <Field label="Street Address" value={newAddr.street} onChange={(v) => setNewAddr({ ...newAddr, street: v })} className="md:col-span-2" />
                  <Field label="City" value={newAddr.city} onChange={(v) => setNewAddr({ ...newAddr, city: v })} />
                  <Field label="District" value={newAddr.district} onChange={(v) => setNewAddr({ ...newAddr, district: v })} />
                  <Field label="Postal Code" value={newAddr.postalCode} onChange={(v) => setNewAddr({ ...newAddr, postalCode: v })} />
                </div>
              )}
            </div>
          )}

          {/* Step 1 — Review */}
          {step === 1 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <h2 className="font-bold text-lg text-brand-dark mb-4">Review Your Order</h2>
              <div className="divide-y divide-gray-100">
                {items.map(item => (
                  <div key={item.product.id} className="flex gap-4 py-4">
                    <img src={item.product.thumbnail} alt="" className="w-16 h-16 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-brand-dark line-clamp-1">{item.product.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity} • by {item.product.seller.shopName}</p>
                      {item.personalMessage && <p className="text-xs italic text-gray-500 mt-1">“{item.personalMessage}”</p>}
                    </div>
                    <p className="font-bold text-brand-pink">৳{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 bg-brand-gradient-soft rounded-xl p-3">
                <p className="text-sm font-semibold text-brand-dark">Shipping to:</p>
                <p className="text-xs text-gray-600">{(address || newAddr).name} • {(address || newAddr).phone}</p>
                <p className="text-xs text-gray-600">{(address || newAddr).street}, {(address || newAddr).city}</p>
              </div>
            </div>
          )}

          {/* Step 2 — Payment */}
          {step === 2 && (
            <div className="bg-white border border-gray-100 rounded-2xl p-5">
              <h2 className="font-bold text-lg text-brand-dark mb-4 flex items-center gap-2"><CreditCard size={18} className="text-brand-pink" /> Payment Method</h2>
              <div className="space-y-3">
                <PayOption icon={CreditCard} label="Pay Online (SSLCommerz)" desc="Visa, Mastercard, AMEX, internet banking" value="sslcommerz" current={payment} setPayment={setPayment} />
                <PayOption icon={Smartphone} label="bKash" desc="Pay securely with your bKash wallet" value="bkash" current={payment} setPayment={setPayment} accent="#E2136E" />
                <PayOption icon={Truck} label="Cash on Delivery" desc="Pay when you receive your gift" value="cod" current={payment} setPayment={setPayment} />
              </div>
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800">
                <strong>Note:</strong> Payment gateways are MOCKED in this preview. Real SSLCommerz / bKash will be integrated later.
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            {step > 0 ? (
              <button onClick={() => setStep(step - 1)} className="px-6 py-3 border-2 border-gray-200 rounded-full font-semibold text-brand-dark hover:border-brand-pink hover:text-brand-pink">← Back</button>
            ) : <span />}
            {step < STEPS.length - 1 ? (
              <button onClick={next} className="px-7 py-3 bg-brand-gradient text-white font-bold rounded-full flex items-center gap-2 hover:opacity-90 shadow-brand">Continue <ChevronRight size={16} /></button>
            ) : (
              <button onClick={placeOrder} disabled={processing} className="px-7 py-3 bg-brand-gradient text-white font-bold rounded-full flex items-center gap-2 hover:opacity-90 shadow-brand disabled:opacity-60">
                {processing ? 'Processing…' : `Place Order • ৳${total.toLocaleString()}`}
              </button>
            )}
          </div>
        </div>

        {/* Summary sidebar */}
        <div className="self-start lg:sticky lg:top-44">
          <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <h3 className="font-bold text-brand-dark mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <Row label={`Items (${items.length})`} value={`৳${subtotal.toLocaleString()}`} />
              <Row label="Shipping" value={`৳${shippingFee}`} />
              {discount > 0 && <Row label="Discount" value={`-৳${discount.toLocaleString()}`} accent />}
            </div>
            <div className="flex items-baseline justify-between border-t border-gray-100 pt-4 mt-4">
              <span className="font-bold text-brand-dark">Total</span>
              <span className="text-2xl font-extrabold text-brand-pink">৳{total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, value, onChange, className = '' }) => (
  <div className={className}>
    <label className="text-xs font-semibold text-gray-600 mb-1 block">{label}</label>
    <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-brand-pink text-sm" />
  </div>
);

const Row = ({ label, value, accent }) => (
  <div className="flex items-center justify-between">
    <span className="text-gray-500">{label}</span>
    <span className={`font-semibold ${accent ? 'text-green-600' : 'text-brand-dark'}`}>{value}</span>
  </div>
);

const PayOption = ({ icon: Icon, label, desc, value, current, setPayment, accent }) => (
  <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer ${current === value ? 'border-brand-pink bg-brand-pink/5' : 'border-gray-100 hover:border-brand-pink/30'}`}>
    <input type="radio" name="payment" checked={current === value} onChange={() => setPayment(value)} className="sr-only" />
    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${current === value ? 'border-brand-pink bg-brand-pink' : 'border-gray-300'}`}>
      {current === value && <Check size={12} className="text-white" />}
    </div>
    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: accent ? `${accent}15` : '#FFE5EF' }}>
      <Icon size={18} style={{ color: accent || '#FF2D78' }} />
    </div>
    <div className="flex-1">
      <p className="font-semibold text-sm text-brand-dark">{label}</p>
      <p className="text-xs text-gray-500">{desc}</p>
    </div>
  </label>
);

export default Checkout;
