import { useState, useEffect } from 'react';
import { ShoppingBag, ArrowRight, ChevronLeft, ChevronRight, Search, ShoppingCart } from 'lucide-react';
import { ShopCheckout, CartItem } from '../../components/ShopCheckout';

const PRODUCTS = [
  { id: 1,  name: 'BOZ Campaign T-Shirt',         price: 'K150',  priceNum: 150,  tag: 'APPAREL',     desc: 'Branded with the party logo, slogan, and candidate\'s name. Available in all sizes.',            img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop&auto=format' },
  { id: 2,  name: 'BOZ Hoodie',                   price: 'K280',  priceNum: 280,  tag: 'APPAREL',     desc: 'Premium hoodie embroidered with the Build One Zambia logo and 2031 campaign slogan.',            img: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=500&h=500&fit=crop&auto=format' },
  { id: 3,  name: 'Build One Zambia Cap',          price: 'K120',  priceNum: 120,  tag: 'ACCESSORIES', desc: 'Baseball cap in party colours with embroidered BOZ logo. One size fits all.',                    img: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&h=500&fit=crop&auto=format' },
  { id: 4,  name: 'BOZ Beanie Hat',               price: 'K100',  priceNum: 100,  tag: 'ACCESSORIES', desc: 'Warm knit beanie in green and red party colours. Perfect for campaign events.',                   img: 'https://images.unsplash.com/photo-1510598969022-c4c6c5d05769?w=500&h=500&fit=crop&auto=format' },
  { id: 5,  name: 'Lapel Pin Buttons (Set of 3)', price: 'K60',   priceNum: 60,   tag: 'ACCESSORIES', desc: 'Pinback buttons featuring the party logo and campaign slogans. Great for rallies.',               img: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500&h=500&fit=crop&auto=format' },
  { id: 6,  name: 'Bumper Stickers (Pack of 5)',  price: 'K40',   priceNum: 40,   tag: 'STICKERS',    desc: 'Weatherproof vinyl stickers with party messages and candidate name for your car.',               img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=500&fit=crop&auto=format' },
  { id: 7,  name: 'BOZ Yard Sign',                price: 'K90',   priceNum: 90,   tag: 'SIGNAGE',     desc: 'Durable corrugated plastic lawn sign for displaying party support at your home.',                img: 'https://images.unsplash.com/photo-1531844251246-9a1bfaae09fc?w=500&h=500&fit=crop&auto=format' },
  { id: 8,  name: 'Campaign Mug',                 price: 'K80',   priceNum: 80,   tag: 'HOMEWARE',    desc: 'Ceramic coffee mug printed with the Build One Zambia logo and 2031 election branding.',          img: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500&h=500&fit=crop&auto=format' },
  { id: 9,  name: 'BOZ Travel Tumbler',           price: 'K130',  priceNum: 130,  tag: 'HOMEWARE',    desc: 'Stainless steel insulated travel cup with party branding. Keeps drinks hot or cold.',             img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&h=500&fit=crop&auto=format' },
  { id: 10, name: 'Campaign Tote Bag',            price: 'K80',   priceNum: 80,   tag: 'BAGS',        desc: 'Heavy-duty reusable cotton shopping bag with BOZ logo and slogan. Eco-friendly.',                img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop&auto=format' },
  { id: 11, name: 'Campaign Art Print (A2)',       price: 'K110',  priceNum: 110,  tag: 'PRINT',       desc: 'Framing-quality campaign art print. Bold patriotic design. Signed edition available.',           img: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=500&h=500&fit=crop&auto=format' },
  { id: 12, name: 'BOZ Fridge Magnet',            price: 'K30',   priceNum: 30,   tag: 'ACCESSORIES', desc: 'Full-colour fridge or car magnet featuring the Build One Zambia logo and 2031 date.',            img: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500&h=500&fit=crop&auto=format' },
  { id: 13, name: 'Branded Pen Set (Pack of 5)',  price: 'K50',   priceNum: 50,   tag: 'STATIONERY',  desc: 'Quality ballpoint pens with BOZ branding. Great for offices, schools, and events.',              img: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=500&h=500&fit=crop&auto=format' },
  { id: 14, name: 'BOZ Notepad & Journal',        price: 'K70',   priceNum: 70,   tag: 'STATIONERY',  desc: 'A5 notepad printed with party branding on the cover. 100 lined pages.',                          img: 'https://images.unsplash.com/photo-1531346680769-a1d79b57de5c?w=500&h=500&fit=crop&auto=format' },
  { id: 15, name: 'Custom Phone Case',            price: 'K120',  priceNum: 120,  tag: 'TECH',        desc: 'Printed phone case for popular models with Build One Zambia artwork. Specify your model.',        img: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=500&h=500&fit=crop&auto=format' },
  { id: 16, name: 'BOZ Mini Desk Flag',           price: 'K60',   priceNum: 60,   tag: 'SIGNAGE',     desc: 'Small desk-sized party flag on a stand. Perfect for offices and event tables.',                   img: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=500&h=500&fit=crop&auto=format' },
  { id: 17, name: 'BOZ Outdoor Banner',           price: 'K350',  priceNum: 350,  tag: 'SIGNAGE',     desc: 'Full-sized durable outdoor banner with party logo and candidate name. Weather-resistant.',        img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&h=500&fit=crop&auto=format' },
  { id: 18, name: 'BOZ Keychain',                 price: 'K35',   priceNum: 35,   tag: 'ACCESSORIES', desc: 'Metal or acrylic keyring laser-engraved with the Build One Zambia logo.',                        img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop&auto=format' },
  { id: 19, name: 'Wristbands (Pack of 5)',       price: 'K50',   priceNum: 50,   tag: 'ACCESSORIES', desc: 'Silicone wristbands debossed with campaign slogans in party colours.',                            img: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=500&h=500&fit=crop&auto=format' },
  { id: 20, name: 'BOZ 2031 Calendar',            price: 'K95',   priceNum: 95,   tag: 'PRINT',       desc: 'Annual wall calendar featuring party imagery, key election dates, and campaign milestones.',      img: 'https://images.unsplash.com/photo-1506784365847-bbad939e9501?w=500&h=500&fit=crop&auto=format' },
  { id: 21, name: 'BOZ Water Bottle',             price: 'K110',  priceNum: 110,  tag: 'HOMEWARE',    desc: 'Reusable stainless steel water bottle with party logo. 750ml capacity.',                          img: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&h=500&fit=crop&auto=format' },
  { id: 22, name: 'BOZ Campaign Jersey',          price: 'K320',  priceNum: 320,  tag: 'APPAREL',     desc: 'Sports-style jersey in party colours with logo and candidate\'s name. Premium fundraising item.',  img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop&auto=format' },
  { id: 23, name: 'BOZ Branded Jacket',           price: 'K580',  priceNum: 580,  tag: 'APPAREL',     desc: 'Embroidered windbreaker/bomber jacket with party logo and colours. Premium collectible.',           img: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&h=500&fit=crop&auto=format' },
  { id: 24, name: 'BOZ Novelty Socks',            price: 'K45',   priceNum: 45,   tag: 'APPAREL',     desc: 'Fun novelty socks featuring party colours and logo patterns.',                                    img: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=500&h=500&fit=crop&auto=format' },
  { id: 25, name: 'Manifesto & Policy Books',     price: 'K20',   priceNum: 20,   tag: 'PRINT',       desc: 'The full 2031 manifesto, policy pamphlets, and ideology guides — sold as collectibles.',           img: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&h=500&fit=crop&auto=format' },
  { id: 26, name: 'BOZ Umbrella',                 price: 'K220',  priceNum: 220,  tag: 'ACCESSORIES', desc: 'Full-size automatic umbrella in party colours with the Build One Zambia logo printed on each panel. Ideal for outdoor rallies and events.', img: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=500&h=500&fit=crop&auto=format' },
  { id: 27, name: 'BOZ Polo Shirt',               price: 'K195',  priceNum: 195,  tag: 'APPAREL',     desc: 'Premium cotton polo shirt embroidered with the Build One Zambia logo on the chest. Available in green, red, and white. Sizes S–3XL.', img: 'https://images.unsplash.com/photo-1618354691229-88d47f285158?w=500&h=500&fit=crop&auto=format' },
  { id: 28, name: 'Campaign Backpack',            price: 'K450',  priceNum: 450,  tag: 'BAGS',        desc: 'Durable 25L backpack with the BOZ logo and slogan. Multiple compartments, padded laptop sleeve, and water-resistant fabric. Perfect for agents and volunteers.', img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop&auto=format' },
];

const CATEGORIES = ['ALL', 'APPAREL', 'ACCESSORIES', 'HOMEWARE', 'STATIONERY', 'PRINT', 'STICKERS', 'SIGNAGE', 'BAGS', 'TECH'];

const AD_SLIDES = [
  { img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1400&h=700&fit=crop&auto=format', name: 'BOZ Campaign T-Shirt', price: 'K150', tag: 'APPAREL', tagline: 'Wear the Movement' },
  { img: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=1400&h=700&fit=crop&auto=format', name: 'BOZ Hoodie', price: 'K280', tag: 'APPAREL', tagline: 'Stay Warm. Stay United.' },
  { img: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1400&h=700&fit=crop&auto=format', name: 'BOZ Branded Jacket', price: 'K580', tag: 'PREMIUM', tagline: 'Represent in Style' },
  { img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&h=700&fit=crop&auto=format', name: 'BOZ Campaign Jersey', price: 'K320', tag: 'APPAREL', tagline: 'Rally in Colour' },
  { img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1400&h=700&fit=crop&auto=format', name: 'Campaign Tote Bag', price: 'K80', tag: 'BAGS', tagline: 'Carry the Vision' },
];

export function ShopPage() {
  const [slideIndex, setSlideIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [addedId, setAddedId] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setSlideIndex(i => (i + 1) % AD_SLIDES.length), 4500);
    return () => clearInterval(timer);
  }, []);

  const prev = () => setSlideIndex(i => (i - 1 + AD_SLIDES.length) % AD_SLIDES.length);
  const next = () => setSlideIndex(i => (i + 1) % AD_SLIDES.length);

  const filtered = PRODUCTS.filter(p => {
    const matchCat = activeCategory === 'ALL' || p.tag === activeCategory;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.desc.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const addToCart = (product: typeof PRODUCTS[0]) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === product.id);
      if (exists) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1200);
  };

  const updateQty = (id: number, qty: number) => setCart(prev => prev.map(i => i.id === id ? { ...i, qty } : i));
  const removeItem = (id: number) => setCart(prev => prev.filter(i => i.id !== id));

  const closeCheckout = () => {
    setCheckoutOpen(false);
    setCart([]);
  };

  return (
    <div style={{ backgroundColor: '#007A30', fontFamily: 'Open Sans, sans-serif', color: '#fff' }}>

      {/* Sticky cart button */}
      {cartCount > 0 && !checkoutOpen && (
        <button
          onClick={() => setCheckoutOpen(true)}
          style={{ position: 'fixed', bottom: '28px', right: '24px', zIndex: 200, display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '14px 24px', cursor: 'pointer', fontFamily: 'Oswald, sans-serif', fontSize: '13px', letterSpacing: '0.1em', boxShadow: '0 8px 32px rgba(220,38,38,0.45)' }}
        >
          <ShoppingCart style={{ width: '18px', height: '18px' }} />
          VIEW CART ({cartCount}) — K{cart.reduce((s, i) => s + i.priceNum * i.qty, 0).toLocaleString()}
        </button>
      )}

      {/* Checkout drawer */}
      {checkoutOpen && (
        <ShopCheckout cart={cart} onClose={closeCheckout} onUpdateQty={updateQty} onRemove={removeItem} />
      )}

      {/* Hero slideshow */}
      <section style={{ position: 'relative', overflow: 'hidden', height: 'clamp(400px, 65vh, 660px)' }}>
        {AD_SLIDES.map((slide, i) => (
          <div key={slide.name} style={{ position: 'absolute', inset: 0, opacity: i === slideIndex ? 1 : 0, transition: 'opacity 1s', pointerEvents: i === slideIndex ? 'auto' : 'none' }}>
            <img src={slide.img} alt={slide.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.1) 100%)' }} />
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', backgroundColor: '#dc2626' }} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 clamp(24px, 8vw, 96px)' }}>
              <p style={{ fontSize: '11px', letterSpacing: '0.22em', color: '#dc2626', fontFamily: 'Oswald, sans-serif', marginBottom: '12px' }}>{slide.tag}</p>
              <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(2rem, 5vw, 4rem)', lineHeight: 1.05, letterSpacing: '0.03em', color: '#fff', maxWidth: '560px', marginBottom: '10px' }}>{slide.name}</h1>
              <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(1rem, 2vw, 1.4rem)', letterSpacing: '0.06em', color: '#dc2626', marginBottom: '16px' }}>{slide.tagline}</p>
              <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(1.4rem, 3vw, 2.2rem)', color: '#fff', letterSpacing: '0.05em', marginBottom: '28px' }}>{slide.price}</p>
              <button
                onClick={() => { const p = PRODUCTS.find(pr => pr.name === slide.name); if (p) addToCart(p); }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', alignSelf: 'flex-start', padding: '13px 28px', backgroundColor: '#dc2626', color: '#fff', border: 'none', fontFamily: 'Oswald, sans-serif', fontSize: '13px', letterSpacing: '0.12em', cursor: 'pointer' }}
              >
                ADD TO CART <ArrowRight style={{ width: '15px', height: '15px' }} />
              </button>
            </div>
          </div>
        ))}

        <button onClick={prev} aria-label="Previous" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#dc2626'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(0,0,0,0.55)'}
        ><ChevronLeft style={{ width: '20px', height: '20px' }} /></button>

        <button onClick={next} aria-label="Next" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#dc2626'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(0,0,0,0.55)'}
        ><ChevronRight style={{ width: '20px', height: '20px' }} /></button>

        <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px', zIndex: 5 }}>
          {AD_SLIDES.map((_, i) => (
            <button key={i} onClick={() => setSlideIndex(i)} style={{ width: i === slideIndex ? '28px' : '8px', height: '8px', borderRadius: '4px', backgroundColor: i === slideIndex ? '#dc2626' : 'rgba(255,255,255,0.35)', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }} />
          ))}
        </div>
      </section>

      {/* Campaign fund banner */}
      <section style={{ backgroundColor: 'rgba(220,38,38,0.08)', borderTop: '1px solid rgba(220,38,38,0.2)', borderBottom: '1px solid rgba(220,38,38,0.2)', padding: '16px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', textAlign: 'center' }}>
          <ShoppingBag style={{ width: '16px', height: '16px', color: '#dc2626', flexShrink: 0 }} />
          <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', letterSpacing: '0.08em', color: '#d1d5db', margin: 0 }}>
            ALL PROCEEDS FROM SHOP SALES GO DIRECTLY TO THE <span style={{ color: '#dc2626' }}>BUILD ONE ZAMBIA CAMPAIGN FUND</span>
          </p>
        </div>
      </section>

      {/* Search + filter */}
      <section style={{ padding: '40px 16px 0', backgroundColor: '#007A30' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
              <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: '#4b5563' }} />
              <input type="text" placeholder="Search merchandise…" value={search} onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', padding: '11px 14px 11px 40px', backgroundColor: '#111', border: '1px solid #2a2a2a', color: '#fff', fontSize: '14px', outline: 'none', fontFamily: 'Open Sans, sans-serif' }}
              />
            </div>
            <span style={{ fontSize: '12px', color: '#4b5563', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{filtered.length} ITEMS</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingBottom: '28px' }}>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                style={{ background: activeCategory === cat ? '#dc2626' : 'transparent', border: `1px solid ${activeCategory === cat ? '#dc2626' : '#2a2a2a'}`, color: activeCategory === cat ? '#fff' : '#6b7280', padding: '6px 14px', fontFamily: 'Oswald, sans-serif', fontSize: '11px', letterSpacing: '0.1em', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}
              >{cat}</button>
            ))}
          </div>
        </div>
      </section>

      {/* Product grid */}
      <section style={{ padding: '0 16px 120px', backgroundColor: '#007A30' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 0', color: '#4b5563' }}>
              <p style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em', fontSize: '1.1rem' }}>No items match your search.</p>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
            {filtered.map(product => {
              const inCart = cart.find(i => i.id === product.id);
              const justAdded = addedId === product.id;
              return (
                <div key={product.id}
                  style={{ backgroundColor: '#111', border: '1px solid #1f1f1f', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#dc2626'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = '#1f1f1f'}
                >
                  <div style={{ position: 'relative', height: '210px', overflow: 'hidden', backgroundColor: '#1a1a1a' }}>
                    <img src={product.img} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                      onMouseEnter={e => (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.06)'}
                      onMouseLeave={e => (e.currentTarget as HTMLImageElement).style.transform = 'scale(1)'}
                    />
                    <span style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: 'rgba(220,38,38,0.92)', color: '#fff', fontSize: '10px', padding: '3px 9px', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.1em' }}>{product.tag}</span>
                    {inCart && (
                      <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#111', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '3px 9px', fontSize: '11px', color: '#dc2626', fontFamily: 'Oswald, sans-serif' }}>
                        ×{inCart.qty} in cart
                      </div>
                    )}
                  </div>
                  <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em', fontSize: '14px', color: '#fff', marginBottom: '6px' }}>{product.name}</h3>
                    <p style={{ fontSize: '12px', lineHeight: 1.7, color: '#6b7280', flex: 1, margin: '0 0 14px' }}>{product.desc}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                      <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '1.1rem', color: '#dc2626', letterSpacing: '0.04em' }}>{product.price}</span>
                      <button
                        onClick={() => addToCart(product)}
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', padding: '9px 14px', backgroundColor: justAdded ? '#166534' : '#dc2626', color: '#fff', border: 'none', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em', cursor: 'pointer', transition: 'background-color 0.3s', whiteSpace: 'nowrap' }}
                      >
                        {justAdded ? '✓ ADDED' : '+ ADD TO CART'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
}
