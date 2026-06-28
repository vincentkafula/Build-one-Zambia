/**
 * Shop Module — Products, Payments, Orders, Stats
 */

import { kv } from './db.js';
import { randomUUID } from 'crypto';

function pid() { return `prod_${Date.now().toString(36)}_${randomUUID().slice(0, 6)}`; }
function payId() { return `pay_${Date.now().toString(36)}_${randomUUID().slice(0, 6)}`; }
function ordId() { return `order_${Date.now().toString(36)}_${randomUUID().slice(0, 6)}`; }

function getProductIndex() { return kv.get('boz:shop:products:index') || []; }
function setProductIndex(ids) { kv.set('boz:shop:products:index', ids); }

function getOrderIndex() { return kv.get('boz:shop:orders:index') || []; }
function setOrderIndex(ids) { kv.set('boz:shop:orders:index', ids); }

function getPaymentIndex() { return kv.get('boz:shop:payments:index') || []; }
function setPaymentIndex(refs) { kv.set('boz:shop:payments:index', refs); }

// ─── Products ────────────────────────────────────────────────────────────────

export function listProducts(filters = {}) {
  let products = getProductIndex()
    .map(id => kv.get(`boz:shop:product:${id}`))
    .filter(Boolean);

  if (!filters.includeInactive) products = products.filter(p => p.active !== false);
  if (filters.category) products = products.filter(p => p.category === filters.category);
  if (filters.featured) products = products.filter(p => p.featured === true);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    products = products.filter(p =>
      p.name.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q)
    );
  }

  return products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export function getProduct(id) { return kv.get(`boz:shop:product:${id}`); }
export function getProductImage(id) { return kv.get(`boz:shop:product-image:${id}`); }

export function createProduct(input) {
  const id = pid();
  const now = new Date().toISOString();
  const priceNum = Number(input.priceNum ?? input.price) || 0;
  const product = {
    id,
    name: (input.name || '').trim(),
    description: input.description || '',
    price: input.price != null ? String(input.price) : priceNum.toFixed(2),
    priceNum,
    category: input.category || 'APPAREL',
    hasCustomImage: false,
    inStock: input.inStock !== false,
    stockQty: input.stockQty ?? null,
    tags: Array.isArray(input.tags) ? input.tags : [],
    active: true,
    featured: !!input.featured,
    createdAt: now,
    updatedAt: now,
  };

  kv.set(`boz:shop:product:${id}`, product);

  if (input.imageDataUrl) {
    kv.set(`boz:shop:product-image:${id}`, input.imageDataUrl);
    product.hasCustomImage = true;
    kv.set(`boz:shop:product:${id}`, product);
  }

  setProductIndex([id, ...getProductIndex()]);
  return product;
}

export function updateProduct(id, input) {
  const p = getProduct(id);
  if (!p) return null;
  const patch = { ...input };
  if (input.priceNum != null || input.price != null) {
    const priceNum = Number(input.priceNum ?? input.price) || p.priceNum;
    patch.priceNum = priceNum;
    patch.price = input.price != null ? String(input.price) : priceNum.toFixed(2);
  }
  delete patch.imageDataUrl;
  const updated = { ...p, ...patch, updatedAt: new Date().toISOString() };
  kv.set(`boz:shop:product:${id}`, updated);

  if (input.imageDataUrl) {
    kv.set(`boz:shop:product-image:${id}`, input.imageDataUrl);
    updated.hasCustomImage = true;
    kv.set(`boz:shop:product:${id}`, updated);
  }

  return updated;
}

export function deleteProduct(id) {
  const p = getProduct(id);
  if (!p) return false;
  kv.set(`boz:shop:product:${id}`, { ...p, active: false, updatedAt: new Date().toISOString() });
  return true;
}

export function restoreProduct(id) {
  const p = getProduct(id);
  if (!p) return null;
  const updated = { ...p, active: true, updatedAt: new Date().toISOString() };
  kv.set(`boz:shop:product:${id}`, updated);
  return updated;
}

const SEED_PRODUCTS = [
  { name: 'Build One Zambia T-Shirt', description: 'Official cotton t-shirt with BOZ logo.', priceNum: 150, category: 'APPAREL' },
  { name: 'BOZ Cap', description: 'Embroidered cap.', priceNum: 100, category: 'APPAREL' },
  { name: 'BOZ Tote Bag', description: 'Durable canvas tote bag.', priceNum: 80, category: 'BAGS' },
  { name: 'BOZ Sticker Pack', description: 'Set of 5 vinyl stickers.', priceNum: 25, category: 'STICKERS' },
  { name: 'BOZ Mug', description: 'Ceramic mug with party branding.', priceNum: 60, category: 'HOMEWARE' },
];

export function seedProducts() {
  const existingNames = new Set(getProductIndex().map(id => kv.get(`boz:shop:product:${id}`)?.name));
  let seeded = 0, skipped = 0;
  for (const s of SEED_PRODUCTS) {
    if (existingNames.has(s.name)) { skipped++; continue; }
    createProduct(s);
    seeded++;
  }
  return { seeded, skipped };
}

// ─── Payments ────────────────────────────────────────────────────────────────

