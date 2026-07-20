import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  User, ShoppingBag, Award, FileText,
  Gift, Tag, RefreshCcw, Star, Package, Receipt,
  RotateCcw, Shield, MapPin, Lock, CheckCircle,
  Vote, Building2, Users, LayoutDashboard, Download,
  Repeat, Wallet, CreditCard
} from 'lucide-react';
import { DashboardShell, DashCard } from '../../components/DashboardShell';
import { MembershipCertSection, MembershipCardSection, AdoptionCertSection, AppointmentCertSection } from '../../components/MemberCertificates';
import { ShopCheckout, CartItem } from '../../components/ShopCheckout';
import { membershipApi, shopApi, ShopOrder, ShopPayment, ShopProduct } from '../../lib/api';

const A = '#3b82f6';
const NAVY = '#1e2d4a';

const memberData = {
  id: '',
  membershipNumber: 'BOZ-2026-482931',
  firstName: 'John',
  lastName: 'Banda',
  email: 'john.banda@example.com',
  phone: '+260 97 1234567',
  dob: '1985-04-12',
  gender: 'Male',
  nationalId: '123456/78/1',
  status: 'Active',
  tier: 'Gold',
  joinDate: '2026-01-15',
  province: 'Lusaka',
  district: 'Lusaka',
  constituency: 'Kabwata',
  ward: 'Libala',
  pollingStation: 'Libala Primary School',
  subscriptionPlan: 'Annual Membership',
  subscriptionExpiry: '2027-01-15',
  address: '15 Cairo Road, Lusaka, Zambia',
};

// ORDERS/INVOICES/PAYMENT_HISTORY are now derived from the real member's
// actual shop orders + payments (fetched in the component), not hardcoded.


// SHOP_ITEMS removed -- the shop section now fetches real products from
// the backend catalog (shopApi.listProducts) instead of a hardcoded list.

type SectionKey =
  | 'overview' | 'shop' | 'membership-status' | 'membership-card' | 'adoption-cert' | 'appointment-cert'
  | 'election-presidential' | 'election-mayoral' | 'election-mp' | 'election-councillor'
  | 'orders' | 'invoices' | 'returns' | 'reviews'
  | 'coupons' | 'credit' | 'gift-voucher'
  | 'subscription' | 'payment-history'
  | 'personal-details' | 'security' | 'address-book';

interface NavItem { key: SectionKey; label: string; icon: React.ElementType }
interface NavGroup { group: string; items: NavItem[] }

