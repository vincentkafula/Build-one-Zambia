import { useState } from 'react';
import { ShoppingBag, Search, ShoppingCart } from 'lucide-react';
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
  { id: 29, name: 'Hand-Held Rally Flag',         price: 'K45',   priceNum: 45,   tag: 'SIGNAGE',     desc: 'Small hand-held party flag on a stick, perfect for waving at rallies and motorcades.',            img: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=500&h=500&fit=crop&auto=format' },
  { id: 30, name: 'BOZ Chitenge Wrap',            price: 'K85',   priceNum: 85,   tag: 'APPAREL',     desc: 'Traditional chitenge fabric printed with the Build One Zambia pattern and colours.',              img: 'https://images.unsplash.com/photo-1618354691229-88d47f285158?w=500&h=500&fit=crop&auto=format' },
  { id: 31, name: 'BOZ Enamel Pin (Single)',      price: 'K25',   priceNum: 25,   tag: 'ACCESSORIES', desc: 'Single hard-enamel lapel pin featuring the party crest.',                                        img: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500&h=500&fit=crop&auto=format' },
  { id: 32, name: 'Rally Wristband',              price: 'K25',   priceNum: 25,   tag: 'ACCESSORIES', desc: 'Single silicone wristband debossed with a campaign slogan.',                                     img: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=500&h=500&fit=crop&auto=format' },
  { id: 33, name: 'BOZ Car Window Flag',          price: 'K55',   priceNum: 55,   tag: 'SIGNAGE',     desc: 'Clip-on window flag for cars and trucks, visible from both sides.',                              img: 'https://images.unsplash.com/photo-1531844251246-9a1bfaae09fc?w=500&h=500&fit=crop&auto=format' },
  { id: 34, name: 'Campaign Canvas Print (A3)',   price: 'K140',  priceNum: 140,  tag: 'PRINT',       desc: 'Larger framing-quality canvas print of official campaign artwork.',                             img: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=500&h=500&fit=crop&auto=format' },
  { id: 35, name: 'BOZ Sticker Sheet',            price: 'K20',   priceNum: 20,   tag: 'STICKERS',    desc: 'A5 sheet of assorted logo and slogan stickers for laptops and notebooks.',                       img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=500&fit=crop&auto=format' },
  { id: 36, name: 'BOZ Vinyl Decal',              price: 'K35',   priceNum: 35,   tag: 'STICKERS',    desc: 'Large single vinyl decal for car windows and shopfronts.',                                       img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=500&fit=crop&auto=format' },
  { id: 37, name: 'BOZ Insulated Bottle',         price: 'K140',  priceNum: 140,  tag: 'HOMEWARE',    desc: 'Double-walled insulated bottle with the party crest, 500ml.',                                    img: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&h=500&fit=crop&auto=format' },
  { id: 38, name: 'BOZ Coaster Set (Pack of 4)',  price: 'K40',   priceNum: 40,   tag: 'HOMEWARE',    desc: 'Cork-backed coasters printed with campaign artwork, set of four.',                               img: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500&h=500&fit=crop&auto=format' },
  { id: 39, name: 'BOZ Sticky Notes',             price: 'K25',   priceNum: 25,   tag: 'STATIONERY',  desc: 'Branded sticky note pad for offices, schools, and volunteer desks.',                             img: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=500&h=500&fit=crop&auto=format' },
  { id: 40, name: 'BOZ Desk Diary',               price: 'K85',   priceNum: 85,   tag: 'STATIONERY',  desc: 'A5 hardcover desk diary printed with the 2031 campaign calendar.',                               img: 'https://images.unsplash.com/photo-1531346680769-a1d79b57de5c?w=500&h=500&fit=crop&auto=format' },
  { id: 41, name: 'BOZ Phone Grip',               price: 'K35',   priceNum: 35,   tag: 'TECH',        desc: 'Collapsible phone grip and stand with the party logo.',                                          img: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=500&h=500&fit=crop&auto=format' },
  { id: 42, name: 'BOZ Laptop Sleeve',            price: 'K165',  priceNum: 165,  tag: 'BAGS',        desc: 'Padded 13–15" laptop sleeve with embroidered BOZ logo.',                                         img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop&auto=format' },
  { id: 43, name: 'Campaign Duffel Bag',          price: 'K420',  priceNum: 420,  tag: 'BAGS',        desc: 'Large duffel bag for agents and volunteers travelling between wards.',                          img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop&auto=format' },
  { id: 44, name: 'BOZ Windbreaker',              price: 'K380',  priceNum: 380,  tag: 'APPAREL',     desc: 'Lightweight windbreaker in party colours, ideal for outdoor canvassing.',                       img: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&h=500&fit=crop&auto=format' },
  { id: 45, name: 'BOZ Snapback Cap',             price: 'K130',  priceNum: 130,  tag: 'ACCESSORIES', desc: 'Flat-brim snapback cap with an embroidered front logo.',                                        img: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&h=500&fit=crop&auto=format' },
];

const CATEGORIES = ['ALL', 'APPAREL', 'ACCESSORIES', 'HOMEWARE', 'STATIONERY', 'PRINT', 'STICKERS', 'SIGNAGE', 'BAGS', 'TECH'];

const PAPER = '#F0EAD6';
const PAPER_DIM = '#E4DCC1';
const LINE_ON_PAPER = '#D8CDA9';
const INK = '#181C12';
const RED = '#dc2626';
const RED_DARK = '#98281A';
const CANVAS = '#0B120A';
const CANVAS_DEEP = '#080D07';

type Product = typeof PRODUCTS[0];

export function ShopPage() {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [addedId, setAddedId] = useState<number | null>(null);

  const addToCart = (product: Product) => {
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
  const closeCheckout = () => { setCheckoutOpen(false); setCart([]); };

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const searchFiltered = PRODUCTS.filter(p => {
    const matchCat = activeCategory === 'ALL' || p.tag === activeCategory;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.desc.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const isSearching = search.trim().length > 0;
  const isFiltering = isSearching || activeCategory !== 'ALL';

  function ProductCard({ product, tilt }: { product: Product; tilt: 'left' | 'right' }) {
    const inCart = cart.find(ci => ci.id === product.id);
    const justAdded = addedId === product.id;
    return (
      <div style={{ background: PAPER, color: INK, width: '190px', flex: '0 0 190px', borderRadius: '2px', padding: '12px 12px 14px', position: 'relative', boxShadow: '0 14px 24px -14px rgba(0,0,0,0.6)', transform: tilt === 'left' ? 'rotate(-1deg)' : 'rotate(1deg)' }}>
        <div style={{ position: 'absolute', top: '-5px', left: '50%', transform: 'translateX(-50%)', width: '10px', height: '10px', borderRadius: '50%', background: RED, boxShadow: '0 2px 3px rgba(0,0,0,0.4)' }} />
        {inCart && (
          <div style={{ position: 'absolute', top: '8px', right: '8px', background: INK, color: PAPER, fontSize: '9px', fontFamily: 'Oswald, sans-serif', padding: '2px 6px', borderRadius: '10px' }}>
            ×{inCart.qty}
          </div>
        )}
        <div style={{ height: '110px', borderRadius: '2px', overflow: 'hidden', marginBottom: '10px', background: PAPER_DIM }}>
          <img src={product.img} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '9px', letterSpacing: '0.08em', color: RED_DARK, margin: '0 0 4px' }}>{product.tag}</p>
        <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12.5px', fontWeight: 600, lineHeight: 1.25, margin: '0 0 10px', minHeight: '30px' }}>{product.name}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', paddingTop: '10px', borderTop: `1px dashed ${LINE_ON_PAPER}` }}>
          <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '13px', fontWeight: 700 }}>{product.price}</span>
          <button onClick={() => addToCart(product)} style={{ background: INK, color: PAPER, border: 'none', fontFamily: 'Oswald, sans-serif', fontSize: '10px', letterSpacing: '0.04em', padding: '7px 10px', borderRadius: '2px', cursor: 'pointer' }}>
            {justAdded ? 'ADDED' : 'ADD'}
          </button>
        </div>
      </div>
    );
  }

  function MosaicTile({ product }: { product: Product }) {
    const inCart = cart.find(ci => ci.id === product.id);
    const justAdded = addedId === product.id;
    return (
      <div style={{ position: 'relative', aspectRatio: '1 / 1', overflow: 'hidden', background: PAPER_DIM }}>
        <img src={product.img} alt={product.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(8,13,7,0.92) 0%, rgba(8,13,7,0.55) 38%, rgba(8,13,7,0) 62%)' }} />
        {inCart && (
          <div style={{ position: 'absolute', top: '6px', right: '6px', background: RED, color: '#fff', fontSize: '9px', fontFamily: 'Oswald, sans-serif', padding: '2px 6px', borderRadius: '10px', zIndex: 2 }}>
            ×{inCart.qty}
          </div>
        )}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '8px 9px' }}>
          <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '8px', letterSpacing: '0.1em', color: '#DE8A2A', margin: '0 0 3px' }}>{product.tag}</p>
          <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', fontWeight: 600, lineHeight: 1.2, color: '#fff', margin: '0 0 6px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.name}</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
            <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', fontWeight: 700, color: '#fff' }}>{product.price}</span>
            <button onClick={() => addToCart(product)} style={{ background: RED, color: '#fff', border: 'none', fontFamily: 'Oswald, sans-serif', fontSize: '9px', letterSpacing: '0.04em', padding: '5px 8px', borderRadius: '2px', cursor: 'pointer' }}>
              {justAdded ? 'ADDED' : 'ADD'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: CANVAS, fontFamily: 'Open Sans, sans-serif', color: '#fff', position: 'relative' }}>
      <style>{`
        .boz-mosaic { display: grid; grid-template-columns: repeat(5, 1fr); gap: 0; }
        .boz-hero-grid { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 32px; align-items: center; }
        @media (max-width: 900px) { .boz-mosaic { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 540px) { .boz-mosaic { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 760px) { .boz-hero-grid { grid-template-columns: 1fr; } }
      `}</style>

      {/* Sticky cart button */}
      {cartCount > 0 && !checkoutOpen && (
        <button
          onClick={() => setCheckoutOpen(true)}
          style={{ position: 'fixed', bottom: '28px', right: '24px', zIndex: 200, display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: RED, color: '#fff', border: 'none', padding: '14px 24px', cursor: 'pointer', fontFamily: 'Oswald, sans-serif', fontSize: '13px', letterSpacing: '0.1em', boxShadow: '0 8px 32px rgba(220,38,38,0.45)' }}
        >
          <ShoppingCart style={{ width: '18px', height: '18px' }} />
          VIEW CART ({cartCount}) — K{cart.reduce((s, i) => s + i.priceNum * i.qty, 0).toLocaleString()}
        </button>
      )}

      {checkoutOpen && (
        <ShopCheckout cart={cart} onClose={closeCheckout} onUpdateQty={updateQty} onRemove={removeItem} />
      )}

      {/* Hero */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        background: `radial-gradient(ellipse 900px 500px at 15% -10%, rgba(220,38,38,0.18), transparent 60%), radial-gradient(ellipse 700px 500px at 100% 0%, rgba(222,138,42,0.14), transparent 60%), ${CANVAS_DEEP}`,
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: 'clamp(40px, 8vh, 64px) clamp(20px, 6vw, 64px)',
      }}>
        <div className="boz-hero-grid" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div>
            <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '11px', letterSpacing: '0.22em', color: RED, marginBottom: '14px' }}>OFFICIAL BUILD ONE ZAMBIA MERCHANDISE</p>
            <h1 style={{ fontFamily: 'Oswald, sans-serif', fontSize: 'clamp(1.8rem, 4.4vw, 3.2rem)', lineHeight: 1.05, letterSpacing: '0.02em', color: '#fff', margin: '0 0 14px', maxWidth: '16ch' }}>
              Wear the vote. Fund the movement.
            </h1>
            <p style={{ color: '#c9cbb8', fontSize: '14px', lineHeight: 1.65, maxWidth: '52ch', margin: '0 0 22px' }}>
              Every kwacha from this store funds ward-level voter outreach and polling-agent kits for the 13 August 2026 general election. Dispatched from Lusaka in days.
            </p>
            <div style={{ display: 'flex', gap: '26px', flexWrap: 'wrap' }}>
              <div style={{ borderLeft: '2px solid #DE8A2A', paddingLeft: '10px' }}>
                <b style={{ display: 'block', fontFamily: 'Oswald, sans-serif', fontSize: '19px', color: '#fff' }}>{PRODUCTS.length}+</b>
                <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '10px', letterSpacing: '0.06em', color: '#9AA189', textTransform: 'uppercase' }}>Catalog items</span>
              </div>
              <div style={{ borderLeft: '2px solid #DE8A2A', paddingLeft: '10px' }}>
                <b style={{ display: 'block', fontFamily: 'Oswald, sans-serif', fontSize: '19px', color: '#fff' }}>3–5d</b>
                <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '10px', letterSpacing: '0.06em', color: '#9AA189', textTransform: 'uppercase' }}>Dispatch time</span>
              </div>
              <div style={{ borderLeft: '2px solid #DE8A2A', paddingLeft: '10px' }}>
                <b style={{ display: 'block', fontFamily: 'Oswald, sans-serif', fontSize: '19px', color: '#fff' }}>K0</b>
                <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '10px', letterSpacing: '0.06em', color: '#9AA189', textTransform: 'uppercase' }}>Platform fee</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 'clamp(180px, 22vw, 260px)', height: 'clamp(180px, 22vw, 260px)', color: '#DE8A2A', transform: 'rotate(-7deg)', filter: 'drop-shadow(0 16px 26px rgba(0,0,0,0.4))' }}>
              <svg viewBox="0 0 220 220" style={{ width: '100%', height: '100%' }}>
                <defs>
                  <path id="bozArcTop" d="M 22 118 A 88 88 0 1 1 198 118" />
                  <path id="bozArcBottom" d="M 40 168 A 88 88 0 0 0 180 168" />
                </defs>
                <circle cx="110" cy="110" r="100" fill="none" stroke="currentColor" strokeWidth="3" />
                <circle cx="110" cy="110" r="86" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 5" opacity="0.7" />
                <text fontFamily="Oswald, sans-serif" fontSize="11.5" letterSpacing="2.5" fill="currentColor">
                  <textPath href="#bozArcTop" startOffset="3">GENERAL ELECTION · ZAMBIA</textPath>
                </text>
                <text fontFamily="Oswald, sans-serif" fontSize="11.5" letterSpacing="2.5" fill="currentColor">
                  <textPath href="#bozArcBottom" startOffset="3">BUILD ONE ZAMBIA</textPath>
                </text>
                <g transform="translate(110 108)">
                  <rect x="-34" y="-24" width="68" height="48" rx="4" fill="none" stroke="currentColor" strokeWidth="3" />
                  <path d="M-18 -2 L-4 12 L20 -16" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                </g>
                <text x="110" y="150" textAnchor="middle" fontFamily="Oswald, sans-serif" fontSize="15" fill="currentColor">13.08.2026</text>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Campaign fund banner */}
      <section style={{ backgroundColor: 'rgba(220,38,38,0.08)', borderBottom: '1px solid rgba(220,38,38,0.2)', padding: '16px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', textAlign: 'center' }}>
          <ShoppingBag style={{ width: '16px', height: '16px', color: RED, flexShrink: 0 }} />
          <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', letterSpacing: '0.08em', color: '#d1d5db', margin: 0 }}>
            ALL PROCEEDS FROM SHOP SALES GO DIRECTLY TO THE <span style={{ color: RED }}>BUILD ONE ZAMBIA CAMPAIGN FUND</span>
          </p>
        </div>
      </section>

      {/* Category strip */}
      <div style={{ backgroundColor: '#12190f', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '14px 16px', display: 'flex', gap: '10px', overflowX: 'auto' }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              style={{ flexShrink: 0, background: activeCategory === cat ? RED : 'transparent', border: `1px solid ${activeCategory === cat ? RED : 'rgba(255,255,255,0.15)'}`, color: activeCategory === cat ? '#fff' : '#AEB49E', borderRadius: '20px', padding: '7px 16px', fontFamily: 'Oswald, sans-serif', fontSize: '11px', letterSpacing: '0.08em', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >{cat}</button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px 0' }}>
        <div style={{ position: 'relative', maxWidth: '420px' }}>
          <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: '#6b7280' }} />
          <input type="text" placeholder="Search merchandise…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', padding: '11px 14px 11px 40px', backgroundColor: '#12190f', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '14px', outline: 'none', fontFamily: 'Open Sans, sans-serif', borderRadius: '2px' }}
          />
        </div>
      </div>

      {/* Product showcase */}
      <section style={{ padding: isFiltering ? '28px 0 90px' : '0 0 90px' }}>
        {isFiltering ? (
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '28px 16px 0' }}>
            {searchFiltered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0', color: '#6b7280' }}>
                <p style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em', fontSize: '1.1rem' }}>No items match your search.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '20px' }}>
                {searchFiltered.map((product, i) => (
                  <ProductCard key={product.id} product={product} tilt={i % 2 === 0 ? 'left' : 'right'} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '28px 16px 14px' }}>
              <span style={{ fontFamily: 'Oswald, sans-serif', fontSize: '10.5px', letterSpacing: '0.14em', color: '#6b7280' }}>THE FULL WALL — {PRODUCTS.length} ITEMS</span>
            </div>
            <div className="boz-mosaic">
              {PRODUCTS.map(product => (
                <MosaicTile key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export { ShopPage as default };