export function initiatePayment(input) {
  const ref = payId();
  const now = new Date().toISOString();
  const payment = {
    id: ref,
    orderId: input.orderId,
    method: input.method,
    amount: Number(input.amount) || 0,
    phone: input.phone,
    cardLast4: input.cardLast4,
    paymentRef: ref,
    status: 'pending',
    initiatedAt: now,
  };
  kv.set(`boz:shop:payment:${ref}`, payment);
  setPaymentIndex([ref, ...getPaymentIndex()]);
  return payment;
}

export function getPayment(ref) { return kv.get(`boz:shop:payment:${ref}`); }

export function confirmPayment(ref, gatewayRef) {
  const p = getPayment(ref);
  if (!p) return null;
  const updated = { ...p, status: 'confirmed', confirmedAt: new Date().toISOString(), gatewayRef };
  kv.set(`boz:shop:payment:${ref}`, updated);

  if (p.orderId) {
    const order = getOrder(p.orderId);
    if (order) updateOrder(p.orderId, { status: 'paid', paymentRef: ref });
  }

  return updated;
}

export function failPayment(ref, reason) {
  const p = getPayment(ref);
  if (!p) return null;
  const updated = { ...p, status: 'failed', failedAt: new Date().toISOString(), failReason: reason };
  kv.set(`boz:shop:payment:${ref}`, updated);
  return updated;
}

export function listPayments(filters = {}) {
  let payments = getPaymentIndex().map(ref => kv.get(`boz:shop:payment:${ref}`)).filter(Boolean);
  if (filters.status) payments = payments.filter(p => p.status === filters.status);
  if (filters.method) payments = payments.filter(p => p.method === filters.method);
  return payments.sort((a, b) => new Date(b.initiatedAt) - new Date(a.initiatedAt));
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export function createOrder(input) {
  const id = ordId();
  const now = new Date().toISOString();
  const items = Array.isArray(input.items) ? input.items : [];
  const total = items.reduce((sum, it) => sum + (Number(it.priceNum) || 0) * (Number(it.qty) || 1), 0);

  const order = {
    id,
    items,
    total: input.total != null ? Number(input.total) : total,
    customerName: input.customerName || '',
    customerEmail: input.customerEmail || '',
    customerPhone: input.customerPhone || '',
    deliveryAddress: input.deliveryAddress,
    paymentMethod: input.paymentMethod || 'card',
    paymentRef: input.paymentRef,
    status: 'pending',
    notes: input.notes,
    submittedAt: now,
    updatedAt: now,
  };

  kv.set(`boz:shop:order:${id}`, order);
  setOrderIndex([id, ...getOrderIndex()]);
  return order;
}

export function getOrder(id) { return kv.get(`boz:shop:order:${id}`); }

export function updateOrder(id, input) {
  const o = getOrder(id);
  if (!o) return null;
  const updated = { ...o, ...input, updatedAt: new Date().toISOString() };
  kv.set(`boz:shop:order:${id}`, updated);
  return updated;
}

export function updateOrderStatus(id, status, paymentRef) {
  return updateOrder(id, { status, ...(paymentRef ? { paymentRef } : {}) });
}

export function listOrders(filters = {}) {
  let orders = getOrderIndex().map(id => kv.get(`boz:shop:order:${id}`)).filter(Boolean);
  if (filters.status) orders = orders.filter(o => o.status === filters.status);
  return orders.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
}

// ─── Stats ───────────────────────────────────────────────────────────────────

export function getStats() {
  const orders = getOrderIndex().map(id => kv.get(`boz:shop:order:${id}`)).filter(Boolean);
  const payments = getPaymentIndex().map(ref => kv.get(`boz:shop:payment:${ref}`)).filter(Boolean);
  const products = getProductIndex().map(id => kv.get(`boz:shop:product:${id}`)).filter(Boolean);

  const paidOrders = orders.filter(o => ['paid', 'processing', 'shipped', 'delivered'].includes(o.status));
  const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.total || 0), 0);

  const ordersByStatus = {};
  for (const o of orders) ordersByStatus[o.status] = (ordersByStatus[o.status] || 0) + 1;

  const paymentsByMethod = {};
  for (const p of payments) paymentsByMethod[p.method] = (paymentsByMethod[p.method] || 0) + 1;

  const productTotals = {};
  for (const o of paidOrders) {
    for (const it of o.items || []) {
      if (!productTotals[it.name]) productTotals[it.name] = { name: it.name, qty: 0, revenue: 0 };
      productTotals[it.name].qty += it.qty || 1;
      productTotals[it.name].revenue += (it.priceNum || 0) * (it.qty || 1);
    }
  }
  const topProducts = Object.values(productTotals).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  const recentOrders = orders.filter(o => Date.now() - new Date(o.submittedAt).getTime() < 7 * 86400_000).length;
  const pendingPayments = payments.filter(p => p.status === 'pending').length;

  return {
    stats: {
      totalRevenue,
      orderCount: orders.length,
      ordersByStatus,
      paymentsByMethod,
      topProducts,
      recentOrders,
      pendingPayments,
      productCount: products.length,
      activeProducts: products.filter(p => p.active !== false).length,
    },
  };
}
