import { useState, useEffect, CSSProperties } from 'react';
import { useNavigate } from 'react-router';
import { Package, MapPin, Phone, Mail, LogOut, ShoppingBag, RotateCcw, Truck, CheckCircle2, XCircle, Pencil } from 'lucide-react';
import { buyerApi, BuyerProfile, ShopOrder, ShopPayment, getToken, clearToken } from '../../lib/api';

const INK = '#181C12';
const RED = '#dc2626';
const RED_DARK = '#98281A';
const ORANGE = '#DE8A2A';
const PAPER = '#F0EAD6';

const STATUS_STEPS: { key: ShopOrder['status']; label: string }[] = [
  { key: 'pending', label: 'Placed' },
  { key: 'paid', label: 'Paid' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
];

function statusIndex(status: ShopOrder['status']) {
  if (status === 'cancelled') return -1;
  return STATUS_STEPS.findIndex(s => s.key === status);
}

const s = {
  page: { minHeight: '100vh', backgroundColor: ORANGE, fontFamily: 'Open Sans, sans-serif', color: INK, paddingBottom: '60px' } as CSSProperties,
  topBar: { backgroundColor: '#fff', borderBottom: '1px solid rgba(0,0,0,0.08)', padding: '16px clamp(16px,4vw,48px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' } as CSSProperties,
  wrap: { maxWidth: '900px', margin: '0 auto', padding: '28px 16px' } as CSSProperties,
  card: { background: '#fff', borderRadius: '4px', padding: '20px', marginBottom: '20px', boxShadow: '0 8px 20px -12px rgba(0,0,0,0.3)' } as CSSProperties,
  label: { fontSize: '10.5px', letterSpacing: '0.1em', color: '#6b6455', fontFamily: 'Oswald, sans-serif', display: 'block', marginBottom: '4px', textTransform: 'uppercase' } as CSSProperties,
  input: { width: '100%', boxSizing: 'border-box', padding: '9px 11px', background: '#F7F3E7', border: '1px solid #D8CDA9', color: INK, fontSize: '13.5px', outline: 'none', borderRadius: '2px', marginBottom: '10px', fontFamily: 'Open Sans, sans-serif' } as CSSProperties,
  btn: { padding: '9px 16px', border: 'none', borderRadius: '2px', fontFamily: 'Oswald, sans-serif', fontSize: '11.5px', letterSpacing: '0.06em', cursor: 'pointer' } as CSSProperties,
};

function StatusBadge({ order }: { order: ShopOrder }) {
  if (order.status === 'cancelled') {
    return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: '#6b7280', fontFamily: 'Oswald, sans-serif', fontSize: '11px' }}><XCircle style={{ width: '13px', height: '13px' }} /> CANCELLED</span>;
  }
  const idx = statusIndex(order.status);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
      {STATUS_STEPS.map((step, i) => (
        <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: i <= idx ? RED : '#D8CDA9' }} />
            <span style={{ fontSize: '10px', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em', color: i <= idx ? INK : '#9c9683' }}>{step.label}</span>
          </div>
          {i < STATUS_STEPS.length - 1 && <div style={{ width: '14px', height: '1px', background: i < idx ? RED : '#D8CDA9' }} />}
        </div>
      ))}
    </div>
  );
}

