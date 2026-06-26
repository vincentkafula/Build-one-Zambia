import { useState, useEffect, useRef, CSSProperties } from 'react';
import { ordersApi, gatewayApi, GatewayConfig } from '../lib/api';
import {
  X, ShoppingCart, ChevronRight, ChevronLeft, CreditCard,
  Smartphone, Check, AlertCircle, Trash2, MapPin, Truck,
  Shield, RefreshCw, ExternalLink,
} from 'lucide-react';

export interface CartItem {
  id: number;
  name: string;
  price: string;
  priceNum: number;
  img: string;
  tag: string;
  qty: number;
}

type PayMethod = 'card' | 'airtel' | 'zamtel' | 'mtn';
type Step = 'cart' | 'details' | 'payment' | 'confirm' | 'success';

// Extend window for Flutterwave inline JS
declare global {
  interface Window {
    FlutterwaveCheckout?: (config: Record<string, unknown>) => { close: () => void };
  }
}

const s = {
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.88)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end' } as CSSProperties,
  drawer: { backgroundColor: '#0d0d0d', width: '100%', maxWidth: '520px', height: '100vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', borderLeft: '1px solid #1f1f1f', fontFamily: 'Open Sans, sans-serif', color: '#fff' } as CSSProperties,
  header: { padding: '20px 24px', borderBottom: '1px solid #1f1f1f', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, backgroundColor: '#0d0d0d', zIndex: 2 } as CSSProperties,
  body: { flex: 1, padding: '24px', overflowY: 'auto' } as CSSProperties,
  footer: { padding: '20px 24px', borderTop: '1px solid #1f1f1f', position: 'sticky', bottom: 0, backgroundColor: '#0d0d0d' } as CSSProperties,
  label: { fontSize: '11px', letterSpacing: '0.15em', color: '#6b7280', fontFamily: 'Oswald, sans-serif', display: 'block', marginBottom: '6px' } as CSSProperties,
  input: { width: '100%', boxSizing: 'border-box', padding: '12px 14px', backgroundColor: '#111', border: '1px solid #2a2a2a', color: '#fff', fontSize: '14px', outline: 'none', fontFamily: 'Open Sans, sans-serif', marginBottom: '16px' } as CSSProperties,
  btnRed: { width: '100%', padding: '14px', backgroundColor: '#dc2626', color: '#fff', border: 'none', fontFamily: 'Oswald, sans-serif', fontSize: '14px', letterSpacing: '0.1em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' } as CSSProperties,
  btnGhost: { width: '100%', padding: '13px', backgroundColor: 'transparent', color: '#9ca3af', border: '1px solid #2a2a2a', fontFamily: 'Oswald, sans-serif', fontSize: '13px', letterSpacing: '0.08em', cursor: 'pointer', marginTop: '10px' } as CSSProperties,
};

