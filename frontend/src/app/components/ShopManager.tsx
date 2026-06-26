import { useState, useEffect, useRef, CSSProperties } from 'react';
import {
  ShoppingBag, Package, CreditCard, TrendingUp, RefreshCw, Plus, Edit2, Trash2,
  RotateCcw, CheckCircle, Clock, XCircle, Truck, Eye, Search, ChevronDown,
  Upload, Star, StarOff, Archive, X, AlertCircle, BarChart2, DollarSign, Mail, Send,
  ImagePlus, Camera,
} from 'lucide-react';
import { shopApi, ordersApi, emailApi, ShopProduct, ShopPayment, ShopOrder, ShopStats } from '../lib/api';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending:    { label: 'Pending',    color: '#f59e0b', icon: <Clock size={12} /> },
  processing: { label: 'Processing', color: '#3b82f6', icon: <RefreshCw size={12} /> },
  paid:       { label: 'Paid',       color: '#10b981', icon: <CheckCircle size={12} /> },
  shipped:    { label: 'Shipped',    color: '#6366f1', icon: <Truck size={12} /> },
  delivered:  { label: 'Delivered',  color: '#22c55e', icon: <CheckCircle size={12} /> },
  cancelled:  { label: 'Cancelled',  color: '#ef4444', icon: <XCircle size={12} /> },
};

const PAY_STATUS: Record<string, { label: string; color: string }> = {
  pending:   { label: 'Pending',   color: '#f59e0b' },
  confirmed: { label: 'Confirmed', color: '#10b981' },
  failed:    { label: 'Failed',    color: '#ef4444' },
  expired:   { label: 'Expired',   color: '#6b7280' },
};

const METHOD_COLORS: Record<string, string> = {
  card: '#1a3a8f', airtel: '#e2001a', zamtel: '#009245', mtn: '#ffc000',
};

function Badge({ status, cfg }: { status: string; cfg: Record<string, { label: string; color: string; icon?: React.ReactNode }> }) {
  const c = cfg[status] || { label: status, color: '#6b7280' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, backgroundColor: `${c.color}20`, color: c.color, whiteSpace: 'nowrap' }}>
      {c.icon} {c.label}
    </span>
  );
}

function StatCard({ icon, label, value, sub, color }: { icon: React.ReactNode; label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>{icon}</div>
      <div>
        <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px' }}>{label}</p>
        <p style={{ fontSize: '22px', fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1 }}>{value}</p>
        {sub && <p style={{ fontSize: '11px', color: '#9ca3af', margin: '4px 0 0' }}>{sub}</p>}
      </div>
    </div>
  );
}

// ─── Product Form ─────────────────────────────────────────────────────────────

const CATEGORIES = ['APPAREL', 'ACCESSORIES', 'HOMEWARE', 'STATIONERY', 'PRINT', 'STICKERS', 'SIGNAGE', 'BAGS', 'TECH'];