const NAV: NavGroup[] = [
  {
    group: 'MAIN',
    items: [
      { key: 'overview', label: 'Dashboard', icon: LayoutDashboard },
      { key: 'shop', label: 'Purchase from Shop', icon: ShoppingBag },
      { key: 'membership-status', label: 'Membership Status', icon: Award },
      { key: 'membership-card', label: 'Membership Card', icon: CreditCard },
      { key: 'adoption-cert', label: 'Adoption Certificate', icon: FileText },
      { key: 'appointment-cert', label: 'Appointment Certificate', icon: FileText },
    ],
  },
  {
    group: 'ELECTIONS',
    items: [
      { key: 'election-presidential', label: 'Presidential', icon: Vote },
      { key: 'election-mayoral', label: 'Mayoral', icon: Building2 },
      { key: 'election-mp', label: 'Member of Parliament', icon: Users },
      { key: 'election-councillor', label: 'Ward Councillor', icon: MapPin },
    ],
  },
  {
    group: 'ORDERS',
    items: [
      { key: 'orders', label: 'Orders', icon: Package },
      { key: 'invoices', label: 'Invoices', icon: Receipt },
      { key: 'returns', label: 'Returns', icon: RotateCcw },
      { key: 'reviews', label: 'Product Reviews', icon: Star },
    ],
  },
  {
    group: 'PAYMENTS & CREDIT',
    items: [
      { key: 'coupons', label: 'Coupons & Offers', icon: Tag },
      { key: 'credit', label: 'Credit & Refunds', icon: RefreshCcw },
      { key: 'gift-voucher', label: 'Redeem Gift Voucher', icon: Gift },
    ],
  },
  {
    group: 'MORE',
    items: [
      { key: 'subscription', label: 'Subscription Plan', icon: Repeat },
      { key: 'payment-history', label: 'Payment History', icon: Wallet },
    ],
  },
  {
    group: 'PROFILE',
    items: [
      { key: 'personal-details', label: 'Personal Details', icon: User },
      { key: 'security', label: 'Security Settings', icon: Lock },
      { key: 'address-book', label: 'Address Book', icon: MapPin },
    ],
  },
];

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Active: '#10b981', Delivered: '#10b981', Processing: '#f59e0b',
    Pending: '#f59e0b', Paid: '#10b981', Unpaid: '#ef4444', Gold: '#f59e0b',
  };
  const c = colors[status] || A;
  return (
    <span className="px-2.5 py-0.5 rounded-full text-xs" style={{ backgroundColor: `${c}18`, color: c, border: `1px solid ${c}30`, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>
      {status}
    </span>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em' }}>{label}</p>
      <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem' }}>{value}</p>
    </div>
  );
}

function ElectionSection({ title, icon: Icon, candidate, runningMate, party, slogan }: {
  title: string; icon: React.ElementType;
  candidate: string; runningMate?: string; party: string; slogan: string;
}) {
  return (
    <div className="space-y-6">
      <DashCard title={`${title} — BOZ Candidate`}>
        <div className="flex items-start gap-6 flex-wrap">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl shrink-0" style={{ backgroundColor: `${A}15`, border: `2px solid ${A}` }}>
            <Icon className="w-10 h-10" style={{ color: A }} />
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="CANDIDATE" value={candidate} />
            {runningMate && <Field label="RUNNING MATE" value={runningMate} />}
            <Field label="PARTY" value={party} />
            <Field label="CONSTITUENCY / AREA" value={memberData.constituency} />
            <div className="md:col-span-2">
              <Field label="CAMPAIGN SLOGAN" value={`"${slogan}"`} />
            </div>
          </div>
        </div>
        <div className="mt-6 flex gap-3 flex-wrap">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm" style={{ backgroundColor: A, color: '#fff', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>
            <Download className="w-4 h-4" /> Download Profile
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm" style={{ border: `1px solid ${A}`, color: A, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>
            View Campaign
          </button>
        </div>
      </DashCard>
    </div>
  );
}

export default function MemberDashboard() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<SectionKey>('overview');
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState(memberData);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [payments, setPayments] = useState<ShopPayment[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);

  // The dashboard used to always show static placeholder data ("John
  // Banda") regardless of who logged in. Replace it with the real
  // approved applicant's own record, resolved server-side from their
  // session (not a URL param — a member can only ever see their own
  // profile this way).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { member } = await membershipApi.getMyProfile();
        if (cancelled) return;
        const STATUS_LABELS: Record<string, string> = { approved: 'Active', pending: 'Pending', rejected: 'Rejected' };
        setProfile(p => ({
          ...p,
          id: member.id,
          membershipNumber: member.membershipNumber || 'Pending approval',
          firstName: member.firstName || '',
          lastName: member.lastName || '',
          email: member.email || '',
          phone: member.phone || '',
          dob: member.dob || '',
          gender: member.gender || '',
          nationalId: member.nationalId || '',
          status: STATUS_LABELS[member.status] || member.status || 'Pending',
          tier: member.tier ? member.tier.charAt(0).toUpperCase() + member.tier.slice(1) : 'Standard',
          joinDate: (member.joinDate || '').slice(0, 10) || p.joinDate,
          province: member.province || '',
          district: member.district || '',
          constituency: member.constituency || '',
          ward: member.ward || '',
          pollingStation: member.pollingStation || '',
          address: member.address || '',
        }));
      } catch (e) {
        if (!cancelled) setProfileError(e instanceof Error ? e.message : 'Failed to load your membership profile');
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { orders: o, payments: p } = await shopApi.myOrders();
        if (!cancelled) { setOrders(o); setPayments(p); }
      } catch {
        // No orders yet, or not a member account — leave empty, not fatal.
      } finally {
        if (!cancelled) setOrdersLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { products: p } = await shopApi.listProducts();
        if (!cancelled) setProducts(p);
      } catch {
        // Shop temporarily unavailable — leave empty, not fatal.
      } finally {
        if (!cancelled) setProductsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Real product images are only served when an admin has uploaded one
  // (404 otherwise) — fall back to a plain placeholder graphic rather
  // than a broken <img>.
  const PLACEHOLDER_IMG = 'data:image/svg+xml,' + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#e5e7eb"/><text x="100" y="105" font-family="sans-serif" font-size="14" fill="#9ca3af" text-anchor="middle">No image</text></svg>`
  );
  const productImgSrc = (p: ShopProduct) => p.hasCustomImage ? shopApi.productImageUrl(p.id) : PLACEHOLDER_IMG;

  // CartItem.id (shared with the public shop's checkout) is numeric; real
  // product ids are strings (prod_xxx), so map each product's position in
  // the fetched list to a stable numeric surrogate for cart purposes only.
  const addToCart = (product: ShopProduct, index: number) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === index);
      if (existing) return prev.map(i => i.id === index ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { id: index, name: product.name, price: product.price, priceNum: product.priceNum, img: productImgSrc(product), tag: product.category, qty: 1 }];
    });
  };
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const fmtK = (n: number) => `K ${n.toLocaleString()}`;
  const orderItemSummary = (o: ShopOrder) => o.items.map(it => `${it.name}${it.qty > 1 ? ` x${it.qty}` : ''}`).join(', ') || 'Order';
  const ORDER_STATUS_LABELS: Record<string, string> = { pending: 'Pending', paid: 'Paid', processing: 'Processing', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled' };
  const METHOD_LABELS: Record<string, string> = { card: 'Card', airtel: 'Mobile Money (Airtel)', zamtel: 'Mobile Money (Zamtel)', mtn: 'Mobile Money (MTN)' };

  const displayOrders = useMemo(() => orders.map(o => ({
    id: o.id, item: orderItemSummary(o), date: o.submittedAt.slice(0, 10),
    status: ORDER_STATUS_LABELS[o.status] || o.status, amount: fmtK(o.total),
  })), [orders]);

  const displayInvoices = useMemo(() => orders.map(o => ({
    id: `INV-${o.id.replace(/^order_/, '').toUpperCase()}`, desc: orderItemSummary(o),
    date: o.submittedAt.slice(0, 10), amount: fmtK(o.total),
    paid: o.status !== 'pending' && o.status !== 'cancelled',
  })), [orders]);

  const displayPayments = useMemo(() => {
    const orderById = new Map(orders.map(o => [o.id, o]));
    return payments.filter(p => p.status === 'confirmed').map(p => ({
      date: (p.confirmedAt || p.initiatedAt).slice(0, 10),
      desc: orderById.has(p.orderId) ? orderItemSummary(orderById.get(p.orderId)!) : `Order ${p.orderId}`,
      method: METHOD_LABELS[p.method] || p.method,
      amount: fmtK(p.amount),
    }));
  }, [orders, payments]);

  const navTo = (key: SectionKey) => { setActiveSection(key); };

  const renderSection = () => {
    switch (activeSection) {

      case 'overview':
        return (
          <div className="space-y-5">
            {profileLoading && (
              <div style={{ padding: '10px 16px', borderRadius: '8px', background: '#eff6ff', color: '#1d4ed8', fontSize: '0.85rem' }}>
                Loading your membership profile…
              </div>
            )}
            {!profileLoading && profileError && (
              <div style={{ padding: '10px 16px', borderRadius: '8px', background: '#fef2f2', color: '#b91c1c', fontSize: '0.85rem' }}>
                Couldn't load your membership profile ({profileError}). Showing placeholder data below.
              </div>
            )}
            {/* Welcome banner */}
            <div
              className="rounded-2xl p-7"
              style={{
                background: `linear-gradient(135deg, ${A}30 0%, #1e40af20 100%)`,
                border: `1px solid ${A}25`,
              }}
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '0.7rem', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.45)', marginBottom: 8 }}>WELCOME BACK</p>
                  <h2 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.8rem', letterSpacing: '0.03em', color: '#fff' }}>{profile.firstName} {profile.lastName}</h2>
                  <p className="mt-1" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>{profile.subscriptionPlan} · Expires {profile.subscriptionExpiry}</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: `${A}20`, border: `2px solid ${A}40` }}>
                    <Award className="w-8 h-8" style={{ color: A }} />
                  </div>
                  <StatusBadge status={profile.tier} />
                </div>
              </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'MEMBERSHIP', value: profile.status, color: '#10b981' },
                { label: 'MEMBER NO.', value: profile.membershipNumber, color: A },
                { label: 'ORDERS', value: String(orders.length), color: '#f59e0b' },
                { label: 'WARD', value: profile.ward, color: '#8b5cf6' },
              ].map(s => (
                <div key={s.label} className="rounded-2xl p-4" style={{ backgroundColor: '#123322', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '0.65rem', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.35)', marginBottom: 6 }}>{s.label}</p>
                  <p style={{ color: s.color, fontFamily: 'Oswald, sans-serif', fontSize: '0.85rem', letterSpacing: '0.04em' }}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Quick links */}
            <DashCard title="QUICK ACTIONS">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Shop', key: 'shop' as SectionKey, icon: ShoppingBag },
                  { label: 'My Orders', key: 'orders' as SectionKey, icon: Package },
                  { label: 'Membership', key: 'membership-status' as SectionKey, icon: Award },
                  { label: 'Certificate', key: 'adoption-cert' as SectionKey, icon: FileText },
                  { label: 'Appointment', key: 'appointment-cert' as SectionKey, icon: FileText },
                  { label: 'Invoices', key: 'invoices' as SectionKey, icon: Receipt },
                  { label: 'Payment History', key: 'payment-history' as SectionKey, icon: Wallet },
                  { label: 'Subscription', key: 'subscription' as SectionKey, icon: Repeat },
                  { label: 'Profile', key: 'personal-details' as SectionKey, icon: User },
                ].map(a => (
                  <button key={a.key} onClick={() => navTo(a.key)}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all text-center"
                    style={{ border: `1px solid rgba(255,255,255,0.07)`, color: 'rgba(255,255,255,0.5)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = `${A}10`; (e.currentTarget as HTMLElement).style.color = A; (e.currentTarget as HTMLElement).style.borderColor = `${A}30`; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'; }}
                  >
                    <a.icon className="w-5 h-5" />
                    <span className="text-xs" style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>{a.label}</span>
                  </button>
                ))}
              </div>
            </DashCard>
          </div>
        );

      case 'shop':
        return (
          <DashCard title="PURCHASE FROM SHOP">
            {cartCount > 0 && (
              <div className="flex items-center justify-between p-4 rounded-xl mb-5" style={{ backgroundColor: `${A}12`, border: `1px solid ${A}30` }}>
                <span style={{ color: NAVY, fontFamily: 'Oswald, sans-serif', fontSize: '0.9rem' }}>
                  {cartCount} item{cartCount > 1 ? 's' : ''} in cart · K{cart.reduce((s, i) => s + i.priceNum * i.qty, 0).toLocaleString()}
                </span>
                <button onClick={() => setShowCheckout(true)}
                  className="px-5 py-2 rounded-lg text-sm" style={{ backgroundColor: A, color: '#fff', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>
                  VIEW CART & CHECKOUT
                </button>
              </div>
            )}
            {productsLoading ? (
              <p className="text-sm py-8 text-center" style={{ color: 'rgba(255,255,255,0.4)' }}>Loading shop…</p>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 mx-auto mb-4" style={{ color: '#e5e7eb' }} />
                <p style={{ color: '#9ca3af' }}>Nothing in the shop right now — check back soon.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product, index) => {
                  const inCartQty = cart.find(i => i.id === index)?.qty || 0;
                  const outOfStock = !product.inStock || (product.stockQty != null && product.stockQty <= 0);
                  return (
                    <div key={product.id} className="rounded-xl p-5 border flex flex-col gap-3" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                      <img src={productImgSrc(product)} alt={product.name} className="w-full rounded-lg" style={{ height: '140px', objectFit: 'cover', backgroundColor: '#f3f4f6' }} />
                      <div>
                        <h4 style={{ color: NAVY, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em' }}>{product.name}</h4>
                        {product.description && <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{product.description}</p>}
                        <div className="flex items-center justify-between mt-2">
                          <span style={{ color: A, fontFamily: 'Oswald, sans-serif', fontSize: '1.1rem' }}>{product.price}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{
                            backgroundColor: outOfStock ? '#fee2e2' : (product.stockQty != null && product.stockQty <= 5) ? '#fef3c7' : '#d1fae5',
                            color: outOfStock ? '#991b1b' : (product.stockQty != null && product.stockQty <= 5) ? '#92400e' : '#065f46',
                          }}>
                            {outOfStock ? 'Out of Stock' : product.stockQty != null ? `${product.stockQty} left` : 'In Stock'}
                          </span>
                        </div>
                      </div>
                      <button onClick={() => addToCart(product, index)} disabled={outOfStock}
                        className="w-full py-2 rounded-lg text-sm mt-auto" style={{ backgroundColor: outOfStock ? '#9ca3af' : A, color: '#fff', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em', cursor: outOfStock ? 'not-allowed' : 'pointer' }}>
                        {inCartQty > 0 ? `IN CART (${inCartQty}) · ADD ANOTHER` : 'ADD TO CART'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            {showCheckout && (
              <ShopCheckout
                cart={cart}
                onClose={() => setShowCheckout(false)}
                onUpdateQty={(id, qty) => setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i))}
                onRemove={(id) => setCart(prev => prev.filter(i => i.id !== id))}
              />
            )}
          </DashCard>
        );

      case 'membership-status':
        return (
          <DashCard title="MEMBERSHIP STATUS">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-xl p-6 text-center" style={{ background: `linear-gradient(135deg, ${A}15, #1e40af15)`, border: `1px solid ${A}30` }}>
                <Award className="w-16 h-16 mx-auto mb-3" style={{ color: A }} />
                <h4 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.5rem', color: NAVY, letterSpacing: '0.04em' }}>{profile.tier} MEMBER</h4>
                <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>Member since {new Date(profile.joinDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <div className="mt-4"><StatusBadge status={profile.status} /></div>
              </div>
              <div className="space-y-4">
                <Field label="MEMBERSHIP NUMBER" value={profile.membershipNumber} />
                <Field label="STATUS" value={profile.status} />
                <Field label="TIER" value={profile.tier} />
                <Field label="SUBSCRIPTION PLAN" value={profile.subscriptionPlan} />
                <Field label="EXPIRY DATE" value={profile.subscriptionExpiry} />
              </div>
            </div>
            <div className="mt-6 p-4 rounded-xl" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <h5 style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em', color: NAVY, marginBottom: '12px' }}>MEMBERSHIP BENEFITS</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {['Voting rights in party primaries', 'Access to party events & rallies', 'BOZ merchandise discounts (20%)', 'Adoption certificate', 'Direct line to ward representative', 'Monthly policy newsletter'].map(b => (
                  <div key={b} className="flex items-center gap-2 text-sm" style={{ color: '#4b5563' }}>
                    <CheckCircle className="w-4 h-4 shrink-0" style={{ color: '#10b981' }} /> {b}
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6">
              <MembershipCertSection member={profile} />
            </div>
          </DashCard>
        );

      case 'membership-card':
        return (
          <DashCard title="MEMBERSHIP CARD">
            <MembershipCardSection member={profile} />
          </DashCard>
        );

      case 'adoption-cert':
        return (
          <DashCard title="ADOPTION CERTIFICATE">
            <AdoptionCertSection member={profile} />
          </DashCard>
        );

      case 'appointment-cert':
        return (
          <DashCard title="APPOINTMENT CERTIFICATE">
            <AppointmentCertSection member={profile} />
          </DashCard>
        );

      case 'election-presidential':
        return <ElectionSection title="Presidential" icon={Vote} candidate="Vincent Kafula" runningMate="Hon. Tasila Lungu Mwansa" party="Build One Zambia" slogan="Unity · Prosperity · Progress" />;

      case 'election-mayoral':
        return <ElectionSection title="Mayoral" icon={Building2} candidate="BOZ Mayoral Candidate" party="Build One Zambia" slogan="Building Communities, One Ward at a Time" />;

      case 'election-mp':
        return <ElectionSection title="Member of Parliament" icon={Users} candidate="BOZ Parliamentary Candidate" party="Build One Zambia" slogan="Your Voice in the National Assembly" />;

      case 'election-councillor':
        return <ElectionSection title="Ward Councillor" icon={MapPin} candidate="BOZ Ward Councillor Candidate" party="Build One Zambia" slogan="Serving Every Household in Our Ward" />;

      case 'orders':
        return (
          <DashCard title="MY ORDERS">
            {ordersLoading ? (
              <p className="text-sm py-8 text-center" style={{ color: 'rgba(255,255,255,0.4)' }}>Loading your orders…</p>
            ) : displayOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 mx-auto mb-4" style={{ color: '#e5e7eb' }} />
                <p style={{ color: '#9ca3af' }}>No orders yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                      {['Order ID', 'Item', 'Date', 'Status', 'Amount'].map(h => (
                        <th key={h} className="py-3 px-4 text-left" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em', fontSize: '11px' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {displayOrders.map(o => (
                      <tr key={o.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td className="py-3 px-4" style={{ color: A, fontFamily: 'Oswald, sans-serif' }}>{o.id}</td>
                        <td className="py-3 px-4" style={{ color: 'rgba(255,255,255,0.85)' }}>{o.item}</td>
                        <td className="py-3 px-4" style={{ color: 'rgba(255,255,255,0.45)' }}>{o.date}</td>
                        <td className="py-3 px-4"><StatusBadge status={o.status} /></td>
                        <td className="py-3 px-4" style={{ color: NAVY, fontFamily: 'Oswald, sans-serif' }}>{o.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </DashCard>
        );

      case 'invoices':
        return (
          <DashCard title="INVOICES">
            {displayInvoices.length === 0 ? (
              <div className="text-center py-12">
                <Receipt className="w-16 h-16 mx-auto mb-4" style={{ color: '#e5e7eb' }} />
                <p style={{ color: '#9ca3af' }}>No invoices yet</p>
              </div>
            ) : (
            <div className="space-y-3">
              {displayInvoices.map(inv => (
                <div key={inv.id} className="flex items-center justify-between p-4 rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center gap-4">
                    <Receipt className="w-8 h-8" style={{ color: A }} />
                    <div>
                      <p style={{ color: NAVY, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em', fontSize: '0.9rem' }}>{inv.id}</p>
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{inv.desc} · {inv.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span style={{ color: NAVY, fontFamily: 'Oswald, sans-serif' }}>{inv.amount}</span>
                    <StatusBadge status={inv.paid ? 'Paid' : 'Unpaid'} />
                    <button className="p-1 rounded" style={{ color: A }}><Download className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>
            )}
          </DashCard>
        );

      case 'returns':
        return (
          <DashCard title="RETURNS">
            <div className="text-center py-12">
              <RotateCcw className="w-16 h-16 mx-auto mb-4" style={{ color: '#e5e7eb' }} />
              <p style={{ color: '#9ca3af' }}>No returns on record</p>
              <p className="text-sm mt-2" style={{ color: '#9ca3af' }}>Items can be returned within 7 days of delivery</p>
              <button className="mt-6 px-6 py-3 rounded-lg text-sm" style={{ border: `1px solid ${A}`, color: A, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>
                REQUEST A RETURN
              </button>
            </div>
          </DashCard>
        );

      case 'reviews':
        return (
          <DashCard title="PRODUCT REVIEWS">
            {displayOrders.filter(o => o.status === 'Delivered').length === 0 ? (
              <div className="text-center py-12">
                <Star className="w-16 h-16 mx-auto mb-4" style={{ color: '#e5e7eb' }} />
                <p style={{ color: '#9ca3af' }}>No delivered orders to review yet</p>
              </div>
            ) : (
            <div className="space-y-4">
              {displayOrders.filter(o => o.status === 'Delivered').map(o => (
                <div key={o.id} className="p-4 rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <p style={{ color: NAVY, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em', fontSize: '0.9rem' }}>{o.item}</p>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4" style={{ color: s <= 4 ? '#f59e0b' : '#e5e7eb', fill: s <= 4 ? '#f59e0b' : 'transparent' }} />)}
                    </div>
                  </div>
                  <textarea className="w-full p-3 rounded-lg text-sm resize-none" rows={2} placeholder="Write your review..." style={{ border: '1px solid #e5e7eb', color: '#4b5563' }} />
                  <button className="mt-2 px-4 py-2 rounded-lg text-sm" style={{ backgroundColor: A, color: '#fff', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>SUBMIT REVIEW</button>
                </div>
              ))}
            </div>
            )}
          </DashCard>
        );

      case 'coupons':
        return (
          <DashCard title="COUPONS & OFFERS">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { code: 'BOZ20', desc: '20% off merchandise', expiry: '2026-12-31', used: false },
                { code: 'WELCOME10', desc: 'K10 off first order', expiry: '2026-06-30', used: true },
              ].map(c => (
                <div key={c.code} className="rounded-xl p-5" style={{ border: `2px dashed ${c.used ? '#e5e7eb' : A}`, opacity: c.used ? 0.6 : 1 }}>
                  <div className="flex items-center gap-3 mb-3">
                    <Tag className="w-8 h-8" style={{ color: c.used ? '#9ca3af' : A }} />
                    <div>
                      <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.2rem', letterSpacing: '0.08em', color: c.used ? '#9ca3af' : NAVY }}>{c.code}</p>
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{c.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: '#9ca3af' }}>Expires: {c.expiry}</span>
                    {c.used ? <span className="text-xs" style={{ color: '#9ca3af' }}>Used</span> : <button className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: A, color: '#fff' }}>APPLY</button>}
                  </div>
                </div>
              ))}
            </div>
          </DashCard>
        );

      case 'credit':
        return (
          <DashCard title="CREDIT & REFUNDS">
            <div className="rounded-xl p-6 mb-6 text-center" style={{ background: `linear-gradient(135deg, ${A}10, #1e40af10)`, border: `1px solid ${A}30` }}>
              <p className="text-sm mb-1" style={{ color: '#6b7280', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>AVAILABLE CREDIT</p>
              <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '2.5rem', color: A }}>K 0.00</p>
            </div>
            <p className="text-sm text-center" style={{ color: '#9ca3af' }}>No pending refunds. Contact support if you believe a refund is owed.</p>
          </DashCard>
        );

      case 'gift-voucher':
        return (
          <DashCard title="REDEEM GIFT VOUCHER">
            <div className="max-w-md mx-auto text-center">
              <Gift className="w-16 h-16 mx-auto mb-4" style={{ color: A }} />
              <p className="mb-6" style={{ color: 'rgba(255,255,255,0.45)' }}>Enter your gift voucher code below to redeem your gift.</p>
              <input className="w-full p-3 rounded-xl mb-4 text-center" style={{ border: `1px solid ${A}40`, fontSize: '1.1rem', letterSpacing: '0.15em', color: NAVY }} placeholder="XXXX-XXXX-XXXX" />
              <button className="w-full py-3 rounded-xl" style={{ backgroundColor: A, color: '#fff', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.1em' }}>REDEEM VOUCHER</button>
            </div>
          </DashCard>
        );

      case 'subscription':
        return (
          <DashCard title="SUBSCRIPTION PLAN">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                { name: 'Basic', price: 'K 200', period: '/year', features: ['Voting rights', 'Party newsletters', 'Event access'], current: false },
                { name: 'Annual', price: 'K 500', period: '/year', features: ['All Basic benefits', 'Adoption certificate', '20% shop discount', 'Priority support'], current: true },
                { name: 'Lifetime', price: 'K 2,000', period: 'one-time', features: ['All Annual benefits', 'Lifetime membership card', 'VIP event access', 'Gold tier status'], current: false },
              ].map(plan => (
                <div key={plan.name} className="rounded-xl p-5" style={{ border: `2px solid ${plan.current ? A : '#e5e7eb'}`, backgroundColor: plan.current ? `${A}05` : '#fff' }}>
                  {plan.current && <span className="text-xs px-2 py-0.5 rounded-full mb-3 inline-block" style={{ backgroundColor: A, color: '#fff', fontFamily: 'Oswald, sans-serif' }}>CURRENT PLAN</span>}
                  <h4 style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.1rem', color: NAVY, letterSpacing: '0.04em' }}>{plan.name}</h4>
                  <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.8rem', color: plan.current ? A : NAVY }}>{plan.price}<span className="text-xs" style={{ color: '#9ca3af' }}>{plan.period}</span></p>
                  <div className="mt-3 space-y-2">
                    {plan.features.map(f => <div key={f} className="flex items-center gap-2 text-xs" style={{ color: '#4b5563' }}><CheckCircle className="w-3.5 h-3.5 shrink-0" style={{ color: '#10b981' }} />{f}</div>)}
                  </div>
                  {!plan.current && <button className="w-full mt-4 py-2 rounded-lg text-sm" style={{ border: `1px solid ${A}`, color: A, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>UPGRADE</button>}
                </div>
              ))}
            </div>
          </DashCard>
        );

      case 'payment-history':
        return (
          <DashCard title="PAYMENT HISTORY">
            {displayPayments.length === 0 ? (
              <div className="text-center py-12">
                <Wallet className="w-16 h-16 mx-auto mb-4" style={{ color: '#e5e7eb' }} />
                <p style={{ color: '#9ca3af' }}>No payments on record yet</p>
              </div>
            ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    {['Date', 'Description', 'Method', 'Amount'].map(h => (
                      <th key={h} className="py-3 px-4 text-left" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em', fontSize: '11px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayPayments.map((p, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td className="py-3 px-4" style={{ color: 'rgba(255,255,255,0.45)' }}>{p.date}</td>
                      <td className="py-3 px-4" style={{ color: 'rgba(255,255,255,0.85)' }}>{p.desc}</td>
                      <td className="py-3 px-4" style={{ color: 'rgba(255,255,255,0.45)' }}>{p.method}</td>
                      <td className="py-3 px-4" style={{ color: '#10b981', fontFamily: 'Oswald, sans-serif' }}>{p.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}
          </DashCard>
        );

      case 'personal-details':
        return (
          <DashCard title="PERSONAL DETAILS">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>Manage your personal information</p>
              <button onClick={() => setEditMode(!editMode)} className="px-4 py-2 rounded-lg text-sm" style={{ backgroundColor: editMode ? '#f0f0f0' : A, color: editMode ? NAVY : '#fff', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>
                {editMode ? 'CANCEL' : 'EDIT PROFILE'}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { label: 'FIRST NAME', key: 'firstName' },
                { label: 'LAST NAME', key: 'lastName' },
                { label: 'EMAIL ADDRESS', key: 'email' },
                { label: 'PHONE NUMBER', key: 'phone' },
                { label: 'DATE OF BIRTH', key: 'dob' },
                { label: 'GENDER', key: 'gender' },
                { label: 'NATIONAL ID', key: 'nationalId' },
                { label: 'PROVINCE', key: 'province' },
                { label: 'DISTRICT', key: 'district' },
                { label: 'CONSTITUENCY', key: 'constituency' },
                { label: 'WARD', key: 'ward' },
                { label: 'POLLING STATION', key: 'pollingStation' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs mb-1" style={{ color: '#9ca3af', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em' }}>{f.label}</label>
                  {editMode
                    ? <input className="w-full p-3 rounded-lg text-sm" style={{ border: `1px solid ${A}40`, color: NAVY }} value={(profile as Record<string, string>)[f.key]} onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))} />
                    : <p style={{ color: NAVY, fontSize: '0.95rem', padding: '4px 0' }}>{(profile as Record<string, string>)[f.key]}</p>
                  }
                </div>
              ))}
            </div>
            {editMode && (
              <div className="mt-6 flex gap-3">
                <button onClick={() => setEditMode(false)} className="px-6 py-3 rounded-lg" style={{ backgroundColor: A, color: '#fff', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>SAVE CHANGES</button>
                <button onClick={() => setEditMode(false)} className="px-6 py-3 rounded-lg" style={{ border: '1px solid #e5e7eb', color: '#6b7280' }}>CANCEL</button>
              </div>
            )}
          </DashCard>
        );

      case 'security':
        return (
          <DashCard title="SECURITY SETTINGS">
            <div className="max-w-lg space-y-5">
              <div>
                <label className="block text-xs mb-1" style={{ color: '#9ca3af', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em' }}>CURRENT PASSWORD</label>
                <input type="password" className="w-full p-3 rounded-lg text-sm" style={{ border: `1px solid #e5e7eb`, color: NAVY }} placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: '#9ca3af', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em' }}>NEW PASSWORD</label>
                <input type="password" className="w-full p-3 rounded-lg text-sm" style={{ border: `1px solid #e5e7eb`, color: NAVY }} placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: '#9ca3af', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em' }}>CONFIRM NEW PASSWORD</label>
                <input type="password" className="w-full p-3 rounded-lg text-sm" style={{ border: `1px solid #e5e7eb`, color: NAVY }} placeholder="••••••••" />
              </div>
              <button className="px-6 py-3 rounded-lg" style={{ backgroundColor: A, color: '#fff', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>UPDATE PASSWORD</button>

              <div className="pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                <h4 className="mb-3" style={{ fontFamily: 'Oswald, sans-serif', color: NAVY, letterSpacing: '0.04em' }}>TWO-FACTOR AUTHENTICATION</h4>
                <div className="flex items-center justify-between p-4 rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6" style={{ color: '#10b981' }} />
                    <div>
                      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.85)' }}>SMS Authentication</p>
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>+260 97 ****567</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#d1fae5', color: '#065f46' }}>Enabled</span>
                </div>
              </div>
            </div>
          </DashCard>
        );

      case 'address-book':
        return (
          <DashCard title="ADDRESS BOOK">
            <div className="space-y-4">
              <div className="p-4 rounded-xl" style={{ border: `2px solid ${A}`, backgroundColor: `${A}05` }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: A, color: '#fff', fontFamily: 'Oswald, sans-serif' }}>DEFAULT</span>
                  <button className="text-xs" style={{ color: A }}>Edit</button>
                </div>
                <p style={{ color: NAVY, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em' }}>{profile.firstName} {profile.lastName}</p>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>{profile.address}</p>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>{profile.ward}, {profile.constituency}, {profile.district}</p>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>{profile.province}, Zambia</p>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>{profile.phone}</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm" style={{ border: `1px dashed ${A}`, color: A, fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em' }}>
                + ADD NEW ADDRESS
              </button>
            </div>
          </DashCard>
        );

      default: return null;
    }
  };

  const navGroupsForShell = NAV.map(g => ({
    group: g.group,
    items: g.items.map(item => ({
      key: item.key,
      label: item.label,
      icon: <item.icon className="w-4 h-4" />,
    })),
  }));

  return (
    <DashboardShell
      accentColor={A}
      title="Member Portal"
      subtitle="BUILD ONE ZAMBIA"
      user={{ name: `${profile.firstName} ${profile.lastName}`, role: `${profile.tier} Member · ${profile.membershipNumber}` }}
      navGroups={navGroupsForShell}
      activeSection={activeSection}
      onNavigate={(key) => navTo(key as SectionKey)}
      notifications={1}
    >
      {renderSection()}
    </DashboardShell>
  );
}
