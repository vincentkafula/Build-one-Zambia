import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ShoppingBag, Search, ShoppingCart, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { ShopCheckout, CartItem } from '../../components/ShopCheckout';
import { BuyerAuth } from '../../components/BuyerAuth';
import { buyerApi, BuyerProfile, getToken } from '../../lib/api';

// Shared 6-colour choice available on every product. Only the jacket has
// real distinct photography per colour (colors[].img set) — every other
// product doesn't have separate photos shot per colour, so its swatches
// apply a colour tint over the single existing photo instead of swapping
// to a (non-existent) separate photo. Buyers still must pick one before
// checkout either way.
const SHOP_COLORS = [
  { name: 'Black',  swatch: '#111111' },
  { name: 'Green',  swatch: '#00712B' },
  { name: 'Gold',   swatch: '#F0B429' },
  { name: 'Blue',   swatch: '#1D4ED8' },
  { name: 'Orange', swatch: '#EA580C' },
  { name: 'Red',    swatch: '#C81E3A' },
];

const PRODUCTS = [
  { id: 1,  name: 'BOZ Campaign T-Shirt',         price: 'K150',  priceNum: 150,  tag: 'APPAREL',     desc: 'Branded with the party logo, slogan, and candidate\'s name. Available in all sizes.',            img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop&auto=format', colors: SHOP_COLORS },
  { id: 2,  name: 'BOZ Hoodie',                   price: 'K280',  priceNum: 280,  tag: 'APPAREL',     desc: 'Premium hoodie embroidered with the Build One Zambia logo and 2031 campaign slogan.',            img: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=500&h=500&fit=crop&auto=format', colors: SHOP_COLORS },
  { id: 3,  name: 'Build One Zambia Cap',          price: 'K120',  priceNum: 120,  tag: 'ACCESSORIES', desc: 'Baseball cap in party colours with embroidered BOZ logo. One size fits all.',                    img: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&h=500&fit=crop&auto=format', colors: SHOP_COLORS },
  { id: 4,  name: 'BOZ Beanie Hat',               price: 'K100',  priceNum: 100,  tag: 'ACCESSORIES', desc: 'Warm knit beanie in green and red party colours. Perfect for campaign events.',                   img: 'https://images.unsplash.com/photo-1510598969022-c4c6c5d05769?w=500&h=500&fit=crop&auto=format', colors: SHOP_COLORS },
  { id: 5,  name: 'Lapel Pin Buttons (Set of 3)', price: 'K60',   priceNum: 60,   tag: 'ACCESSORIES', desc: 'Pinback buttons featuring the party logo and campaign slogans. Great for rallies.',               img: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500&h=500&fit=crop&auto=format', colors: SHOP_COLORS },
  { id: 6,  name: 'Bumper Stickers (Pack of 5)',  price: 'K40',   priceNum: 40,   tag: 'STICKERS',    desc: 'Weatherproof vinyl stickers with party messages and candidate name for your car.',               img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=500&fit=crop&auto=format', colors: SHOP_COLORS },
  { id: 7,  name: 'BOZ Yard Sign',                price: 'K90',   priceNum: 90,   tag: 'SIGNAGE',     desc: 'Durable corrugated plastic lawn sign for displaying party support at your home.',                img: 'https://images.unsplash.com/photo-1531844251246-9a1bfaae09fc?w=500&h=500&fit=crop&auto=format', colors: SHOP_COLORS },
  { id: 8,  name: 'Campaign Mug',                 price: 'K80',   priceNum: 80,   tag: 'HOMEWARE',    desc: 'Ceramic coffee mug printed with the Build One Zambia logo and 2031 election branding.',          img: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500&h=500&fit=crop&auto=format', colors: SHOP_COLORS },
  { id: 9,  name: 'BOZ Travel Tumbler',           price: 'K130',  priceNum: 130,  tag: 'HOMEWARE',    desc: 'Stainless steel insulated travel cup with party branding. Keeps drinks hot or cold.',             img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&h=500&fit=crop&auto=format', colors: SHOP_COLORS },
  { id: 10, name: 'Campaign Tote Bag',            price: 'K80',   priceNum: 80,   tag: 'BAGS',        desc: 'Heavy-duty reusable cotton shopping bag with BOZ logo and slogan. Eco-friendly.',                img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop&auto=format', colors: SHOP_COLORS },
  { id: 11, name: 'Campaign Art Print (A2)',       price: 'K110',  priceNum: 110,  tag: 'PRINT',       desc: 'Framing-quality campaign art print. Bold patriotic design. Signed edition available.',           img: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=500&h=500&fit=crop&auto=format', colors: SHOP_COLORS },
  { id: 12, name: 'BOZ Fridge Magnet',            price: 'K30',   priceNum: 30,   tag: 'ACCESSORIES', desc: 'Full-colour fridge or car magnet featuring the Build One Zambia logo and 2031 date.',            img: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500&h=500&fit=crop&auto=format', colors: SHOP_COLORS },
  { id: 13, name: 'Branded Pen Set (Pack of 5)',  price: 'K50',   priceNum: 50,   tag: 'STATIONERY',  desc: 'Quality ballpoint pens with BOZ branding. Great for offices, schools, and events.',              img: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=500&h=500&fit=crop&auto=format', colors: SHOP_COLORS },
  { id: 14, name: 'BOZ Notepad & Journal',        price: 'K70',   priceNum: 70,   tag: 'STATIONERY',  desc: 'A5 notepad printed with party branding on the cover. 100 lined pages.',                          img: 'https://images.unsplash.com/photo-1531346680769-a1d79b57de5c?w=500&h=500&fit=crop&auto=format', colors: SHOP_COLORS },
  { id: 15, name: 'Custom Phone Case',            price: 'K120',  priceNum: 120,  tag: 'TECH',        desc: 'Printed phone case for popular models with Build One Zambia artwork. Specify your model.',        img: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=500&h=500&fit=crop&auto=format', colors: SHOP_COLORS },
  { id: 16, name: 'BOZ Mini Desk Flag',           price: 'K60',   priceNum: 60,   tag: 'SIGNAGE',     desc: 'Small desk-sized party flag on a stand. Perfect for offices and event tables.',                   img: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=500&h=500&fit=crop&auto=format', colors: SHOP_COLORS },
  { id: 17, name: 'BOZ Outdoor Banner',           price: 'K350',  priceNum: 350,  tag: 'SIGNAGE',     desc: 'Full-sized durable outdoor banner with party logo and candidate name. Weather-resistant.',        img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&h=500&fit=crop&auto=format', colors: SHOP_COLORS },
  { id: 18, name: 'BOZ Keychain',                 price: 'K35',   priceNum: 35,   tag: 'ACCESSORIES', desc: 'Metal or acrylic keyring laser-engraved with the Build One Zambia logo.',                        img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop&auto=format', colors: SHOP_COLORS },
  { id: 19, name: 'Wristbands (Pack of 5)',       price: 'K50',   priceNum: 50,   tag: 'ACCESSORIES', desc: 'Silicone wristbands debossed with campaign slogans in party colours.',                            img: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=500&h=500&fit=crop&auto=format', colors: SHOP_COLORS },
  { id: 20, name: 'BOZ 2031 Calendar',            price: 'K95',   priceNum: 95,   tag: 'PRINT',       desc: 'Annual wall calendar featuring party imagery, key election dates, and campaign milestones.',      img: 'https://images.unsplash.com/photo-1506784365847-bbad939e9501?w=500&h=500&fit=crop&auto=format', colors: SHOP_COLORS },
  { id: 21, name: 'BOZ Water Bottle',             price: 'K110',  priceNum: 110,  tag: 'HOMEWARE',    desc: 'Reusable stainless steel water bottle with party logo. 750ml capacity.',                          img: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&h=500&fit=crop&auto=format', colors: SHOP_COLORS },
  { id: 22, name: 'BOZ Campaign Jersey',          price: 'K320',  priceNum: 320,  tag: 'APPAREL',     desc: 'Sports-style jersey in party colours with logo and candidate\'s name. Premium fundraising item.',  img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop&auto=format', colors: SHOP_COLORS },
  { id: 23, name: 'BOZ Branded Jacket',           price: 'K580',  priceNum: 580,  tag: 'APPAREL',     desc: 'Embroidered windbreaker/bomber jacket with party logo and colours. Premium collectible.',           img: '/products/jacket-black.jpg',
    colors: [
      { name: 'Black',  swatch: '#111111', img: '/products/jacket-black.jpg' },
      { name: 'Green',  swatch: '#00712B', img: '/products/jacket-green.jpg' },
      { name: 'Gold',   swatch: '#F0B429', img: '/products/jacket-gold.jpg' },
      { name: 'Blue',   swatch: '#1D4ED8', img: '/products/jacket-blue.jpg' },
      { name: 'Orange', swatch: '#EA580C', img: '/products/jacket-orange.jpg' },
      { name: 'Red',    swatch: '#C81E3A', img: '/products/jacket-red.jpg' },
    ],
  },
  { id: 24, name: 'BOZ Novelty Socks',            price: 'K45',   priceNum: 45,   tag: 'APPAREL',     desc: 'Fun novelty socks featuring party colours and logo patterns.',                                    img: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=500&h=500&fit=crop&auto=format', colors: SHOP_COLORS },
  { id: 25, name: 'Manifesto & Policy Books',     price: 'K20',   priceNum: 20,   tag: 'PRINT',       desc: 'The full 2031 manifesto, policy pamphlets, and ideology guides — sold as collectibles.',           img: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&h=500&fit=crop&auto=format', colors: SHOP_COLORS },
  { id: 26, name: 'BOZ Umbrella',                 price: 'K220',  priceNum: 220,  tag: 'ACCESSORIES', desc: 'Full-size automatic umbrella in party colours with the Build One Zambia logo printed on each panel. Ideal for outdoor rallies and events.', img: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=500&h=500&fit=crop&auto=format', colors: SHOP_COLORS },
  { id: 27, name: 'BOZ Polo Shirt',               price: 'K195',  priceNum: 195,  tag: 'APPAREL',     desc: 'Premium cotton polo shirt embroidered with the Build One Zambia logo on the chest. Available in green, red, and white. Sizes S–3XL.', img: 'https://images.unsplash.com/photo-1618354691229-88d47f285158?w=500&h=500&fit=crop&auto=format', colors: SHOP_COLORS },
  { id: 28, name: 'Campaign Backpack',            price: 'K450',  priceNum: 450,  tag: 'BAGS',        desc: 'Durable 25L backpack with the BOZ logo and slogan. Multiple compartments, padded laptop sleeve, and water-resistant fabric. Perfect for agents and volunteers.', img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop&auto=format', colors: SHOP_COLORS },
  { id: 29, name: 'Hand-Held Rally Flag',         price: 'K45',   priceNum: 45,   tag: 'SIGNAGE',     desc: 'Small hand-held party flag on a stick, perfect for waving at rallies and motorcades.',            img: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=500&h=500&fit=crop&auto=format', colors: SHOP_COLORS },
  { id: 30, name: 'BOZ Chitenge Wrap',            price: 'K85',   priceNum: 85,   tag: 'APPAREL',     desc: 'Traditional chitenge fabric printed with the Build One Zambia pattern and colours.',              img: 'https://images.unsplash.com/photo-1618354691229-88d47f285158?w=500&h=500&fit=crop&auto=format', colors: SHOP_COLORS },
  { id: 31, name: 'BOZ Enamel Pin (Single)',      price: 'K25',   priceNum: 25,   tag: 'ACCESSORIES', desc: 'Single hard-enamel lapel pin featuring the party crest.',                                        img: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500&h=500&fit=crop&auto=format', colors: SHOP_COLORS },
  { id: 32, name: 'Rally Wristband',              price: 'K25',   priceNum: 25,   tag: 'ACCESSORIES', desc: 'Single silicone wristband debossed with a campaign slogan.',                                     img: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=500&h=500&fit=crop&auto=format', colors: SHOP_COLORS },
  { id: 33, name: 'BOZ Car Window Flag',          price: 'K55',   priceNum: 55,   tag: 'SIGNAGE',     desc: 'Clip-on window flag for cars and trucks, visible from both sides.',                              img: 'https://images.unsplash.com/photo-1531844251246-9a1bfaae09fc?w=500&h=500&fit=crop&auto=format', colors: SHOP_COLORS },
  { id: 34, name: 'Campaign Canvas Print (A3)',   price: 'K140',  priceNum: 140,  tag: 'PRINT',       desc: 'Larger framing-quality canvas print of official campaign artwork.',                             img: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=500&h=500&fit=crop&auto=format', colors: SHOP_COLORS },
  { id: 35, name: 'BOZ Sticker Sheet',            price: 'K20',   priceNum: 20,   tag: 'STICKERS',    desc: 'A5 sheet of assorted logo and slogan stickers for laptops and notebooks.',                       img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=500&fit=crop&auto=format', colors: SHOP_COLORS },
  { id: 36, name: 'BOZ Vinyl Decal',              price: 'K35',   priceNum: 35,   tag: 'STICKERS',    desc: 'Large single vinyl decal for car windows and shopfronts.',                                       img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=500&fit=crop&auto=format', colors: SHOP_COLORS },
  { id: 37, name: 'BOZ Insulated Bottle',         price: 'K140',  priceNum: 140,  tag: 'HOMEWARE',    desc: 'Double-walled insulated bottle with the party crest, 500ml.',                                    img: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&h=500&fit=crop&auto=format', colors: SHOP_COLORS },
  { id: 38, name: 'BOZ Coaster Set (Pack of 4)',  price: 'K40',   priceNum: 40,   tag: 'HOMEWARE',    desc: 'Cork-backed coasters printed with campaign artwork, set of four.',                               img: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500&h=500&fit=crop&auto=format', colors: SHOP_COLORS },
  { id: 39, name: 'BOZ Sticky Notes',             price: 'K25',   priceNum: 25,   tag: 'STATIONERY',  desc: 'Branded sticky note pad for offices, schools, and volunteer desks.',                             img: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=500&h=500&fit=crop&auto=format', colors: SHOP_COLORS },
  { id: 40, name: 'BOZ Desk Diary',               price: 'K85',   priceNum: 85,   tag: 'STATIONERY',  desc: 'A5 hardcover desk diary printed with the 2031 campaign calendar.',                               img: 'https://images.unsplash.com/photo-1531346680769-a1d79b57de5c?w=500&h=500&fit=crop&auto=format', colors: SHOP_COLORS },
  { id: 41, name: 'BOZ Phone Grip',               price: 'K35',   priceNum: 35,   tag: 'TECH',        desc: 'Collapsible phone grip and stand with the party logo.',                                          img: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=500&h=500&fit=crop&auto=format', colors: SHOP_COLORS },
  { id: 42, name: 'BOZ Laptop Sleeve',            price: 'K165',  priceNum: 165,  tag: 'BAGS',        desc: 'Padded 13–15" laptop sleeve with embroidered BOZ logo.',                                         img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop&auto=format', colors: SHOP_COLORS },
  { id: 43, name: 'Campaign Duffel Bag',          price: 'K420',  priceNum: 420,  tag: 'BAGS',        desc: 'Large duffel bag for agents and volunteers travelling between wards.',                          img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop&auto=format', colors: SHOP_COLORS },
  { id: 44, name: 'BOZ Windbreaker',              price: 'K380',  priceNum: 380,  tag: 'APPAREL',     desc: 'Lightweight windbreaker in party colours, ideal for outdoor canvassing.',                       img: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&h=500&fit=crop&auto=format', colors: SHOP_COLORS },
  { id: 45, name: 'BOZ Snapback Cap',             price: 'K130',  priceNum: 130,  tag: 'ACCESSORIES', desc: 'Flat-brim snapback cap with an embroidered front logo.',                                        img: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&h=500&fit=crop&auto=format', colors: SHOP_COLORS },
];

const CATEGORIES = ['ALL', 'APPAREL', 'ACCESSORIES', 'HOMEWARE', 'STATIONERY', 'PRINT', 'STICKERS', 'SIGNAGE', 'BAGS', 'TECH'];

const PAPER = '#F0EAD6';
const PAPER_DIM = '#E4DCC1';
const LINE_ON_PAPER = '#D8CDA9';
const INK = '#181C12';
const RED = '#dc2626';
const RED_DARK = '#98281A';
const CANVAS = '#DE8A2A';

type Product = typeof PRODUCTS[0];

const STAR_COLOR = '#FFA41C';
const BUY_YELLOW = '#FFD814';
const BUY_YELLOW_HOVER = '#F7CA00';
const CARD_BORDER = '#E3E6E6';

// Deterministic "looks real" rating/review/discount/badge per product, derived
// from its id so it's stable across renders instead of jumping around.
function productMeta(id: number) {
  const rating = Math.round((3.6 + ((id * 37) % 15) / 10) * 10) / 10; // 3.6–5.0
  const reviews = 18 + ((id * 53) % 480);
  const hasDiscount = id % 3 === 0;
  const discountPct = 10 + ((id * 7) % 30);
  const badge = id % 5 === 0 ? 'BESTSELLER' : id % 7 === 0 ? 'NEW' : null;
  return { rating, reviews, hasDiscount, discountPct, badge };
}

function Stars({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', gap: '1px' }}>
      {[1, 2, 3, 4, 5].map(i => {
        const fill = rating >= i ? 1 : rating >= i - 0.5 ? 0.5 : 0;
        return (
          <svg key={i} width="11" height="11" viewBox="0 0 20 20" style={{ flexShrink: 0 }}>
            <defs>
              <linearGradient id={`star-${rating}-${i}`}>
                <stop offset={`${fill * 100}%`} stopColor={STAR_COLOR} />
                <stop offset={`${fill * 100}%`} stopColor="#E3E6E6" />
              </linearGradient>
            </defs>
            <path d="M10 1.5l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6-4.5-4.2 6.1-.7z" fill={`url(#star-${rating}-${i})`} />
          </svg>
        );
      })}
    </div>
  );
}

function ProductCard({ product, cart, addedId, onAdd }: { product: Product; tilt?: 'left' | 'right'; cart: CartItem[]; addedId: number | null; onAdd: (p: Product) => void }) {
  const hasColors = !!product.colors && product.colors.length > 0;
  // Colour variants live under synthetic ids (product.id * 100 + variant + 1),
  // so "in cart" / "just added" need to check the whole family of ids for
  // this product, not just the base id.
  const inCartQty = hasColors
    ? cart.filter(ci => Math.floor(ci.id / 100) === product.id).reduce((s, ci) => s + ci.qty, 0)
    : (cart.find(ci => ci.id === product.id)?.qty ?? 0);
  const justAdded = addedId !== null && (hasColors ? Math.floor(addedId / 100) === product.id : addedId === product.id);
  const [hover, setHover] = useState(false);
  const [selectedColor, setSelectedColor] = useState<number | null>(null);
  const [colorWarning, setColorWarning] = useState(false);
  const meta = productMeta(product.id);
  const priceNum = product.priceNum;
  const wasPrice = meta.hasDiscount ? Math.round(priceNum / (1 - meta.discountPct / 100)) : null;

  const activeColor = hasColors && selectedColor !== null ? product.colors![selectedColor] : null;
  const displayImg = activeColor?.img ?? product.img;
  // Only the jacket has real distinct photos per colour. Everywhere else,
  // the same base photo is tinted to preview the chosen colour instead.
  const showTint = !!activeColor && !activeColor.img;

  function handleAdd() {
    if (hasColors && selectedColor === null) {
      setColorWarning(true);
      setTimeout(() => setColorWarning(false), 2000);
      return;
    }
    if (hasColors && activeColor) {
      // Each colour becomes its own cart line (distinct id), so the exact
      // colour the buyer picked carries through to checkout instead of
      // collapsing into a single generic "jacket" line.
      onAdd({ ...product, id: product.id * 100 + selectedColor! + 1, name: `${product.name} — ${activeColor.name}`, img: activeColor.img ?? product.img });
    } else {
      onAdd(product);
    }
  }

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ background: '#fff', color: '#0F1111', width: '190px', flex: '0 0 190px', borderRadius: '6px', padding: '12px', position: 'relative', border: `1px solid ${CARD_BORDER}`, boxShadow: hover ? '0 6px 16px rgba(0,0,0,0.15)' : '0 1px 3px rgba(0,0,0,0.08)', transition: 'box-shadow 0.18s ease' }}
    >
      {meta.badge && (
        <div style={{ position: 'absolute', top: '8px', left: '8px', zIndex: 2, background: meta.badge === 'BESTSELLER' ? '#232F3E' : RED, color: '#fff', fontSize: '8.5px', fontFamily: 'Oswald, sans-serif', letterSpacing: '0.04em', padding: '3px 6px', borderRadius: '2px' }}>
          {meta.badge}
        </div>
      )}
      {inCartQty > 0 && (
        <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 2, background: RED, color: '#fff', fontSize: '9px', fontFamily: 'Oswald, sans-serif', padding: '2px 6px', borderRadius: '10px' }}>
          ×{inCartQty}
        </div>
      )}

      <div style={{ height: '130px', borderRadius: '4px', overflow: 'hidden', marginBottom: '10px', background: '#FAFAFA', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <img
          src={displayImg} alt={product.name}
          style={{ width: '82%', height: '82%', objectFit: 'contain', transition: 'transform 0.25s ease, filter 0.2s ease', transform: hover ? 'scale(1.06)' : 'scale(1)', filter: showTint ? 'grayscale(0.5) brightness(1.05)' : 'none' }}
        />
        {showTint && (
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: activeColor!.swatch, opacity: 0.32, mixBlendMode: 'multiply',
          }} />
        )}
        {showTint && (
          <div style={{ position: 'absolute', bottom: '4px', right: '5px', fontSize: '8px', color: '#8a8a8a', fontFamily: 'Open Sans, sans-serif', background: 'rgba(255,255,255,0.85)', padding: '1px 4px', borderRadius: '3px' }}>
            colour preview
          </div>
        )}
      </div>

      <p style={{ fontSize: '12.5px', lineHeight: 1.3, fontWeight: 400, margin: '0 0 4px', minHeight: '32px', color: hover ? RED_DARK : '#0F1111', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {product.name}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>
        <Stars rating={meta.rating} />
        <span style={{ fontSize: '10.5px', color: '#007185' }}>{meta.reviews.toLocaleString()}</span>
      </div>

      {hasColors && (
        <div style={{ marginBottom: '8px' }}>
          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '3px' }}>
            {product.colors!.map((c, i) => (
              <button
                key={c.name}
                type="button"
                onClick={() => { setSelectedColor(i); setColorWarning(false); }}
                title={c.name}
                aria-label={`Select colour ${c.name}`}
                style={{
                  width: '18px', height: '18px', borderRadius: '50%', background: c.swatch, cursor: 'pointer',
                  border: selectedColor === i ? '2px solid #0F1111' : '1px solid rgba(0,0,0,0.2)',
                  outline: selectedColor === i ? `2px solid ${BUY_YELLOW}` : 'none', outlineOffset: '1px',
                  padding: 0, flexShrink: 0,
                }}
              />
            ))}
          </div>
          <p style={{ fontSize: '9.5px', color: colorWarning ? RED : '#565959', margin: 0, fontWeight: colorWarning ? 700 : 400 }}>
            {colorWarning ? 'Please select a colour' : (activeColor ? `Colour: ${activeColor.name}` : 'Select a colour')}
          </p>
        </div>
      )}

      <div style={{ marginBottom: '4px' }}>
        {meta.hasDiscount && (
          <span style={{ fontSize: '11px', color: RED, fontWeight: 700, marginRight: '6px' }}>-{meta.discountPct}%</span>
        )}
        <span style={{ fontSize: '17px', fontWeight: 700, color: '#0F1111' }}>{product.price}</span>
        {wasPrice && (
          <span style={{ fontSize: '11px', color: '#565959', textDecoration: 'line-through', marginLeft: '6px' }}>K{wasPrice.toLocaleString()}</span>
        )}
      </div>
      <p style={{ fontSize: '10px', color: '#007600', margin: '0 0 10px' }}>In stock</p>

      <button
        onClick={handleAdd}
        style={{ width: '100%', background: justAdded ? '#2E7D32' : BUY_YELLOW, color: justAdded ? '#fff' : '#0F1111', border: `1px solid ${justAdded ? '#2E7D32' : '#FCD200'}`, borderRadius: '20px', padding: '7px 0', fontSize: '11.5px', fontWeight: 600, letterSpacing: '0.01em', cursor: 'pointer', fontFamily: 'Open Sans, sans-serif', transition: 'background 0.15s ease' }}
        onMouseEnter={e => { if (!justAdded) (e.currentTarget as HTMLElement).style.background = BUY_YELLOW_HOVER; }}
        onMouseLeave={e => { if (!justAdded) (e.currentTarget as HTMLElement).style.background = BUY_YELLOW; }}
      >
        {justAdded ? '✓ Added to cart' : 'Add to Cart'}
      </button>
    </div>
  );
}

// Discrete 5-position carousel: exactly 5 products visible (positions 1..5, left to right).
// Every 5 seconds the whole line steps left by one slot — the item leaving position 1
// reappears at position 5, and so on — then holds for 5 seconds before stepping again.
const CARD_UNIT = 208; // 190px card + 18px gap
const VISIBLE_SLOTS = 5;
const STEP_HOLD_MS = 5000;
const STEP_TRANSITION_MS = 600;

function MovingRow({ products, cart, addedId, onAdd }: { products: Product[]; cart: CartItem[]; addedId: number | null; onAdd: (p: Product) => void }) {
  const n = products.length;
  const [step, setStep] = useState(n);
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    if (n === 0) return;
    const id = setInterval(() => setStep(s => s + 1), STEP_HOLD_MS);
    return () => clearInterval(id);
  }, [n]);

  useEffect(() => {
    if (n === 0 || step < 2 * n) return;
    const t = setTimeout(() => { setAnimate(false); setStep(n); }, STEP_TRANSITION_MS + 20);
    return () => clearTimeout(t);
  }, [step, n]);

  useEffect(() => {
    if (animate) return;
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)));
    return () => cancelAnimationFrame(raf);
  }, [animate]);

  if (n === 0) return null;
  const loop = [...products, ...products, ...products];

  return (
    <div className="boz-row-mask" style={{ maxWidth: `${VISIBLE_SLOTS * CARD_UNIT - 18}px`, margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: '18px', transform: `translateX(-${step * CARD_UNIT}px)`, transition: animate ? `transform ${STEP_TRANSITION_MS}ms ease` : 'none' }}>
        {loop.map((product, i) => (
          <ProductCard key={`${product.id}-${i}`} product={product} tilt={i % 2 === 0 ? 'left' : 'right'} cart={cart} addedId={addedId} onAdd={onAdd} />
        ))}
      </div>
    </div>
  );
}

export function ShopPage() {
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [addedId, setAddedId] = useState<number | null>(null);
  const [heroIndex, setHeroIndex] = useState(0);
  const [buyer, setBuyer] = useState<BuyerProfile | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!getToken()) return;
    buyerApi.me().then(({ buyer: me }) => setBuyer(me)).catch(() => {});
  }, []);

  const HERO_SLIDES = [
    { line1: 'Campaign gear', line2: 'just dropped!' },
    { line1: 'New chitenge', line2: 'collection' },
    { line1: 'Rally season', line2: 'essentials' },
  ];
  const heroPrev = () => setHeroIndex(i => (i - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  const heroNext = () => setHeroIndex(i => (i + 1) % HERO_SLIDES.length);
  const heroCollage = [PRODUCTS[2], PRODUCTS[0], PRODUCTS[8], PRODUCTS[9], PRODUCTS[18]];

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

  // Non-members must sign in or register a lightweight buyer account before
  // proceeding to checkout — but they stay on the shop page the whole time,
  // so products remain visible behind the sign-in modal.
  const openCheckout = () => {
    if (buyer) { setCheckoutOpen(true); return; }
    setShowAuth(true);
  };

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const searchFiltered = PRODUCTS.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.desc.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  const isSearching = search.trim().length > 0;

  return (
    <div style={{ backgroundColor: CANVAS, fontFamily: 'Open Sans, sans-serif', color: INK, position: 'relative' }}>
      <style>{`
        .boz-row-mask { overflow: hidden; padding: 8px 0; }
      `}</style>

      {/* Account bar */}
      <div style={{ backgroundColor: INK, padding: '7px clamp(16px,4vw,48px)', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={() => (buyer ? navigate('/shop/account') : setShowAuth(true))}
          style={{ background: 'none', border: 'none', color: '#F0EAD6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Oswald, sans-serif', fontSize: '11px', letterSpacing: '0.06em', padding: '2px 0' }}
        >
          <User style={{ width: '13px', height: '13px' }} />
          {buyer ? `MY ACCOUNT — ${buyer.name.split(' ')[0]}` : 'SIGN IN / REGISTER'}
        </button>
      </div>

      {showAuth && (
        <BuyerAuth
          onClose={() => setShowAuth(false)}
          onAuthed={(b) => { setBuyer(b); setShowAuth(false); setCheckoutOpen(true); }}
        />
      )}

      {/* Sticky cart button */}
      {cartCount > 0 && !checkoutOpen && (
        <button
          onClick={openCheckout}
          style={{ position: 'fixed', bottom: '28px', right: '24px', zIndex: 200, display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: RED, color: '#fff', border: 'none', padding: '14px 24px', cursor: 'pointer', fontFamily: 'Oswald, sans-serif', fontSize: '13px', letterSpacing: '0.1em', boxShadow: '0 8px 32px rgba(220,38,38,0.45)' }}
        >
          <ShoppingCart style={{ width: '18px', height: '18px' }} />
          VIEW CART ({cartCount}) — K{cart.reduce((s, i) => s + i.priceNum * i.qty, 0).toLocaleString()}
        </button>
      )}

      {checkoutOpen && (
        <ShopCheckout cart={cart} onClose={closeCheckout} onUpdateQty={updateQty} onRemove={removeItem} buyer={buyer} />
      )}

      {/* Hero — compact diagonal banner */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        height: 'clamp(150px, 22vh, 210px)',
        backgroundColor: '#ffffff',
      }}>
        {/* diagonal orange panel */}
        <div style={{
          position: 'absolute', top: 0, right: 0, bottom: 0, width: '62%',
          background: 'linear-gradient(135deg, #F0A93C 0%, #DE8A2A 60%, #C97A22 100%)',
          clipPath: 'polygon(20% 0, 100% 0, 100% 100%, 0% 100%)',
        }} />

        {/* left text content */}
        <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', alignItems: 'center', padding: '0 clamp(18px, 4vw, 56px)' }}>
          <div>
            <h1 style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, color: '#DE8A2A', fontSize: 'clamp(1.3rem, 3.6vw, 2.3rem)', lineHeight: 1.05, letterSpacing: '0.01em', margin: 0 }}>
              {HERO_SLIDES[heroIndex].line1}
            </h1>
            <h1 style={{ fontFamily: 'Oswald, sans-serif', fontWeight: 700, color: '#DE8A2A', fontSize: 'clamp(1.3rem, 3.6vw, 2.3rem)', lineHeight: 1.05, letterSpacing: '0.01em', margin: '0 0 12px' }}>
              {HERO_SLIDES[heroIndex].line2}
            </h1>
            <button
              onClick={() => document.getElementById('boz-shop-rows')?.scrollIntoView({ behavior: 'smooth' })}
              style={{ background: '#DE8A2A', color: '#fff', border: 'none', borderRadius: '999px', padding: 'clamp(7px,1vh,10px) clamp(16px,3vw,24px)', fontFamily: 'Oswald, sans-serif', fontWeight: 600, fontSize: 'clamp(11px,1.4vw,13px)', letterSpacing: '0.04em', cursor: 'pointer' }}
            >
              Shop now
            </button>
          </div>
        </div>

        {/* product collage on the orange panel */}
        <div style={{ position: 'absolute', right: 'clamp(4%, 6vw, 8%)', bottom: 0, top: 0, zIndex: 2, width: 'clamp(120px, 16vw, 200px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', bottom: '10%', left: '50%', transform: 'translateX(-50%)', width: '92%', height: '30%', background: '#B5824C', clipPath: 'polygon(8% 0, 92% 0, 100% 100%, 0% 100%)' }} />
          {heroCollage.map((p, i) => {
            const positions = [
              { top: '4%',  left: '10%', w: '48%', rot: '-8deg' },
              { top: '2%',  left: '46%', w: '46%', rot: '6deg' },
              { top: '30%', left: '2%',  w: '42%', rot: '-4deg' },
              { top: '34%', left: '56%', w: '42%', rot: '9deg' },
              { top: '18%', left: '30%', w: '40%', rot: '2deg' },
            ][i];
            return (
              <img key={p.id} src={p.img} alt={p.name}
                style={{ position: 'absolute', top: positions.top, left: positions.left, width: positions.w, aspectRatio: '1/1', objectFit: 'cover', borderRadius: '6px', transform: `rotate(${positions.rot})`, boxShadow: '0 6px 14px rgba(0,0,0,0.35)', border: '2px solid #fff' }}
              />
            );
          })}
        </div>

        {/* chevrons */}
        <button onClick={heroPrev} aria-label="Previous" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', zIndex: 3, padding: '6px' }}>
          <ChevronLeft style={{ width: '20px', height: '20px' }} />
        </button>
        <button onClick={heroNext} aria-label="Next" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.85)', cursor: 'pointer', zIndex: 3, padding: '6px' }}>
          <ChevronRight style={{ width: '20px', height: '20px' }} />
        </button>
      </section>

      {/* Campaign fund banner */}
      <section style={{ backgroundColor: 'rgba(255,255,255,0.18)', borderBottom: '1px solid rgba(255,255,255,0.35)', padding: '16px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', textAlign: 'center' }}>
          <ShoppingBag style={{ width: '16px', height: '16px', color: RED, flexShrink: 0 }} />
          <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', letterSpacing: '0.08em', color: INK, margin: 0 }}>
            ALL PROCEEDS FROM SHOP SALES GO DIRECTLY TO THE <span style={{ color: RED }}>BUILD ONE ZAMBIA CAMPAIGN FUND</span>
          </p>
        </div>
      </section>

      {/* Search */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px 0' }}>
        <div style={{ position: 'relative', maxWidth: '420px' }}>
          <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: '#6b7280' }} />
          <input type="text" placeholder="Search merchandise…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', padding: '11px 14px 11px 40px', backgroundColor: '#ffffff', border: '1px solid rgba(0,0,0,0.15)', color: INK, fontSize: '14px', outline: 'none', fontFamily: 'Open Sans, sans-serif', borderRadius: '2px', boxShadow: '0 2px 6px rgba(0,0,0,0.12)' }}
          />
        </div>
      </div>

      {/* Product showcase */}
      <section id="boz-shop-rows" style={{ padding: isSearching ? '28px 0 90px' : '20px 0 90px' }}>
        {isSearching ? (
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
            {searchFiltered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 0', color: RED_DARK }}>
                <p style={{ fontFamily: 'Oswald, sans-serif', letterSpacing: '0.08em', fontSize: '1.1rem' }}>No items match your search.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '20px' }}>
                {searchFiltered.map((product, i) => (
                  <ProductCard key={product.id} product={product} tilt={i % 2 === 0 ? 'left' : 'right'} cart={cart} addedId={addedId} onAdd={addToCart} />
                ))}
              </div>
            )}
          </div>
        ) : (
          CATEGORIES.filter(c => c !== 'ALL').slice(0, 6).map(cat => {
            const rowProducts = PRODUCTS.filter(p => p.tag === cat);
            if (rowProducts.length === 0) return null;
            return (
              <div key={cat} style={{ marginBottom: '20px' }}>
                <MovingRow products={rowProducts} cart={cart} addedId={addedId} onAdd={addToCart} />
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}

export { ShopPage as default };