function ProductForm({ product, onSave, onCancel }: {
  product?: ShopProduct;
  onSave: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [priceNum, setPriceNum] = useState(product?.priceNum ? String(product.priceNum) : '');
  const [category, setCategory] = useState(product?.category || 'APPAREL');
  const [inStock, setInStock] = useState(product?.inStock ?? true);
  const [stockQty, setStockQty] = useState(product?.stockQty != null ? String(product.stockQty) : '');
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [imageDataUrl, setImageDataUrl] = useState<string | undefined>();
  const [imagePreview, setImagePreview] = useState<string | undefined>(
    product?.hasCustomImage ? shopApi.productImageUrl(product.id) : product?.imageUrl
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5MB'); return; }
    const reader = new FileReader();
    reader.onload = e => {
      const url = e.target?.result as string;
      setImageDataUrl(url);
      setImagePreview(url);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleImageFile(file);
  };

  const handleSave = async () => {
    if (!name.trim() || !priceNum || !category) { setError('Name, price, and category are required'); return; }
    setSaving(true);
    setError('');
    try {
      const data = {
        name: name.trim(),
        description: description.trim(),
        priceNum: Number(priceNum),
        price: `K${priceNum}`,
        category,
        imageUrl: imagePreview && !imageDataUrl ? imagePreview : undefined,
        inStock,
        stockQty: stockQty ? Number(stockQty) : null,
        featured,
        tags: [category.toLowerCase(), name.toLowerCase().split(' ')[0]],
        imageDataUrl,
      };
      if (product) {
        await shopApi.updateProduct(product.id, data);
      } else {
        await shopApi.createProduct(data);
      }
      onSave();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const inp: CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', outline: 'none', color: '#111827', backgroundColor: '#fff' };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: '#fff', borderRadius: '12px', padding: '28px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#111827' }}>{product ? 'Edit Product' : 'New Product'}</h3>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}><X size={20} /></button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div style={{ gridColumn: '1/-1' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>Product Name *</label>
            <input style={inp} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. BOZ Campaign T-Shirt" />
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>Description</label>
            <textarea style={{ ...inp, minHeight: '80px', resize: 'vertical' }} value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the product…" />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>Price (ZMW) *</label>
            <input style={inp} type="number" value={priceNum} onChange={e => setPriceNum(e.target.value)} placeholder="e.g. 150" min={0} />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>Category *</label>
            <select style={{ ...inp, appearance: 'none' }} value={category} onChange={e => setCategory(e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '4px' }}>Stock Qty (blank = unlimited)</label>
            <input style={inp} type="number" value={stockQty} onChange={e => setStockQty(e.target.value)} placeholder="e.g. 100" min={0} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#374151' }}>
              <input type="checkbox" checked={inStock} onChange={e => setInStock(e.target.checked)} /> In Stock
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#374151' }}>
              <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} /> Featured (hero slideshow)
            </label>
          </div>
        </div>

        {/* Image upload */}
        <div style={{ marginTop: '16px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' }}>Product Image</label>
          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
            style={{ border: '2px dashed #d1d5db', borderRadius: '8px', padding: '20px', textAlign: 'center', cursor: 'pointer', backgroundColor: '#f9fafb', position: 'relative', overflow: 'hidden' }}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="preview" style={{ maxHeight: '140px', maxWidth: '100%', objectFit: 'contain', borderRadius: '6px' }} />
            ) : (
              <div style={{ color: '#9ca3af' }}>
                <Upload size={28} style={{ margin: '0 auto 8px', display: 'block' }} />
                <p style={{ margin: 0, fontSize: '13px' }}>Drag & drop or click to upload</p>
                <p style={{ margin: '4px 0 0', fontSize: '11px' }}>JPG, PNG up to 5MB</p>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleImageFile(f); }} />
          </div>
          {imagePreview && (
            <button onClick={() => { setImagePreview(undefined); setImageDataUrl(undefined); }} style={{ marginTop: '6px', fontSize: '12px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
              Remove image
            </button>
          )}
        </div>

        {error && (
          <div style={{ marginTop: '14px', padding: '10px 14px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '13px', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={14} /> {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: '11px', backgroundColor: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '7px', fontWeight: 600, fontSize: '14px', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving…' : product ? 'Update Product' : 'Create Product'}
          </button>
          <button onClick={onCancel} style={{ padding: '11px 20px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '7px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Quick Image Modal ────────────────────────────────────────────────────────

function QuickImageModal({ product, onDone, onCancel }: {
  product: ShopProduct;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [preview, setPreview] = useState<string | undefined>(
    product.hasCustomImage ? shopApi.productImageUrl(product.id) : product.imageUrl
  );
  const [dataUrl, setDataUrl] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5MB'); return; }
    setError('');
    const reader = new FileReader();
    reader.onload = e => {
      const url = e.target?.result as string;
      setDataUrl(url);
      setPreview(url);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) handleFile(file);
  };

  const handleSave = async () => {
    if (!dataUrl) { setError('Please select an image first'); return; }
    setSaving(true);
    setError('');
    try {
      await shopApi.uploadProductImage(product.id, dataUrl);
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ background: '#fff', borderRadius: '12px', padding: '28px', width: '100%', maxWidth: '420px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Camera size={18} /> Change Image
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6b7280' }}>{product.name}</p>
          </div>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}><X size={20} /></button>
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          style={{ marginTop: '16px', border: '2px dashed #d1d5db', borderRadius: '10px', padding: '16px', textAlign: 'center', cursor: 'pointer', backgroundColor: '#f9fafb', minHeight: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}
        >
          {preview ? (
            <img src={preview} alt="preview" style={{ maxHeight: '160px', maxWidth: '100%', objectFit: 'contain', borderRadius: '6px' }} />
          ) : (
            <div style={{ color: '#9ca3af' }}>
              <ImagePlus size={36} style={{ margin: '0 auto 10px', display: 'block' }} />
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 600 }}>Drag & drop or click to upload</p>
              <p style={{ margin: '4px 0 0', fontSize: '11px' }}>JPG, PNG, WebP — max 5MB</p>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
        </div>

        {preview && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
            <span style={{ fontSize: '11px', color: '#6b7280' }}>{dataUrl ? 'New image selected' : 'Current image'}</span>
            {dataUrl && (
              <button onClick={() => { setPreview(product.hasCustomImage ? shopApi.productImageUrl(product.id) : product.imageUrl); setDataUrl(undefined); }} style={{ fontSize: '11px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                Revert
              </button>
            )}
          </div>
        )}

        {error && (
          <div style={{ marginTop: '12px', padding: '9px 12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '12px', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={13} /> {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
          <button
            onClick={handleSave}
            disabled={saving || !dataUrl}
            style={{ flex: 1, padding: '11px', backgroundColor: saving || !dataUrl ? '#93c5fd' : '#1d4ed8', color: '#fff', border: 'none', borderRadius: '7px', fontWeight: 600, fontSize: '14px', cursor: saving || !dataUrl ? 'not-allowed' : 'pointer' }}
          >
            {saving ? 'Uploading…' : 'Save Image'}
          </button>
          <button onClick={onCancel} style={{ padding: '11px 18px', backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '7px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Products Tab ─────────────────────────────────────────────────────────────

function ProductsTab() {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('active');
  const [editing, setEditing] = useState<ShopProduct | undefined>();
  const [creating, setCreating] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [changingImage, setChangingImage] = useState<ShopProduct | undefined>();
  const [msg, setMsg] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await shopApi.listProducts({ includeInactive: true });
      setProducts(res.products);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = products.filter(p => {
    if (statusFilter === 'active' && !p.active) return false;
    if (statusFilter === 'inactive' && p.active) return false;
    if (catFilter !== 'ALL' && p.category !== catFilter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Archive this product?')) return;
    await shopApi.deleteProduct(id);
    setMsg('Product archived');
    load();
  };

  const handleRestore = async (id: string) => {
    await shopApi.restoreProduct(id);
    setMsg('Product restored');
    load();
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await shopApi.seedProducts();
      setMsg(`Seeded ${res.seeded} products`);
      load();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Seed failed');
    }
    setSeeding(false);
  };

  const handleFeature = async (p: ShopProduct) => {
    await shopApi.updateProduct(p.id, { featured: !p.featured });
    load();
  };

  return (
    <div>
      {(creating || editing) && (
        <ProductForm
          product={editing}
          onSave={() => { setCreating(false); setEditing(undefined); setMsg('Saved!'); load(); }}
          onCancel={() => { setCreating(false); setEditing(undefined); }}
        />
      )}
      {changingImage && (
        <QuickImageModal
          product={changingImage}
          onDone={() => { setChangingImage(undefined); setMsg('Image updated!'); load(); }}
          onCancel={() => setChangingImage(undefined)}
        />
      )}

      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search products…"
            style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px 8px 32px', border: '1px solid #d1d5db', borderRadius: '7px', fontSize: '13px', outline: 'none' }}
          />
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)} style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '7px', fontSize: '13px' }}>
          <option value="ALL">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as never)} style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '7px', fontSize: '13px' }}>
          <option value="all">All Products</option>
          <option value="active">Active</option>
          <option value="inactive">Archived</option>
        </select>
        <button onClick={handleSeed} disabled={seeding} style={{ padding: '8px 14px', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '7px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <RefreshCw size={13} /> {seeding ? 'Seeding…' : 'Seed Products'}
        </button>
        <button onClick={() => setCreating(true)} style={{ padding: '8px 16px', backgroundColor: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={14} /> Add Product
        </button>
      </div>

      {msg && (
        <div style={{ padding: '10px 14px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '7px', fontSize: '13px', color: '#15803d', marginBottom: '14px', display: 'flex', justifyContent: 'space-between' }}>
          {msg} <button onClick={() => setMsg('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#15803d' }}><X size={14} /></button>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>Loading products…</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
          {filtered.map(p => {
            const imgSrc = p.hasCustomImage ? shopApi.productImageUrl(p.id) : p.imageUrl;
            return (
              <div key={p.id} style={{ border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#fff', opacity: p.active ? 1 : 0.55 }}>
                <div
                  style={{ position: 'relative', height: '160px', backgroundColor: '#f3f4f6', cursor: 'pointer' }}
                  onClick={() => setChangingImage(p)}
                  title="Click to change image"
                >
                  {imgSrc && <img src={imgSrc} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                  <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background-color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.35)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0)')}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#fff', opacity: 0, transition: 'opacity 0.15s', pointerEvents: 'none' }}
                      ref={el => {
                        if (!el) return;
                        const parent = el.parentElement!;
                        const show = () => { el.style.opacity = '1'; };
                        const hide = () => { el.style.opacity = '0'; };
                        parent.addEventListener('mouseenter', show);
                        parent.addEventListener('mouseleave', hide);
                      }}
                    >
                      <Camera size={22} />
                      <span style={{ fontSize: '11px', fontWeight: 600 }}>Change Image</span>
                    </div>
                  </div>
                  <span style={{ position: 'absolute', top: '8px', left: '8px', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 700, backgroundColor: '#1d4ed8', color: '#fff' }}>{p.category}</span>
                  {!p.active && <span style={{ position: 'absolute', top: '8px', right: '8px', padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: 700, backgroundColor: '#ef4444', color: '#fff' }}>ARCHIVED</span>}
                </div>
                <div style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                    <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#111827', lineHeight: 1.3 }}>{p.name}</h4>
                    <span style={{ fontWeight: 700, fontSize: '14px', color: '#dc2626', whiteSpace: 'nowrap' }}>{p.price}</span>
                  </div>
                  <p style={{ margin: '0 0 10px', fontSize: '11px', color: '#6b7280', lineHeight: 1.5 }}>{p.description.slice(0, 80)}{p.description.length > 80 ? '…' : ''}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '11px', color: p.inStock ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                      {p.inStock ? (p.stockQty != null ? `In Stock (${p.stockQty})` : 'In Stock') : 'Out of Stock'}
                    </span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => handleFeature(p)} title={p.featured ? 'Remove from featured' : 'Mark as featured'} style={{ background: 'none', border: 'none', cursor: 'pointer', color: p.featured ? '#f59e0b' : '#d1d5db', padding: '4px' }}>
                        {p.featured ? <Star size={14} fill="#f59e0b" /> : <StarOff size={14} />}
                      </button>
                      <button onClick={() => setChangingImage(p)} title="Change image" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '4px' }}><Camera size={14} /></button>
                      <button onClick={() => setEditing(p)} title="Edit product" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '4px' }}><Edit2 size={14} /></button>
                      {p.active
                        ? <button onClick={() => handleDelete(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}><Archive size={14} /></button>
                        : <button onClick={() => handleRestore(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#10b981', padding: '4px' }}><RotateCcw size={14} /></button>
                      }
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
              <Package size={48} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.4 }} />
              <p>No products found. Click "Add Product" or "Seed Products" to get started.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Orders Tab ───────────────────────────────────────────────────────────────

function OrdersTab() {
  const [orderList, setOrderList] = useState<ShopOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await ordersApi.list(statusFilter !== 'all' ? { status: statusFilter } : undefined);
      setOrderList(res.orders as ShopOrder[]);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, [statusFilter]);

  const handleStatus = async (id: string, status: string) => {
    setUpdating(id);
    try { await ordersApi.updateStatus(id, status); load(); } catch { /* ignore */ }
    setUpdating(null);
  };

  const ORDER_STATUSES = ['pending', 'processing', 'paid', 'shipped', 'delivered', 'cancelled'];

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {['all', ...ORDER_STATUSES].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, border: 'none', cursor: 'pointer', backgroundColor: statusFilter === s ? '#1d4ed8' : '#f3f4f6', color: statusFilter === s ? '#fff' : '#374151' }}>
            {s === 'all' ? 'All' : STATUS_CONFIG[s]?.label || s}
          </button>
        ))}
        <button onClick={load} style={{ marginLeft: 'auto', padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>Loading orders…</div>
      ) : orderList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
          <ShoppingBag size={48} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.4 }} />
          <p>No orders found.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {orderList.map(order => (
            <div key={order.id} style={{ border: '1px solid #e5e7eb', borderRadius: '10px', backgroundColor: '#fff', overflow: 'hidden' }}>
              <div
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer' }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: '13px', color: '#111827' }}>{order.customerName}</span>
                    <Badge status={order.status} cfg={STATUS_CONFIG} />
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>
                      {new Date(order.submittedAt).toLocaleDateString()} · {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>{order.customerPhone}</span>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>{order.paymentMethod.toUpperCase()}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontWeight: 700, fontSize: '16px', color: '#dc2626' }}>K{order.total.toLocaleString()}</span>
                  <ChevronDown size={14} style={{ marginLeft: '8px', color: '#9ca3af', transform: expanded === order.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </div>
              </div>

              {expanded === order.id && (
                <div style={{ borderTop: '1px solid #f3f4f6', padding: '14px 18px', backgroundColor: '#fafafa' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '14px' }}>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '12px', color: '#374151', margin: '0 0 8px' }}>ORDER ITEMS</p>
                      {order.items.map(item => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#374151', marginBottom: '4px' }}>
                          <span>{item.name} × {item.qty}</span>
                          <span>K{(item.priceNum * item.qty).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '12px', color: '#374151', margin: '0 0 8px' }}>CUSTOMER</p>
                      <p style={{ fontSize: '13px', color: '#374151', margin: '0 0 2px' }}>{order.customerName}</p>
                      <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 2px' }}>{order.customerPhone}</p>
                      {order.customerEmail && <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>{order.customerEmail}</p>}
                      {order.paymentRef && <p style={{ fontSize: '11px', color: '#9ca3af', margin: '6px 0 0' }}>Ref: {order.paymentRef}</p>}
                    </div>
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '12px', color: '#374151', margin: '0 0 8px' }}>UPDATE STATUS</p>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {ORDER_STATUSES.filter(s => s !== order.status).map(s => (
                        <button
                          key={s}
                          onClick={() => handleStatus(order.id, s)}
                          disabled={updating === order.id}
                          style={{ padding: '5px 12px', borderRadius: '14px', fontSize: '12px', border: `1px solid ${STATUS_CONFIG[s]?.color || '#d1d5db'}`, backgroundColor: 'transparent', color: STATUS_CONFIG[s]?.color || '#374151', cursor: 'pointer', fontWeight: 600 }}
                        >
                          {STATUS_CONFIG[s]?.label || s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Payments Tab ─────────────────────────────────────────────────────────────

function PaymentsTab() {
  const [payments, setPayments] = useState<ShopPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [confirming, setConfirming] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await shopApi.listPayments(statusFilter !== 'all' ? { status: statusFilter } : undefined);
      setPayments(res.payments);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, [statusFilter]);

  const handleConfirm = async (ref: string) => {
    setConfirming(ref);
    try { await shopApi.confirmPayment(ref); load(); } catch { /* ignore */ }
    setConfirming(null);
  };

  const handleFail = async (ref: string) => {
    setConfirming(ref);
    try { await shopApi.failPayment(ref, 'Manual admin cancel'); load(); } catch { /* ignore */ }
    setConfirming(null);
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {['all', 'pending', 'confirmed', 'failed', 'expired'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, border: 'none', cursor: 'pointer', backgroundColor: statusFilter === s ? '#1d4ed8' : '#f3f4f6', color: statusFilter === s ? '#fff' : '#374151' }}>
            {s === 'all' ? 'All' : PAY_STATUS[s]?.label || s}
          </button>
        ))}
        <button onClick={load} style={{ marginLeft: 'auto', padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: '6px', backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>Loading payments…</div>
      ) : payments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>
          <CreditCard size={48} style={{ margin: '0 auto 16px', display: 'block', opacity: 0.4 }} />
          <p>No payments found.</p>
        </div>
      ) : (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#fff' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {['Reference', 'Method', 'Amount', 'Phone/Card', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '11px', fontWeight: 700, color: '#6b7280', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: i < payments.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                  <td style={{ padding: '12px 14px', fontSize: '12px', fontFamily: 'monospace', color: '#374151' }}>{p.paymentRef}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '2px 8px', borderRadius: '10px', fontSize: '11px', fontWeight: 700, backgroundColor: `${METHOD_COLORS[p.method]}20`, color: METHOD_COLORS[p.method] }}>
                      {p.method.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '13px', fontWeight: 700, color: '#111827' }}>K{p.amount.toLocaleString()}</td>
                  <td style={{ padding: '12px 14px', fontSize: '12px', color: '#6b7280' }}>{p.phone || (p.cardLast4 ? `•••• ${p.cardLast4}` : '—')}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, backgroundColor: `${PAY_STATUS[p.status]?.color || '#6b7280'}20`, color: PAY_STATUS[p.status]?.color || '#6b7280' }}>
                      {PAY_STATUS[p.status]?.label || p.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: '12px', color: '#6b7280' }}>{new Date(p.initiatedAt).toLocaleDateString()}</td>
                  <td style={{ padding: '12px 14px' }}>
                    {p.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => handleConfirm(p.paymentRef)} disabled={confirming === p.paymentRef} style={{ padding: '4px 10px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '5px', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}>
                          Confirm
                        </button>
                        <button onClick={() => handleFail(p.paymentRef)} disabled={confirming === p.paymentRef} style={{ padding: '4px 10px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '5px', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}>
                          Fail
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Email Tab ────────────────────────────────────────────────────────────────

function EmailTab() {
  const [testTo, setTestTo] = useState('');
  const [orderId, setOrderId] = useState('');
  const [payRef, setPayRef] = useState('');
  const [sending, setSending] = useState<string | null>(null);
  const [results, setResults] = useState<{ key: string; success: boolean; msg: string }[]>([]);

  const run = async (key: string, fn: () => Promise<{ success: boolean; id?: string; error?: string }>) => {
    setSending(key);
    try {
      const r = await fn();
      setResults(prev => [{ key, success: r.success, msg: r.success ? `Sent! ID: ${r.id}` : (r.error || 'Failed') }, ...prev.slice(0, 9)]);
    } catch (e) {
      setResults(prev => [{ key, success: false, msg: e instanceof Error ? e.message : 'Error' }, ...prev.slice(0, 9)]);
    }
    setSending(null);
  };

  const inp: React.CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px', outline: 'none', color: '#111827', backgroundColor: '#fff', marginBottom: '8px' };
  const btn = (loading: boolean): React.CSSProperties => ({ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', backgroundColor: loading ? '#9ca3af' : '#1d4ed8', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '13px', cursor: loading ? 'not-allowed' : 'pointer' });

  const actions: { key: string; title: string; desc: string; field: React.ReactNode; action: () => void }[] = [
    {
      key: 'test',
      title: 'Send Test Email',
      desc: 'Verify your Resend API key is working by sending a test email to any address.',
      field: <input style={inp} value={testTo} onChange={e => setTestTo(e.target.value)} placeholder="recipient@example.com" type="email" />,
      action: () => run('test', () => emailApi.test(testTo)),
    },
    {
      key: 'order',
      title: 'Resend Order Confirmation',
      desc: 'Manually resend the order placement confirmation email to a customer.',
      field: <input style={inp} value={orderId} onChange={e => setOrderId(e.target.value)} placeholder="Order ID (e.g. 1234567890-abc1234)" />,
      action: () => run('order', () => emailApi.resendOrder(orderId)),
    },
    {
      key: 'payment',
      title: 'Resend Payment Receipt',
      desc: 'Manually resend the payment confirmed email using a payment reference.',
      field: <input style={inp} value={payRef} onChange={e => setPayRef(e.target.value)} placeholder="Payment ref (e.g. BOZ-XXXXXXXX-XXXXX)" />,
      action: () => run('payment', () => emailApi.resendPayment(payRef)),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: '20px', padding: '16px 18px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <Mail size={16} style={{ color: '#2563eb' }} />
          <strong style={{ fontSize: '14px', color: '#1e40af' }}>Email System — Powered by Resend</strong>
        </div>
        <p style={{ fontSize: '13px', color: '#1e40af', margin: 0 }}>
          Emails are automatically sent when orders are placed, payments are confirmed, and statuses are updated. Use the tools below to test or manually resend emails.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {actions.map(a => (
          <div key={a.key} style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '18px', backgroundColor: '#fff' }}>
            <h4 style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 700, color: '#111827' }}>{a.title}</h4>
            <p style={{ margin: '0 0 14px', fontSize: '12px', color: '#6b7280', lineHeight: 1.5 }}>{a.desc}</p>
            {a.field}
            <button onClick={a.action} disabled={sending === a.key} style={btn(sending === a.key)}>
              <Send size={13} /> {sending === a.key ? 'Sending…' : 'Send'}
            </button>
          </div>
        ))}
      </div>

      {/* Automatic triggers info */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '18px', backgroundColor: '#fff', marginBottom: '16px' }}>
        <h4 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CheckCircle size={15} style={{ color: '#10b981' }} /> Automatic Email Triggers
        </h4>
        {[
          { event: 'Order Placed', recipients: 'Customer + Admin', template: 'Order confirmation with itemised receipt + shipping address' },
          { event: 'Payment Confirmed', recipients: 'Customer', template: 'Payment receipt with payment reference + order details' },
          { event: 'Order Status → Paid / Processing / Shipped / Delivered / Cancelled', recipients: 'Customer', template: 'Status update with next steps' },
          { event: 'Donation Submitted', recipients: 'Donor + Admin', template: 'Thank you email + admin notification' },
          { event: 'Contact Form Submitted', recipients: 'Sender + Admin', template: 'Auto-reply + admin notification with reply link' },
        ].map((t, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '220px 100px 1fr', gap: '12px', alignItems: 'start', borderBottom: i < 4 ? '1px solid #f3f4f6' : 'none', padding: '10px 0' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>{t.event}</span>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>{t.recipients}</span>
            <span style={{ fontSize: '12px', color: '#9ca3af' }}>{t.template}</span>
          </div>
        ))}
      </div>

      {/* Send log */}
      {results.length > 0 && (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '18px', backgroundColor: '#fff' }}>
          <h4 style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 700, color: '#111827' }}>Send Log</h4>
          {results.map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: i < results.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
              {r.success
                ? <CheckCircle size={14} style={{ color: '#10b981', flexShrink: 0 }} />
                : <XCircle size={14} style={{ color: '#ef4444', flexShrink: 0 }} />}
              <span style={{ fontSize: '12px', color: r.success ? '#374151' : '#ef4444', fontFamily: 'monospace' }}>{r.key}: {r.msg}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main ShopManager ─────────────────────────────────────────────────────────

type Tab = 'overview' | 'orders' | 'products' | 'payments' | 'email';

export function ShopManager() {
  const [tab, setTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<ShopStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    shopApi.getStats()
      .then(r => setStats(r.stats))
      .catch(() => {})
      .finally(() => setLoadingStats(false));
  }, [tab]);

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'overview', label: 'Overview', icon: <BarChart2 size={14} /> },
    { key: 'orders', label: 'Orders', icon: <ShoppingBag size={14} /> },
    { key: 'products', label: 'Products', icon: <Package size={14} /> },
    { key: 'payments', label: 'Payments', icon: <CreditCard size={14} /> },
    { key: 'email', label: 'Email', icon: <Mail size={14} /> },
  ];

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>Shop Manager</h2>
        <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>Manage products, orders, and payments for the BOZ campaign shop</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '2px solid #e5e7eb', marginBottom: '20px' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', border: 'none', borderBottom: tab === t.key ? '2px solid #1d4ed8' : '2px solid transparent', marginBottom: '-2px', backgroundColor: 'transparent', fontWeight: 600, fontSize: '13px', cursor: 'pointer', color: tab === t.key ? '#1d4ed8' : '#6b7280' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div>
          {loadingStats ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>Loading stats…</div>
          ) : stats ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px', marginBottom: '24px' }}>
                <StatCard icon={<DollarSign size={20} />} label="Total Revenue" value={`K${stats.totalRevenue.toLocaleString()}`} sub="From paid/shipped/delivered orders" color="#10b981" />
                <StatCard icon={<ShoppingBag size={20} />} label="Total Orders" value={stats.orderCount} sub={`${stats.recentOrders} in last 7 days`} color="#3b82f6" />
                <StatCard icon={<Package size={20} />} label="Active Products" value={stats.activeProducts} sub={`${stats.productCount} total`} color="#6366f1" />
                <StatCard icon={<Clock size={20} />} label="Pending Payments" value={stats.pendingPayments} sub="Awaiting confirmation" color="#f59e0b" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Orders by status */}
                <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '18px', backgroundColor: '#fff' }}>
                  <h4 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: 700, color: '#111827' }}>Orders by Status</h4>
                  {Object.entries(stats.ordersByStatus).map(([s, n]) => (
                    <div key={s} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <Badge status={s} cfg={STATUS_CONFIG} />
                      <span style={{ fontWeight: 700, fontSize: '14px', color: '#111827' }}>{n}</span>
                    </div>
                  ))}
                  {Object.keys(stats.ordersByStatus).length === 0 && <p style={{ fontSize: '13px', color: '#9ca3af' }}>No orders yet</p>}
                </div>

                {/* Top Products */}
                <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '18px', backgroundColor: '#fff' }}>
                  <h4 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: 700, color: '#111827' }}>Top Products by Revenue</h4>
                  {stats.topProducts.map((p, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div>
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#374151' }}>{p.name}</p>
                        <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>{p.qty} units sold</p>
                      </div>
                      <span style={{ fontWeight: 700, fontSize: '13px', color: '#10b981' }}>K{p.revenue.toLocaleString()}</span>
                    </div>
                  ))}
                  {stats.topProducts.length === 0 && <p style={{ fontSize: '13px', color: '#9ca3af' }}>No sales data yet</p>}
                </div>

                {/* Payment methods */}
                <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '18px', backgroundColor: '#fff' }}>
                  <h4 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: 700, color: '#111827' }}>Orders by Payment Method</h4>
                  {Object.entries(stats.paymentsByMethod).map(([m, n]) => (
                    <div key={m} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: 700, backgroundColor: `${METHOD_COLORS[m] || '#9ca3af'}20`, color: METHOD_COLORS[m] || '#6b7280' }}>{m.toUpperCase()}</span>
                      <span style={{ fontWeight: 700, fontSize: '14px', color: '#111827' }}>{n}</span>
                    </div>
                  ))}
                  {Object.keys(stats.paymentsByMethod).length === 0 && <p style={{ fontSize: '13px', color: '#9ca3af' }}>No payment data yet</p>}
                </div>

                {/* Quick nav */}
                <div style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '18px', backgroundColor: '#fff' }}>
                  <h4 style={{ margin: '0 0 14px', fontSize: '14px', fontWeight: 700, color: '#111827' }}>Quick Actions</h4>
                  {[
                    { label: 'View All Orders', tab: 'orders' as Tab, icon: <ShoppingBag size={14} />, color: '#3b82f6' },
                    { label: 'Manage Products', tab: 'products' as Tab, icon: <Package size={14} />, color: '#6366f1' },
                    { label: 'Review Payments', tab: 'payments' as Tab, icon: <CreditCard size={14} />, color: '#10b981' },
                  ].map(a => (
                    <button key={a.tab} onClick={() => setTab(a.tab)}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', border: '1px solid #e5e7eb', borderRadius: '7px', backgroundColor: '#f9fafb', cursor: 'pointer', marginBottom: '8px', color: a.color, fontWeight: 600, fontSize: '13px' }}>
                      {a.icon} {a.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>Could not load stats.</div>
          )}
        </div>
      )}

      {tab === 'orders' && <OrdersTab />}
      {tab === 'products' && <ProductsTab />}
      {tab === 'payments' && <PaymentsTab />}
      {tab === 'email' && <EmailTab />}
    </div>
  );
}