function OrderCard({ order, onReturnRequested }: { order: ShopOrder; onReturnRequested: (id: string, reason: string) => Promise<void> }) {
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');

  const canReturn = order.status === 'delivered' && !order.returnStatus;

  const submitReturn = async () => {
    if (!reason.trim()) { setErr('Please tell us why you want to return this order.'); return; }
    setSubmitting(true);
    setErr('');
    try {
      await onReturnRequested(order.id, reason.trim());
      setShowReturnForm(false);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Could not submit your return request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={s.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
        <div>
          <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', margin: '0 0 2px' }}>ORDER #{order.id.slice(-8).toUpperCase()}</p>
          <p style={{ fontSize: '11.5px', color: '#6b6455', margin: 0 }}>{new Date(order.submittedAt).toLocaleDateString('en-ZM', { day: 'numeric', month: 'short', year: 'numeric' })} · {order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
        </div>
        <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '16px', fontWeight: 700, margin: 0 }}>K{order.total.toLocaleString()}</p>
      </div>

      <div style={{ marginBottom: '12px' }}><StatusBadge order={order} /></div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: order.returnStatus || canReturn || showReturnForm ? '12px' : 0 }}>
        {order.items.map(it => (
          <span key={it.id} style={{ fontSize: '11px', background: '#F7F3E7', border: '1px solid #D8CDA9', borderRadius: '20px', padding: '4px 10px', color: '#6b6455' }}>{it.name} ×{it.qty}</span>
        ))}
      </div>

      {order.returnStatus && (
        <div style={{ background: '#F7F3E7', borderRadius: '2px', padding: '10px 12px', fontSize: '12px', color: '#6b6455' }}>
          <RotateCcw style={{ width: '12px', height: '12px', display: 'inline', marginRight: '6px', verticalAlign: '-2px' }} />
          Return {order.returnStatus === 'requested' ? 'requested — awaiting review' : order.returnStatus} {order.returnReason ? `— "${order.returnReason}"` : ''}
        </div>
      )}

      {canReturn && !showReturnForm && (
        <button style={{ ...s.btn, background: 'transparent', border: `1px solid ${RED_DARK}`, color: RED_DARK }} onClick={() => setShowReturnForm(true)}>
          REQUEST RETURN / REFUND
        </button>
      )}

      {showReturnForm && (
        <div>
          <textarea
            value={reason} onChange={e => setReason(e.target.value)}
            placeholder="Tell us what's wrong with this order…"
            style={{ ...s.input, minHeight: '70px', resize: 'vertical' }}
          />
          {err && <p style={{ color: RED, fontSize: '11.5px', margin: '0 0 8px' }}>{err}</p>}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={{ ...s.btn, background: RED, color: '#fff' }} onClick={submitReturn} disabled={submitting}>
              {submitting ? 'SENDING…' : 'SUBMIT REQUEST'}
            </button>
            <button style={{ ...s.btn, background: 'transparent', color: '#6b6455', border: '1px solid #D8CDA9' }} onClick={() => setShowReturnForm(false)}>CANCEL</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BuyerDashboard() {
  const navigate = useNavigate();
  const [buyer, setBuyer] = useState<BuyerProfile | null>(null);
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [, setPayments] = useState<ShopPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [notSignedIn, setNotSignedIn] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<BuyerProfile>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!getToken()) { setNotSignedIn(true); setLoading(false); return; }
    (async () => {
      try {
        const { buyer: me } = await buyerApi.me();
        setBuyer(me);
        setForm(me);
        const { orders: o, payments: p } = await buyerApi.myOrders();
        setOrders(o);
        setPayments(p);
      } catch {
        clearToken();
        setNotSignedIn(true);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const { buyer: updated } = await buyerApi.updateProfile(form);
      setBuyer(updated);
      setEditing(false);
    } catch {
      // silent — form stays open so they can retry
    } finally {
      setSaving(false);
    }
  };

  const signOut = () => { clearToken(); navigate('/shop'); };

  const handleReturn = async (orderId: string, reason: string) => {
    const { order: updated } = await buyerApi.requestReturn(orderId, reason);
    setOrders(prev => prev.map(o => (o.id === orderId ? updated : o)));
  };

  if (loading) {
    return <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p style={{ fontFamily: 'Oswald, sans-serif', color: '#fff' }}>Loading your account…</p></div>;
  }

  if (notSignedIn || !buyer) {
    return (
      <div style={{ ...s.page, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ background: '#fff', borderRadius: '4px', padding: '36px 28px', maxWidth: '380px' }}>
          <Package style={{ width: '32px', height: '32px', color: RED, margin: '0 auto 14px' }} />
          <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '18px', margin: '0 0 8px' }}>You're not signed in</h1>
          <p style={{ fontSize: '13px', color: '#6b6455', margin: '0 0 18px' }}>Sign in or create a buyer account from the shop to see your orders and account details.</p>
          <button style={{ ...s.btn, background: RED, color: '#fff', padding: '11px 22px' }} onClick={() => navigate('/shop')}>GO TO SHOP</button>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <div style={s.topBar}>
        <div>
          <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '10px', letterSpacing: '0.14em', color: RED, margin: '0 0 2px' }}>BOZ CAMPAIGN STORE</p>
          <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '18px', margin: 0, color: INK }}>My Account</h1>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={{ ...s.btn, background: ORANGE, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => navigate('/shop')}>
            <ShoppingBag style={{ width: '14px', height: '14px' }} /> CONTINUE SHOPPING
          </button>
          <button style={{ ...s.btn, background: 'transparent', border: '1px solid #D8CDA9', color: '#6b6455', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={signOut}>
            <LogOut style={{ width: '14px', height: '14px' }} /> SIGN OUT
          </button>
        </div>
      </div>

      <div style={s.wrap}>
        {/* Profile card */}
        <div style={s.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '15px', margin: 0 }}>Your details</h2>
            {!editing && (
              <button style={{ ...s.btn, background: 'transparent', border: '1px solid #D8CDA9', color: '#6b6455', display: 'flex', alignItems: 'center', gap: '5px' }} onClick={() => setEditing(true)}>
                <Pencil style={{ width: '12px', height: '12px' }} /> EDIT
              </button>
            )}
          </div>

          {!editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13.5px' }}>
              <p style={{ margin: 0, fontWeight: 600 }}>{buyer.name}</p>
              <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '7px', color: '#6b6455' }}><Mail style={{ width: '13px', height: '13px' }} /> {buyer.email}</p>
              <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '7px', color: '#6b6455' }}><Phone style={{ width: '13px', height: '13px' }} /> {buyer.phone}</p>
              <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '7px', color: '#6b6455' }}><MapPin style={{ width: '13px', height: '13px' }} /> {[buyer.addressLine1, buyer.addressLine2, buyer.city, buyer.province].filter(Boolean).join(', ')}</p>
            </div>
          ) : (
            <div>
              <label style={s.label}>Full name</label>
              <input style={s.input} value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} />
              <label style={s.label}>Phone</label>
              <input style={s.input} value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} />
              <label style={s.label}>Street address</label>
              <input style={s.input} value={form.addressLine1 || ''} onChange={e => setForm({ ...form, addressLine1: e.target.value })} />
              <label style={s.label}>Apartment, suite, etc.</label>
              <input style={s.input} value={form.addressLine2 || ''} onChange={e => setForm({ ...form, addressLine2: e.target.value })} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={s.label}>City</label>
                  <input style={s.input} value={form.city || ''} onChange={e => setForm({ ...form, city: e.target.value })} />
                </div>
                <div>
                  <label style={s.label}>Province</label>
                  <input style={s.input} value={form.province || ''} onChange={e => setForm({ ...form, province: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button style={{ ...s.btn, background: RED, color: '#fff' }} onClick={saveProfile} disabled={saving}>{saving ? 'SAVING…' : 'SAVE'}</button>
                <button style={{ ...s.btn, background: 'transparent', border: '1px solid #D8CDA9', color: '#6b6455' }} onClick={() => { setEditing(false); setForm(buyer); }}>CANCEL</button>
              </div>
            </div>
          )}
        </div>

        {/* Orders */}
        <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '15px', color: '#fff', margin: '4px 0 14px' }}>
          <Truck style={{ width: '15px', height: '15px', display: 'inline', marginRight: '7px', verticalAlign: '-2px' }} />
          My orders
        </h2>

        {orders.length === 0 ? (
          <div style={{ ...s.card, textAlign: 'center', padding: '36px 20px' }}>
            <CheckCircle2 style={{ width: '26px', height: '26px', color: '#D8CDA9', margin: '0 auto 10px' }} />
            <p style={{ fontSize: '13.5px', color: '#6b6455', margin: '0 0 14px' }}>You haven't placed any orders yet.</p>
            <button style={{ ...s.btn, background: RED, color: '#fff' }} onClick={() => navigate('/shop')}>BROWSE THE STORE</button>
          </div>
        ) : (
          orders.map(order => <OrderCard key={order.id} order={order} onReturnRequested={handleReturn} />)
        )}
      </div>
    </div>
  );
}