function StepBar({ step }: { step: Step }) {
  const steps: Step[] = ['cart', 'details', 'payment', 'confirm'];
  const labels = ['Cart', 'Details', 'Payment', 'Confirm'];
  const idx = steps.indexOf(step);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0 0 20px' }}>
      {steps.map((st, i) => (
        <div key={st} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? '1' : 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: i <= idx ? '#dc2626' : '#1f1f1f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontFamily: 'Oswald, sans-serif', color: i <= idx ? '#fff' : '#4b5563', flexShrink: 0 }}>
              {i < idx ? <Check style={{ width: '12px', height: '12px' }} /> : i + 1}
            </div>
            <span style={{ fontSize: '10px', color: i <= idx ? '#dc2626' : '#4b5563', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{labels[i]}</span>
          </div>
          {i < steps.length - 1 && <div style={{ flex: 1, height: '1px', backgroundColor: i < idx ? '#dc2626' : '#1f1f1f', margin: '0 6px', marginBottom: '18px' }} />}
        </div>
      ))}
    </div>
  );
}

const MOBILE_NETS = {
  airtel: { label: 'Airtel Money', color: '#e2001a', ussd: '*115#', prefix: '097' },
  zamtel: { label: 'Zamtel Money', color: '#009245', ussd: '*322#', prefix: '095' },
  mtn:    { label: 'MTN Money',    color: '#ffc000', ussd: '*303#', prefix: '096' },
};

const ZAMBIA_PROVINCES = [
  'Lusaka', 'Copperbelt', 'Central', 'Eastern', 'Southern',
  'Western', 'Northern', 'Luapula', 'North-Western', 'Muchinga',
];

const SHIPPING_RATES: Record<string, number> = {
  'Lusaka': 50, 'Copperbelt': 75, 'Central': 80, 'Eastern': 100,
  'Southern': 90, 'Western': 120, 'Northern': 110, 'Luapula': 110,
  'North-Western': 120, 'Muchinga': 115,
};

interface Props {
  cart: CartItem[];
  onClose: () => void;
  onUpdateQty: (id: number, qty: number) => void;
  onRemove: (id: number) => void;
}

export function ShopCheckout({ cart, onClose, onUpdateQty, onRemove }: Props) {
  const [step, setStep]           = useState<Step>('cart');
  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [phone, setPhone]         = useState('');
  const [addressLine1, setAddr1]  = useState('');
  const [addressLine2, setAddr2]  = useState('');
  const [city, setCity]           = useState('');
  const [province, setProvince]   = useState('');
  const [method, setMethod]       = useState<PayMethod>('card');
  const [mobileNum, setMobileNum] = useState('');

  const [processing, setProcessing]   = useState(false);
  const [error, setError]             = useState('');
  const [txRef, setTxRef]             = useState('');
  const [pollStatus, setPollStatus]   = useState<'idle' | 'waiting' | 'verifying' | 'done' | 'failed'>('idle');
  const [pollMsg, setPollMsg]         = useState('');
  const [gwConfig, setGwConfig]       = useState<GatewayConfig | null>(null);
  const [flwLoaded, setFlwLoaded]     = useState(false);

  const pollRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const orderId   = useRef('');
  const flwModal  = useRef<{ close: () => void } | null>(null);

  // Load Flutterwave inline script + gateway config
  useEffect(() => {
    gatewayApi.config().then(cfg => setGwConfig(cfg)).catch(() => {});

    if (document.getElementById('flw-script')) { setFlwLoaded(true); return; }
    const script = document.createElement('script');
    script.id = 'flw-script';
    script.src = 'https://checkout.flutterwave.com/v3.js';
    script.onload = () => setFlwLoaded(true);
    script.onerror = () => console.warn('Flutterwave script failed to load');
    document.head.appendChild(script);
  }, []);

  // Stop polling on unmount
  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  const subtotal     = cart.reduce((sum, i) => sum + i.priceNum * i.qty, 0);
  const shippingCost = province ? (SHIPPING_RATES[province] ?? 100) : 0;
  const total        = subtotal + shippingCost;

  // ── Validation ─────────────────────────────────────────────────────────────

  const validate = (): string => {
    if (step === 'details') {
      if (!name.trim())    return 'Please enter your full name.';
      if (!phone.trim())   return 'Please enter your phone number.';
      if (!addressLine1.trim()) return 'Please enter your street address.';
      if (!city.trim())    return 'Please enter your city or town.';
      if (!province)       return 'Please select your province.';
    }
    if (step === 'payment' && method !== 'card') {
      if (mobileNum.replace(/\D/g, '').length < 9) return 'Please enter a valid mobile number.';
    }
    return '';
  };

  const next = () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    const flow: Step[] = ['cart', 'details', 'payment', 'confirm', 'success'];
    setStep(flow[flow.indexOf(step) + 1]);
  };

  const back = () => {
    setError('');
    const flow: Step[] = ['cart', 'details', 'payment', 'confirm', 'success'];
    const i = flow.indexOf(step);
    if (i > 0) setStep(flow[i - 1]);
  };

  // ── Create order ───────────────────────────────────────────────────────────

  const createOrder = async () => {
    const deliveryAddress = [addressLine1, addressLine2, city, province, 'Zambia'].filter(Boolean).join(', ');
    const res = await ordersApi.create({
      items: cart.map(i => ({ id: String(i.id), name: i.name, price: i.price, priceNum: i.priceNum, qty: i.qty })),
      subtotal, shippingCost, total,
      customerName: name, customerEmail: email, customerPhone: phone,
      deliveryAddress, paymentMethod: method,
    });
    const created = res.order as { id: string };
    orderId.current = created.id;
    return created.id;
  };

  // ── Mobile money polling ───────────────────────────────────────────────────

  const startPolling = (ref: string) => {
    setTxRef(ref);
    setPollStatus('waiting');
    setPollMsg('Check your phone and approve the payment prompt…');
    let attempts = 0;
    const MAX = 60; // 3 min

    pollRef.current = setInterval(async () => {
      attempts++;
      setPollStatus('verifying');
      try {
        const { result } = await gatewayApi.verifyByTxRef(ref);
        if (result.status === 'successful') {
          if (pollRef.current) clearInterval(pollRef.current);
          setPollStatus('done');
          setProcessing(false);
          setStep('success');
        } else if (result.status === 'failed') {
          if (pollRef.current) clearInterval(pollRef.current);
          setPollStatus('failed');
          setProcessing(false);
          setError('Payment was declined. Please try again.');
        } else {
          setPollStatus('waiting');
          setPollMsg(`Waiting for approval… (${Math.ceil((MAX - attempts) * 3 / 60)} min remaining)`);
        }
      } catch { /* ignore transient poll errors */ }

      if (attempts >= MAX) {
        if (pollRef.current) clearInterval(pollRef.current);
        setPollStatus('failed');
        setProcessing(false);
        setError('Payment timed out. Please try again or use a different payment method.');
      }
    }, 3000);
  };

  // ── Card payment via Flutterwave inline popup ──────────────────────────────

  const payCard = async (oId: string) => {
    if (!gwConfig || !window.FlutterwaveCheckout) {
      setError('Payment system loading — please wait a moment and try again.');
      setProcessing(false);
      return;
    }

    const ref = `BOZ-${Date.now().toString(36).toUpperCase()}-${oId.slice(-6).toUpperCase()}`;
    setTxRef(ref);

    flwModal.current = window.FlutterwaveCheckout({
      public_key: gwConfig.publicKey,
      tx_ref: ref,
      amount: total,
      currency: gwConfig.currency,
      payment_options: 'card',
      customer: {
        email: email || `order+${oId}@buildonezambia.com`,
        phone_number: phone,
        name,
      },
      meta: { orderId: oId },
      customizations: {
        title: 'BOZ Campaign Shop',
        description: `Order #${oId.slice(-8).toUpperCase()} — ${cart.length} item${cart.length !== 1 ? 's' : ''}`,
        logo: 'https://buildonezambia.com/logo.png',
      },
      callback: async (response: { status: string; transaction_id: number; tx_ref: string; flw_ref: string }) => {
        if (flwModal.current) flwModal.current.close();
        if (response.status === 'successful' || response.status === 'completed') {
          setPollStatus('verifying');
          setPollMsg('Verifying payment with Flutterwave…');
          try {
            const res = await gatewayApi.verifyCard({
              transactionId: response.transaction_id,
              txRef: response.tx_ref,
              orderId: oId,
            });
            if (res.verified) {
              setProcessing(false);
              setStep('success');
            } else {
              setError('Payment could not be verified. Please contact support.');
              setProcessing(false);
            }
          } catch {
            setError('Verification failed. Contact support with ref: ' + response.tx_ref);
            setProcessing(false);
          }
        } else {
          setError('Payment was not completed. Please try again.');
          setProcessing(false);
        }
      },
      onclose: () => {
        if (pollStatus !== 'done') {
          setProcessing(false);
          setError('Payment window closed. Click "Pay Now" to try again.');
        }
      },
    });
  };

  // ── Main pay handler ───────────────────────────────────────────────────────

  const pay = async () => {
    setProcessing(true);
    setError('');
    setPollStatus('idle');

    try {
      const oId = await createOrder();

      if (method === 'card') {
        await payCard(oId);
      } else {
        // Mobile money — initiate USSD push
        const net = method.toUpperCase();
        const res = await gatewayApi.initiateMobileMoney({
          orderId: oId,
          amount: total,
          phone: mobileNum.replace(/\D/g, ''),
          network: net,
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
        });

        if (!res.success) {
          setError(res.error || res.message || 'Mobile money initiation failed.');
          setProcessing(false);
          return;
        }

        startPolling(res.txRef);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed. Please try again.');
      setProcessing(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const isPaying = processing || pollStatus === 'waiting' || pollStatus === 'verifying';

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.drawer} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={s.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {step !== 'cart' && step !== 'success' && (
              <button onClick={back} disabled={isPaying} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '4px', display: 'flex' }}>
                <ChevronLeft style={{ width: '18px', height: '18px' }} />
              </button>
            )}
            <div>
              <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '16px', letterSpacing: '0.08em', color: '#fff', margin: 0 }}>
                {step === 'cart' ? 'YOUR CART' : step === 'details' ? 'YOUR DETAILS' : step === 'payment' ? 'PAYMENT METHOD' : step === 'confirm' ? 'CONFIRM ORDER' : 'ORDER COMPLETE'}
              </p>
              {step !== 'success' && (
                <p style={{ fontSize: '11px', color: '#4b5563', margin: '2px 0 0' }}>
                  {cart.length} item{cart.length !== 1 ? 's' : ''} · K{total.toLocaleString()}
                  {shippingCost > 0 ? ` (incl. K${shippingCost} shipping)` : ''}
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', display: 'flex' }}>
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        <div style={s.body}>

          {/* ── CART ── */}
          {step === 'cart' && (
            <>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#4b5563' }}>
                  <ShoppingCart style={{ width: '48px', height: '48px', margin: '0 auto 16px', display: 'block' }} />
                  <p style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>Your cart is empty.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {cart.map(item => (
                    <div key={item.id} style={{ display: 'flex', gap: '14px', backgroundColor: '#111', border: '1px solid #1f1f1f', padding: '14px' }}>
                      <img src={item.img} alt={item.name} style={{ width: '70px', height: '70px', objectFit: 'cover', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', letterSpacing: '0.04em', color: '#fff', margin: '0 0 4px' }}>{item.name}</p>
                        <p style={{ fontSize: '12px', color: '#dc2626', fontFamily: 'Oswald, sans-serif', margin: '0 0 10px' }}>K{item.priceNum.toLocaleString()} each</p>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #2a2a2a' }}>
                            <button onClick={() => item.qty > 1 ? onUpdateQty(item.id, item.qty - 1) : onRemove(item.id)} style={{ width: '30px', height: '30px', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '16px' }}>−</button>
                            <span style={{ width: '30px', textAlign: 'center', fontSize: '13px', color: '#fff', fontFamily: 'Oswald, sans-serif' }}>{item.qty}</span>
                            <button onClick={() => onUpdateQty(item.id, item.qty + 1)} style={{ width: '30px', height: '30px', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '16px' }}>+</button>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '14px', color: '#fff' }}>K{(item.priceNum * item.qty).toLocaleString()}</span>
                            <button onClick={() => onRemove(item.id)} style={{ background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer', display: 'flex' }}>
                              <Trash2 style={{ width: '14px', height: '14px' }} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Totals */}
                  <div style={{ borderTop: '1px solid #1f1f1f', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', letterSpacing: '0.06em', color: '#6b7280' }}>SUBTOTAL</span>
                      <span style={{ fontSize: '14px', color: '#d1d5db' }}>K{subtotal.toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', letterSpacing: '0.06em', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Truck style={{ width: '11px', height: '11px' }} /> SHIPPING
                      </span>
                      <span style={{ fontSize: '12px', color: '#9ca3af' }}>Calculated at checkout</span>
                    </div>
                    <div style={{ borderTop: '1px solid #1f1f1f', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', letterSpacing: '0.06em', color: '#6b7280' }}>ESTIMATED TOTAL</span>
                      <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '20px', color: '#dc2626' }}>K{subtotal.toLocaleString()}+</span>
                    </div>
                  </div>
                  <p style={{ fontSize: '11px', color: '#4b5563', textAlign: 'right', margin: '-4px 0 0' }}>All proceeds support the BOZ campaign fund</p>
                </div>
              )}
            </>
          )}

          {/* ── DETAILS ── */}
          {step === 'details' && (
            <>
              <StepBar step={step} />
              <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', letterSpacing: '0.12em', color: '#dc2626', marginBottom: '14px' }}>CONTACT INFORMATION</p>
              <label style={s.label}>FULL NAME *</label>
              <input style={s.input} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Chanda Mwale" />
              <label style={s.label}>PHONE NUMBER *</label>
              <input style={s.input} value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 0971 234 567" />
              <label style={s.label}>EMAIL ADDRESS (OPTIONAL)</label>
              <input style={s.input} value={email} onChange={e => setEmail(e.target.value)} placeholder="e.g. chanda@email.com" type="email" />

              <div style={{ borderTop: '1px solid #1f1f1f', margin: '4px 0 18px' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
                <MapPin style={{ width: '13px', height: '13px', color: '#dc2626' }} />
                <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', letterSpacing: '0.12em', color: '#dc2626', margin: 0 }}>DELIVERY ADDRESS</p>
              </div>
              <label style={s.label}>STREET / PLOT / STAND NUMBER *</label>
              <input style={s.input} value={addressLine1} onChange={e => setAddr1(e.target.value)} placeholder="e.g. Plot 45, Cairo Road" />
              <label style={s.label}>APARTMENT / AREA / NEIGHBOURHOOD (OPTIONAL)</label>
              <input style={s.input} value={addressLine2} onChange={e => setAddr2(e.target.value)} placeholder="e.g. Flat 3B, Woodlands" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={s.label}>CITY / TOWN *</label>
                  <input style={s.input} value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Lusaka" />
                </div>
                <div>
                  <label style={s.label}>PROVINCE *</label>
                  <select value={province} onChange={e => setProvince(e.target.value)}
                    style={{ ...s.input, marginBottom: 0, cursor: 'pointer', appearance: 'none' as const, color: province ? '#fff' : '#6b7280' }}>
                    <option value="">Select province…</option>
                    {ZAMBIA_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              {province && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px', padding: '12px', backgroundColor: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.15)' }}>
                  <Truck style={{ width: '14px', height: '14px', color: '#dc2626', flexShrink: 0 }} />
                  <div>
                    <p style={{ margin: 0, fontSize: '12px', color: '#d1d5db', fontFamily: 'Oswald, sans-serif' }}>
                      Shipping to {province}: <strong style={{ color: '#dc2626' }}>K{shippingCost.toLocaleString()}</strong>
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#6b7280' }}>Delivered within 7–14 business days</p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── PAYMENT METHOD ── */}
          {step === 'payment' && (
            <>
              <StepBar step={step} />
              <p style={{ ...s.label, marginBottom: '14px' }}>SELECT PAYMENT METHOD</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                {[
                  { key: 'card' as PayMethod, label: 'Visa / Mastercard', sub: 'Secure card payment via Flutterwave', icon: '💳', color: '#1a3a8f' },
                  { key: 'airtel' as PayMethod, label: 'Airtel Money', sub: 'Airtel mobile money — USSD push to your phone', icon: '📱', color: '#e2001a' },
                  { key: 'zamtel' as PayMethod, label: 'Zamtel Money', sub: 'Zamtel mobile money — USSD push to your phone', icon: '📱', color: '#009245' },
                  { key: 'mtn' as PayMethod, label: 'MTN Money', sub: 'MTN mobile money — USSD push to your phone', icon: '📱', color: '#ffc000' },
                ].map(m => (
                  <button key={m.key} onClick={() => setMethod(m.key)}
                    style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px', backgroundColor: method === m.key ? 'rgba(220,38,38,0.08)' : '#111', border: `1px solid ${method === m.key ? '#dc2626' : '#2a2a2a'}`, cursor: 'pointer', textAlign: 'left', color: '#fff', transition: 'all 0.15s' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '6px', backgroundColor: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>{m.icon}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', letterSpacing: '0.06em', margin: 0, color: '#fff' }}>{m.label}</p>
                      <p style={{ fontSize: '11px', color: '#6b7280', margin: '2px 0 0' }}>{m.sub}</p>
                    </div>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: `2px solid ${method === m.key ? '#dc2626' : '#4b5563'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {method === m.key && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#dc2626' }} />}
                    </div>
                  </button>
                ))}
              </div>

              {/* Card info box */}
              {method === 'card' && (
                <div style={{ backgroundColor: '#111', border: '1px solid #1f1f1f', padding: '18px', borderTop: '3px solid #1a3a8f' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <Shield style={{ width: '14px', height: '14px', color: '#60a5fa' }} />
                    <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', letterSpacing: '0.08em', color: '#60a5fa', margin: 0 }}>SECURE CARD CHECKOUT</p>
                  </div>
                  <p style={{ fontSize: '12px', color: '#9ca3af', lineHeight: 1.7, margin: '0 0 10px' }}>
                    A secure Flutterwave payment popup will open when you click Pay Now. Your card details are processed directly by Flutterwave — we never see your card number.
                  </p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['VISA', 'MASTERCARD', '3D SECURE', 'PCI DSS'].map(b => (
                      <span key={b} style={{ fontSize: '10px', padding: '3px 8px', border: '1px solid #2a2a2a', color: '#4b5563', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>{b}</span>
                    ))}
                  </div>
                  {!flwLoaded && (
                    <p style={{ fontSize: '11px', color: '#f59e0b', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <RefreshCw style={{ width: '10px', height: '10px' }} /> Loading payment system…
                    </p>
                  )}
                </div>
              )}

              {/* Mobile money — phone input */}
              {(method === 'airtel' || method === 'zamtel' || method === 'mtn') && (() => {
                const net = MOBILE_NETS[method];
                return (
                  <div style={{ backgroundColor: '#111', border: '1px solid #1f1f1f', padding: '20px', borderTop: `3px solid ${net.color}` }}>
                    <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', letterSpacing: '0.06em', color: '#fff', marginBottom: '16px' }}>{net.label} PAYMENT</p>
                    <label style={s.label}>{net.label.toUpperCase()} PHONE NUMBER *</label>
                    <input style={s.input} value={mobileNum} onChange={e => setMobileNum(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder={`e.g. ${net.prefix}X XXX XXXX`} />
                    <div style={{ backgroundColor: '#0d0d0d', border: '1px solid #1f1f1f', padding: '14px', fontSize: '12px', color: '#9ca3af', lineHeight: 1.8 }}>
                      <p style={{ color: '#fff', fontFamily: 'Oswald, sans-serif', fontSize: '11px', letterSpacing: '0.1em', marginBottom: '8px' }}>HOW IT WORKS</p>
                      <p style={{ margin: '0 0 4px' }}>1. Enter your {net.label} number above</p>
                      <p style={{ margin: '0 0 4px' }}>2. Click Pay — a USSD prompt is sent to your phone</p>
                      <p style={{ margin: '0 0 4px' }}>3. Approve the <strong style={{ color: net.color }}>K{total.toLocaleString()}</strong> payment on your device</p>
                      <p style={{ margin: 0 }}>4. Your order confirms automatically once approved</p>
                    </div>
                  </div>
                );
              })()}
            </>
          )}

          {/* ── CONFIRM ── */}
          {step === 'confirm' && (
            <>
              <StepBar step={step} />

              {/* Order summary */}
              <div style={{ backgroundColor: '#111', border: '1px solid #1f1f1f', padding: '16px', marginBottom: '16px' }}>
                <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', letterSpacing: '0.1em', color: '#dc2626', marginBottom: '12px' }}>ORDER SUMMARY</p>
                {cart.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#d1d5db', marginBottom: '8px' }}>
                    <span>{item.name} × {item.qty}</span>
                    <span>K{(item.priceNum * item.qty).toLocaleString()}</span>
                  </div>
                ))}
                <div style={{ borderTop: '1px solid #1f1f1f', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: '#6b7280' }}>Subtotal</span><span style={{ color: '#d1d5db' }}>K{subtotal.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Truck style={{ width: '10px', height: '10px' }} /> Shipping ({province})
                    </span>
                    <span style={{ color: '#d1d5db' }}>K{shippingCost.toLocaleString()}</span>
                  </div>
                  <div style={{ borderTop: '1px solid #2a2a2a', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '14px', color: '#6b7280' }}>TOTAL</span>
                    <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '20px', color: '#dc2626' }}>K{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Customer + delivery */}
              <div style={{ backgroundColor: '#111', border: '1px solid #1f1f1f', padding: '16px', marginBottom: '16px' }}>
                <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', letterSpacing: '0.1em', color: '#dc2626', marginBottom: '10px' }}>CUSTOMER</p>
                <p style={{ fontSize: '13px', color: '#d1d5db', margin: '0 0 4px' }}>{name}</p>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 2px' }}>{phone}</p>
                {email && <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>{email}</p>}
              </div>
              <div style={{ backgroundColor: '#111', border: '1px solid #1f1f1f', padding: '16px', marginBottom: '16px' }}>
                <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', letterSpacing: '0.1em', color: '#dc2626', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <MapPin style={{ width: '11px', height: '11px' }} /> DELIVERY ADDRESS
                </p>
                <p style={{ fontSize: '13px', color: '#d1d5db', margin: '0 0 2px' }}>{addressLine1}</p>
                {addressLine2 && <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 2px' }}>{addressLine2}</p>}
                <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>{city}, {province}</p>
              </div>

              {/* Payment method */}
              <div style={{ backgroundColor: '#111', border: '1px solid #1f1f1f', padding: '16px', marginBottom: '16px' }}>
                <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', letterSpacing: '0.1em', color: '#dc2626', marginBottom: '10px' }}>PAYMENT METHOD</p>
                {method === 'card' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Shield style={{ width: '14px', height: '14px', color: '#60a5fa' }} />
                    <div>
                      <p style={{ fontSize: '13px', color: '#d1d5db', margin: 0 }}>Visa / Mastercard</p>
                      <p style={{ fontSize: '11px', color: '#6b7280', margin: '2px 0 0' }}>Secure popup opens after you click Pay Now</p>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Smartphone style={{ width: '14px', height: '14px', color: '#9ca3af' }} />
                    <div>
                      <p style={{ fontSize: '13px', color: '#d1d5db', margin: 0 }}>{MOBILE_NETS[method as 'airtel' | 'zamtel' | 'mtn'].label}</p>
                      <p style={{ fontSize: '11px', color: '#6b7280', margin: '2px 0 0' }}>{mobileNum}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile money polling status */}
              {(pollStatus === 'waiting' || pollStatus === 'verifying') && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '14px', backgroundColor: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)', marginBottom: '16px' }}>
                  <RefreshCw style={{ width: '14px', height: '14px', color: '#fbbf24', flexShrink: 0, marginTop: '1px', animation: 'spin 1s linear infinite' }} />
                  <div>
                    <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', letterSpacing: '0.06em', color: '#fbbf24', margin: '0 0 4px' }}>
                      {pollStatus === 'verifying' ? 'VERIFYING PAYMENT…' : 'AWAITING MOBILE APPROVAL'}
                    </p>
                    <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>{pollMsg || 'Check your phone and approve the USSD prompt.'}</p>
                    {txRef && <p style={{ fontSize: '10px', color: '#6b7280', margin: '6px 0 0', fontFamily: 'monospace' }}>Ref: {txRef}</p>}
                  </div>
                </div>
              )}

              {/* Card verifying */}
              {pollStatus === 'verifying' && method === 'card' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', backgroundColor: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)', marginBottom: '16px' }}>
                  <RefreshCw style={{ width: '13px', height: '13px', color: '#60a5fa', flexShrink: 0 }} />
                  <p style={{ fontSize: '12px', color: '#60a5fa', margin: 0 }}>{pollMsg || 'Verifying your payment…'}</p>
                </div>
              )}

              <p style={{ fontSize: '11px', color: '#4b5563', lineHeight: 1.7 }}>
                By completing this purchase you confirm all proceeds support the Build One Zambia campaign fund. Items are dispatched within 7–14 business days.
              </p>
            </>
          )}

          {/* ── SUCCESS ── */}
          {step === 'success' && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: 'rgba(220,38,38,0.12)', border: '2px solid #dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <Check style={{ width: '32px', height: '32px', color: '#dc2626' }} />
              </div>
              <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.6rem', letterSpacing: '0.04em', color: '#fff', marginBottom: '12px' }}>ORDER CONFIRMED!</h2>
              <p style={{ fontSize: '14px', lineHeight: 1.8, color: '#9ca3af', marginBottom: '8px' }}>
                Thank you, <strong style={{ color: '#fff' }}>{name}</strong>. Your payment was successful.
              </p>
              <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '8px' }}>
                Total paid: <strong style={{ color: '#dc2626', fontFamily: 'Oswald, sans-serif' }}>K{total.toLocaleString()}</strong>
              </p>
              <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '24px' }}>
                (K{subtotal.toLocaleString()} items + K{shippingCost.toLocaleString()} shipping)
              </p>
              <div style={{ backgroundColor: '#111', border: '1px solid #1f1f1f', padding: '16px', textAlign: 'left', marginBottom: '16px' }}>
                <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', letterSpacing: '0.1em', color: '#dc2626', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <MapPin style={{ width: '10px', height: '10px' }} /> SHIPPING TO
                </p>
                <p style={{ fontSize: '13px', color: '#d1d5db', margin: '0 0 2px' }}>{name}</p>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 2px' }}>{addressLine1}{addressLine2 ? `, ${addressLine2}` : ''}</p>
                <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>{city}, {province}, Zambia</p>
              </div>
              {txRef && (
                <p style={{ fontSize: '11px', color: '#4b5563', marginBottom: '20px', fontFamily: 'monospace' }}>Payment ref: {txRef}</p>
              )}
              <div style={{ backgroundColor: '#111', border: '1px solid #1f1f1f', padding: '16px', textAlign: 'left', marginBottom: '32px' }}>
                <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', letterSpacing: '0.1em', color: '#dc2626', marginBottom: '8px' }}>WHAT HAPPENS NEXT</p>
                <p style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.8, margin: 0 }}>
                  {email ? `A confirmation email has been sent to ${email}.` : ''} Our team will contact you on <strong style={{ color: '#d1d5db' }}>{phone}</strong> to confirm your order. Items are dispatched to <strong style={{ color: '#d1d5db' }}>{city}, {province}</strong> within 7–14 business days.
                </p>
              </div>
              <button onClick={onClose} style={{ ...s.btnRed, maxWidth: '280px', margin: '0 auto' }}>
                CONTINUE SHOPPING
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', backgroundColor: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.3)', padding: '12px', marginTop: '16px' }}>
              <AlertCircle style={{ width: '15px', height: '15px', color: '#dc2626', flexShrink: 0, marginTop: '1px' }} />
              <p style={{ fontSize: '13px', color: '#fca5a5', margin: 0 }}>{error}</p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {step !== 'success' && (
          <div style={s.footer}>
            {step === 'cart' && cart.length > 0 && (
              <button style={s.btnRed} onClick={next}>
                PROCEED TO CHECKOUT <ChevronRight style={{ width: '16px', height: '16px' }} />
              </button>
            )}
            {step === 'details' && (
              <button style={s.btnRed} onClick={next}>
                CONTINUE TO PAYMENT <ChevronRight style={{ width: '16px', height: '16px' }} />
              </button>
            )}
            {step === 'payment' && (
              <button style={s.btnRed} onClick={next}>
                REVIEW ORDER <ChevronRight style={{ width: '16px', height: '16px' }} />
              </button>
            )}
            {step === 'confirm' && (
              <>
                <button
                  style={{ ...s.btnRed, opacity: isPaying ? 0.7 : 1, cursor: isPaying ? 'not-allowed' : 'pointer' }}
                  onClick={pay}
                  disabled={isPaying}
                >
                  {isPaying
                    ? (pollStatus === 'waiting' ? 'WAITING FOR APPROVAL…' : pollStatus === 'verifying' ? 'VERIFYING PAYMENT…' : 'PROCESSING…')
                    : method === 'card'
                      ? <><Shield style={{ width: '15px', height: '15px' }} /> PAY K{total.toLocaleString()} SECURELY</>
                      : <><Smartphone style={{ width: '15px', height: '15px' }} /> SEND K{total.toLocaleString()} PAYMENT PROMPT</>
                  }
                </button>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '10px' }}>
                  <ExternalLink style={{ width: '10px', height: '10px', color: '#4b5563' }} />
                  <span style={{ fontSize: '10px', color: '#4b5563' }}>Payments powered by Flutterwave</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
