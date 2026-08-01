import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router';
import { ShoppingBag, Search, ShoppingCart, ChevronLeft, ChevronRight, User } from 'lucide-react';
import { ShopCheckout, CartItem } from '../../components/ShopCheckout';
import { BuyerAuth } from '../../components/BuyerAuth';
import { WaveBackground } from '../../components/WaveBackground';
import { buyerApi, BuyerProfile, getToken } from '../../lib/api';

// Shared 6-colour choice available on every product. Only the jacket has
// real distinct photography per colour (colors[].img set) — every other
// product doesn't have separate photos shot per colour, so its swatches
// apply a colour tint over the single existing photo instead of swapping
// to a (non-existent) separate photo. Buyers still must pick one before
// checkout either way.
export const SHOP_COLORS = [
  { name: 'Black',  swatch: '#111111' },
  { name: 'Green',  swatch: '#00712B' },
  { name: 'Gold',   swatch: '#F0B429' },
  { name: 'Blue',   swatch: '#1D4ED8' },
  { name: 'Orange', swatch: '#EA580C' },
  { name: 'Red',    swatch: '#C81E3A' },
];

// A light, mostly-white version of a colour swatch, used as the backdrop
// behind a product image once that colour is selected — so picking a
// colour changes both the product itself (tint overlay) and the space
// around it, not just the product.
export function tintBackground(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const mix = (c: number) => Math.round(c * 0.12 + 255 * 0.88);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

export const PRODUCTS = [
  { id: 1,  name: 'BOZ Campaign T-Shirt',         price: 'K150',  priceNum: 150,  tag: 'APPAREL',     desc: 'Branded with the party logo, slogan, and candidate\'s name. Available in all sizes.',            img: '/products/tshirt-gold.png',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Gold',   swatch: '#F0B429', img: '/products/tshirt-gold.png' },
      { name: 'White',  swatch: '#FFFFFF', img: '/products/tshirt-white.png' },
      { name: 'Green',  swatch: '#00712B', img: '/products/tshirt-green.png' },
      { name: 'Black',  swatch: '#111111', img: '/products/tshirt-black.png' },
      { name: 'Blue',   swatch: '#1D4ED8', img: '/products/tshirt-blue.png' },
      { name: 'Gray',   swatch: '#9CA3AF', img: '/products/tshirt-gray.png' },
    ],
  },
  { id: 2,  name: 'BOZ Hoodie',                   price: 'K280',  priceNum: 280,  tag: 'APPAREL',     desc: 'Premium hoodie embroidered with the Build One Zambia logo and 2031 campaign slogan.',            img: '/products/hoodie-green.png',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Green',  swatch: '#00712B', img: '/products/hoodie-green.png' },
      { name: 'Orange', swatch: '#EA580C', img: '/products/hoodie-orange.png' },
      { name: 'Black',  swatch: '#111111', img: '/products/hoodie-black.png' },
      { name: 'Navy',   swatch: '#1e3a5f', img: '/products/hoodie-navy.png' },
      { name: 'White',  swatch: '#FFFFFF', img: '/products/hoodie-white.png' },
      { name: 'Gray',   swatch: '#4b5563', img: '/products/hoodie-gray.png' },
    ],
  },
  { id: 3,  name: 'Build One Zambia Cap',          price: 'K120',  priceNum: 120,  tag: 'ACCESSORIES', desc: 'Baseball cap in party colours with embroidered BOZ logo. One size fits all.',                    img: '/products/cap-green.png', colors: [SHOP_COLORS[0], { name: 'Green', swatch: '#00712B', img: '/products/cap-green.png' }, ...SHOP_COLORS.slice(2)] },
  { id: 4,  name: 'BOZ Beanie Hat',               price: 'K100',  priceNum: 100,  tag: 'ACCESSORIES', desc: 'Warm knit beanie in green and red party colours. Perfect for campaign events.',                   img: '/products/beanie-black.png', colors: [{ name: 'Black', swatch: '#111111', img: '/products/beanie-black.png' }, ...SHOP_COLORS.slice(1)] },
  { id: 5,  name: 'Lapel Pin Buttons (Set of 3)', price: 'K60',   priceNum: 60,   tag: 'ACCESSORIES', desc: 'Pinback buttons featuring the party logo and campaign slogans. Great for rallies.',               img: '/products/pins-color.png', colors: SHOP_COLORS },
  { id: 6,  name: 'Bumper Stickers (Pack of 5)',  price: 'K40',   priceNum: 40,   tag: 'STICKERS',    desc: 'Weatherproof vinyl stickers with party messages and candidate name for your car.',               img: '/products/sticker-green.png', colors: [
      { name: 'Green',  swatch: '#00712B', img: '/products/sticker-green.png' },
      { name: 'Orange', swatch: '#EA580C', img: '/products/sticker-orange.png' },
      { name: 'Blue',   swatch: '#1D4ED8', img: '/products/sticker-blue.png' },
      { name: 'Red',    swatch: '#C81E3A', img: '/products/sticker-red.png' },
      { name: 'Black',  swatch: '#111111', img: '/products/sticker-black.png' },
      { name: 'Yellow', swatch: '#F0B429', img: '/products/sticker-yellow.png' },
    ] },
  { id: 7,  name: 'BOZ Yard Sign',                price: 'K90',   priceNum: 90,   tag: 'SIGNAGE',     desc: 'Durable corrugated plastic lawn sign for displaying party support at your home.',                img: 'https://images.unsplash.com/photo-1531844251246-9a1bfaae09fc?w=500&h=500&fit=crop&auto=format', colors: SHOP_COLORS },
  { id: 8,  name: 'Campaign Mug',                 price: 'K80',   priceNum: 80,   tag: 'HOMEWARE',    desc: 'Ceramic coffee mug printed with the Build One Zambia logo and 2031 election branding.',          img: '/products/mug-green.png', colors: [
      { name: 'Green',  swatch: '#00712B', img: '/products/mug-green.png' },
      { name: 'Orange', swatch: '#EA580C', img: '/products/mug-orange.png' },
      { name: 'Black',  swatch: '#111111', img: '/products/mug-black.png' },
      { name: 'Blue',   swatch: '#1D4ED8', img: '/products/mug-blue.png' },
      { name: 'Red',    swatch: '#C81E3A', img: '/products/mug-red.png' },
      { name: 'Yellow', swatch: '#F0B429', img: '/products/mug-yellow.png' },
    ] },
  { id: 9,  name: 'BOZ Travel Tumbler',           price: 'K130',  priceNum: 130,  tag: 'HOMEWARE',    desc: 'Stainless steel insulated travel cup with party branding. Keeps drinks hot or cold.',             img: '/products/tumbler-green.png', colors: [
      { name: 'Green',  swatch: '#00712B', img: '/products/tumbler-green.png' },
      { name: 'Orange', swatch: '#EA580C', img: '/products/tumbler-orange.png' },
      { name: 'Blue',   swatch: '#1D4ED8', img: '/products/tumbler-blue.png' },
      { name: 'Red',    swatch: '#C81E3A', img: '/products/tumbler-red.png' },
      { name: 'Black',  swatch: '#111111', img: '/products/tumbler-black.png' },
      { name: 'Yellow', swatch: '#F0B429', img: '/products/tumbler-yellow.png' },
    ] },
  { id: 10, name: 'Campaign Tote Bag',            price: 'K80',   priceNum: 80,   tag: 'BAGS',        desc: 'Heavy-duty reusable cotton shopping bag with BOZ logo and slogan. Eco-friendly.',                img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop&auto=format', colors: SHOP_COLORS },
  { id: 11, name: 'Campaign Art Print (A2)',       price: 'K110',  priceNum: 110,  tag: 'PRINT',       desc: 'Framing-quality campaign art print. Bold patriotic design. Signed edition available.',           img: '/products/art-green.png', colors: [
      { name: 'Green',  swatch: '#00712B', img: '/products/art-green.png' },
      { name: 'Orange', swatch: '#EA580C', img: '/products/art-orange.png' },
      { name: 'Blue',   swatch: '#1D4ED8', img: '/products/art-blue.png' },
      { name: 'Red',    swatch: '#C81E3A', img: '/products/art-red.png' },
      { name: 'Black',  swatch: '#111111', img: '/products/art-black.png' },
      { name: 'Yellow', swatch: '#F0B429', img: '/products/art-yellow.png' },
    ] },
  { id: 12, name: 'BOZ Fridge Magnet',            price: 'K30',   priceNum: 30,   tag: 'ACCESSORIES', desc: 'Full-colour fridge or car magnet featuring the Build One Zambia logo and 2031 date.',            img: '/products/magnet-color.png', colors: SHOP_COLORS },
  { id: 13, name: 'Branded Pen Set (Pack of 5)',  price: 'K50',   priceNum: 50,   tag: 'STATIONERY',  desc: 'Quality ballpoint pens with BOZ branding. Great for offices, schools, and events.',              img: '/products/pen-green.png', colors: [
      { name: 'Green',  swatch: '#00712B', img: '/products/pen-green.png' },
      { name: 'Orange', swatch: '#EA580C', img: '/products/pen-orange.png' },
      { name: 'Blue',   swatch: '#1D4ED8', img: '/products/pen-blue.png' },
      { name: 'Red',    swatch: '#C81E3A', img: '/products/pen-red.png' },
      { name: 'Black',  swatch: '#111111', img: '/products/pen-black.png' },
      { name: 'Yellow', swatch: '#F0B429', img: '/products/pen-yellow.png' },
    ] },
  { id: 14, name: 'BOZ Notepad & Journal',        price: 'K70',   priceNum: 70,   tag: 'STATIONERY',  desc: 'A5 notepad printed with party branding on the cover. 100 lined pages.',                          img: '/products/notepad-green.png', colors: [
      { name: 'Green',  swatch: '#00712B', img: '/products/notepad-green.png' },
      { name: 'Orange', swatch: '#EA580C', img: '/products/notepad-orange.png' },
      { name: 'Blue',   swatch: '#1D4ED8', img: '/products/notepad-blue.png' },
      { name: 'Red',    swatch: '#C81E3A', img: '/products/notepad-red.png' },
      { name: 'Black',  swatch: '#111111', img: '/products/notepad-black.png' },
      { name: 'Yellow', swatch: '#F0B429', img: '/products/notepad-yellow.png' },
    ] },
  { id: 15, name: 'Custom Phone Case',            price: 'K120',  priceNum: 120,  tag: 'TECH',        desc: 'Printed phone case for popular models with Build One Zambia artwork. Specify your model.',        img: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=500&h=500&fit=crop&auto=format', colors: SHOP_COLORS },
  { id: 16, name: 'BOZ Mini Desk Flag',           price: 'K60',   priceNum: 60,   tag: 'SIGNAGE',     desc: 'Small desk-sized party flag on a stand. Perfect for offices and event tables.',                   img: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=500&h=500&fit=crop&auto=format', colors: SHOP_COLORS },
  { id: 17, name: 'BOZ Outdoor Banner',           price: 'K350',  priceNum: 350,  tag: 'SIGNAGE',     desc: 'Full-sized durable outdoor banner with party logo and candidate name. Weather-resistant.',        img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&h=500&fit=crop&auto=format', colors: SHOP_COLORS },
  { id: 18, name: 'BOZ Keychain',                 price: 'K35',   priceNum: 35,   tag: 'ACCESSORIES', desc: 'Metal or acrylic keyring laser-engraved with the Build One Zambia logo.',                        img: '/products/keychain-color.png', colors: SHOP_COLORS },
  { id: 19, name: 'Wristbands (Pack of 5)',       price: 'K50',   priceNum: 50,   tag: 'ACCESSORIES', desc: 'Silicone wristbands debossed with campaign slogans in party colours.',                            img: '/products/wristbands5-color.png', colors: SHOP_COLORS },
  { id: 20, name: 'BOZ 2031 Calendar',            price: 'K95',   priceNum: 95,   tag: 'PRINT',       desc: 'Annual wall calendar featuring party imagery, key election dates, and campaign milestones.',      img: '/products/calendar-green.png', colors: [
      { name: 'Green',  swatch: '#00712B', img: '/products/calendar-green.png' },
      { name: 'Orange', swatch: '#EA580C', img: '/products/calendar-orange.png' },
      { name: 'Blue',   swatch: '#1D4ED8', img: '/products/calendar-blue.png' },
      { name: 'Red',    swatch: '#C81E3A', img: '/products/calendar-red.png' },
      { name: 'Black',  swatch: '#111111', img: '/products/calendar-black.png' },
      { name: 'Yellow', swatch: '#F0B429', img: '/products/calendar-yellow.png' },
    ] },
  { id: 21, name: 'BOZ Water Bottle',             price: 'K110',  priceNum: 110,  tag: 'HOMEWARE',    desc: 'Reusable stainless steel water bottle with party logo. 750ml capacity.',                          img: '/products/bottle-green.png', colors: [
      { name: 'Green',  swatch: '#00712B', img: '/products/bottle-green.png' },
      { name: 'Orange', swatch: '#EA580C', img: '/products/bottle-orange.png' },
      { name: 'Blue',   swatch: '#1D4ED8', img: '/products/bottle-blue.png' },
      { name: 'Red',    swatch: '#C81E3A', img: '/products/bottle-red.png' },
      { name: 'Black',  swatch: '#111111', img: '/products/bottle-black.png' },
      { name: 'Yellow', swatch: '#F0B429', img: '/products/bottle-yellow.png' },
    ] },
  { id: 22, name: 'BOZ Campaign Jersey',          price: 'K320',  priceNum: 320,  tag: 'APPAREL',     desc: 'Sports-style jersey in party colours with logo and candidate\'s name. Premium fundraising item.',  img: '/products/jersey-green.png',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Green',  swatch: '#00712B', img: '/products/jersey-green.png' },
      { name: 'Orange', swatch: '#EA580C', img: '/products/jersey-orange.png' },
      { name: 'Black',  swatch: '#111111', img: '/products/jersey-black.png' },
      { name: 'White',  swatch: '#FFFFFF', img: '/products/jersey-white.png' },
      { name: 'Blue',   swatch: '#1D4ED8', img: '/products/jersey-blue.png' },
      { name: 'Gray',   swatch: '#4b5563', img: '/products/jersey-gray.png' },
    ],
  },
  { id: 23, name: 'BOZ Branded Jacket',           price: 'K580',  priceNum: 580,  tag: 'APPAREL',     desc: 'Embroidered windbreaker/bomber jacket with party logo and colours. Premium collectible.',           img: '/products/jacket-black.png',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Black',  swatch: '#111111', img: '/products/jacket-black.png' },
      { name: 'Green',  swatch: '#00712B', img: '/products/jacket-green.png' },
      { name: 'Gold',   swatch: '#F0B429', img: '/products/jacket-gold.png' },
      { name: 'Blue',   swatch: '#1D4ED8', img: '/products/jacket-blue.png' },
      { name: 'Orange', swatch: '#EA580C', img: '/products/jacket-orange.png' },
      { name: 'Red',    swatch: '#C81E3A', img: '/products/jacket-red.png' },
    ],
  },
  { id: 24, name: 'BOZ Novelty Socks',            price: 'K45',   priceNum: 45,   tag: 'APPAREL',     desc: 'Fun novelty socks featuring party colours and logo patterns.',                                    img: '/products/socks-green.png',
    colors: [
      { name: 'Green',  swatch: '#00712B', img: '/products/socks-green.png' },
      { name: 'Orange', swatch: '#EA580C', img: '/products/socks-orange.png' },
      { name: 'Black',  swatch: '#111111', img: '/products/socks-black.png' },
      { name: 'White',  swatch: '#FFFFFF', img: '/products/socks-white.png' },
      { name: 'Navy',   swatch: '#1e3a5f', img: '/products/socks-navy.png' },
      { name: 'Gray',   swatch: '#6b7280', img: '/products/socks-gray.png' },
    ],
  },
  { id: 25, name: 'Manifesto & Policy Books',     price: 'K20',   priceNum: 20,   tag: 'PRINT',       desc: 'The full 2031 manifesto, policy pamphlets, and ideology guides — sold as collectibles.',           img: '/products/book-green.png', colors: [
      { name: 'Green',  swatch: '#00712B', img: '/products/book-green.png' },
      { name: 'Orange', swatch: '#EA580C', img: '/products/book-orange.png' },
      { name: 'Blue',   swatch: '#1D4ED8', img: '/products/book-blue.png' },
      { name: 'Red',    swatch: '#C81E3A', img: '/products/book-red.png' },
      { name: 'Black',  swatch: '#111111', img: '/products/book-black.png' },
      { name: 'Yellow', swatch: '#F0B429', img: '/products/book-yellow.png' },
    ] },
  { id: 26, name: 'BOZ Umbrella',                 price: 'K220',  priceNum: 220,  tag: 'ACCESSORIES', desc: 'Full-size automatic umbrella in party colours with the Build One Zambia logo printed on each panel. Ideal for outdoor rallies and events.', img: '/products/umbrella-color.png', colors: SHOP_COLORS },
  { id: 27, name: 'BOZ Polo Shirt',               price: 'K195',  priceNum: 195,  tag: 'APPAREL',     desc: 'Premium cotton polo shirt embroidered with the Build One Zambia logo on the chest. Available in 6 colours. Sizes S–3XL.', img: '/products/polo-green.png',
    sizes: ['S', 'M', 'L', 'XL', 'XXL', '3XL'],
    colors: [
      { name: 'Green',  swatch: '#00712B', img: '/products/polo-green.png' },
      { name: 'Orange', swatch: '#EA580C', img: '/products/polo-orange.png' },
      { name: 'Black',  swatch: '#111111', img: '/products/polo-black.png' },
      { name: 'White',  swatch: '#FFFFFF', img: '/products/polo-white.png' },
      { name: 'Navy',   swatch: '#1e3a5f', img: '/products/polo-navy.png' },
      { name: 'Gray',   swatch: '#4b5563', img: '/products/polo-gray.png' },
    ],
  },
  { id: 28, name: 'Campaign Backpack',            price: 'K450',  priceNum: 450,  tag: 'BAGS',        desc: 'Durable 25L backpack with the BOZ logo and slogan. Multiple compartments, padded laptop sleeve, and water-resistant fabric. Perfect for agents and volunteers.', img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop&auto=format', colors: SHOP_COLORS },
  { id: 29, name: 'Hand-Held Rally Flag',         price: 'K45',   priceNum: 45,   tag: 'SIGNAGE',     desc: 'Small hand-held party flag on a stick, perfect for waving at rallies and motorcades.',            img: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=500&h=500&fit=crop&auto=format', colors: SHOP_COLORS },
  { id: 30, name: 'BOZ Chitenge Wrap',            price: 'K85',   priceNum: 85,   tag: 'APPAREL',     desc: 'Traditional chitenge fabric printed with the Build One Zambia pattern and colours.',              img: '/products/chitenge-green.png',
    colors: [
      { name: 'Green',        swatch: '#00712B', img: '/products/chitenge-green.png' },
      { name: 'Orange',       swatch: '#EA580C', img: '/products/chitenge-orange.png' },
      { name: 'Black',        swatch: '#111111', img: '/products/chitenge-black.png' },
      { name: 'White',        swatch: '#FFFFFF', img: '/products/chitenge-white.png' },
      { name: 'Forest Green', swatch: '#0d3d1f', img: '/products/chitenge-forest.png' },
      { name: 'Maroon',       swatch: '#6b1530', img: '/products/chitenge-maroon.png' },
    ],
  },
  { id: 31, name: 'BOZ Enamel Pin (Single)',      price: 'K25',   priceNum: 25,   tag: 'ACCESSORIES', desc: 'Single hard-enamel lapel pin featuring the party crest.',                                        img: '/products/enamelpin-color.png', colors: SHOP_COLORS },
  { id: 32, name: 'Rally Wristband',              price: 'K25',   priceNum: 25,   tag: 'ACCESSORIES', desc: 'Single silicone wristband debossed with a campaign slogan.',                                     img: '/products/wristband-color.png', colors: SHOP_COLORS },
  { id: 33, name: 'BOZ Car Window Flag',          price: 'K55',   priceNum: 55,   tag: 'SIGNAGE',     desc: 'Clip-on window flag for cars and trucks, visible from both sides.',                              img: 'https://images.unsplash.com/photo-1531844251246-9a1bfaae09fc?w=500&h=500&fit=crop&auto=format', colors: SHOP_COLORS },
  { id: 34, name: 'Campaign Canvas Print (A3)',   price: 'K140',  priceNum: 140,  tag: 'PRINT',       desc: 'Larger framing-quality canvas print of official campaign artwork.',                             img: '/products/canvas-green.png', colors: [
      { name: 'Green',  swatch: '#00712B', img: '/products/canvas-green.png' },
      { name: 'Orange', swatch: '#EA580C', img: '/products/canvas-orange.png' },
      { name: 'Blue',   swatch: '#1D4ED8', img: '/products/canvas-blue.png' },
      { name: 'Red',    swatch: '#C81E3A', img: '/products/canvas-red.png' },
      { name: 'Black',  swatch: '#111111', img: '/products/canvas-black.png' },
      { name: 'Yellow', swatch: '#F0B429', img: '/products/canvas-yellow.png' },
    ] },
  { id: 35, name: 'BOZ Sticker Sheet',            price: 'K20',   priceNum: 20,   tag: 'STICKERS',    desc: 'A5 sheet of assorted logo and slogan stickers for laptops and notebooks.',                       img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=500&fit=crop&auto=format', colors: SHOP_COLORS },
  { id: 36, name: 'BOZ Vinyl Decal',              price: 'K35',   priceNum: 35,   tag: 'STICKERS',    desc: 'Large single vinyl decal for car windows and shopfronts.',                                       img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=500&fit=crop&auto=format', colors: SHOP_COLORS },
  { id: 37, name: 'BOZ Insulated Bottle',         price: 'K140',  priceNum: 140,  tag: 'HOMEWARE',    desc: 'Double-walled insulated bottle with the party crest, 500ml.',                                    img: '/products/insulated-green.png', colors: [
      { name: 'Green',  swatch: '#00712B', img: '/products/insulated-green.png' },
      { name: 'Orange', swatch: '#EA580C', img: '/products/insulated-orange.png' },
      { name: 'Blue',   swatch: '#1D4ED8', img: '/products/insulated-blue.png' },
      { name: 'Red',    swatch: '#C81E3A', img: '/products/insulated-red.png' },
      { name: 'Black',  swatch: '#111111', img: '/products/insulated-black.png' },
      { name: 'Yellow', swatch: '#F0B429', img: '/products/insulated-yellow.png' },
    ] },
  { id: 38, name: 'BOZ Coaster Set (Pack of 4)',  price: 'K40',   priceNum: 40,   tag: 'HOMEWARE',    desc: 'Cork-backed coasters printed with campaign artwork, set of four.',                               img: '/products/coaster-green.png', colors: [
      { name: 'Green',  swatch: '#00712B', img: '/products/coaster-green.png' },
      { name: 'Orange', swatch: '#EA580C', img: '/products/coaster-orange.png' },
      { name: 'Blue',   swatch: '#1D4ED8', img: '/products/coaster-blue.png' },
      { name: 'Red',    swatch: '#C81E3A', img: '/products/coaster-red.png' },
      { name: 'Black',  swatch: '#111111', img: '/products/coaster-black.png' },
      { name: 'Yellow', swatch: '#F0B429', img: '/products/coaster-yellow.png' },
    ] },
  { id: 39, name: 'BOZ Sticky Notes',             price: 'K25',   priceNum: 25,   tag: 'STATIONERY',  desc: 'Branded sticky note pad for offices, schools, and volunteer desks.',                             img: '/products/sticky-green.png', colors: [
      { name: 'Green',  swatch: '#00712B', img: '/products/sticky-green.png' },
      { name: 'Orange', swatch: '#EA580C', img: '/products/sticky-orange.png' },
      { name: 'Blue',   swatch: '#1D4ED8', img: '/products/sticky-blue.png' },
      { name: 'Red',    swatch: '#C81E3A', img: '/products/sticky-red.png' },
      { name: 'Black',  swatch: '#111111', img: '/products/sticky-black.png' },
      { name: 'Yellow', swatch: '#F0B429', img: '/products/sticky-yellow.png' },
    ] },
  { id: 40, name: 'BOZ Desk Diary',               price: 'K85',   priceNum: 85,   tag: 'STATIONERY',  desc: 'A5 hardcover desk diary printed with the 2031 campaign calendar.',                               img: '/products/diary-green.png', colors: [
      { name: 'Green',  swatch: '#00712B', img: '/products/diary-green.png' },
      { name: 'Orange', swatch: '#EA580C', img: '/products/diary-orange.png' },
      { name: 'Blue',   swatch: '#1D4ED8', img: '/products/diary-blue.png' },
      { name: 'Red',    swatch: '#C81E3A', img: '/products/diary-red.png' },
      { name: 'Black',  swatch: '#111111', img: '/products/diary-black.png' },
      { name: 'Yellow', swatch: '#F0B429', img: '/products/diary-yellow.png' },
    ] },
  { id: 41, name: 'BOZ Phone Grip',               price: 'K35',   priceNum: 35,   tag: 'TECH',        desc: 'Collapsible phone grip and stand with the party logo.',                                          img: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=500&h=500&fit=crop&auto=format', colors: SHOP_COLORS },
  { id: 42, name: 'BOZ Laptop Sleeve',            price: 'K165',  priceNum: 165,  tag: 'BAGS',        desc: 'Padded 13–15" laptop sleeve with embroidered BOZ logo.',                                         img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop&auto=format', colors: SHOP_COLORS },
  { id: 43, name: 'Campaign Duffel Bag',          price: 'K420',  priceNum: 420,  tag: 'BAGS',        desc: 'Large duffel bag for agents and volunteers travelling between wards.',                          img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop&auto=format', colors: SHOP_COLORS },
  { id: 44, name: 'BOZ Windbreaker',              price: 'K380',  priceNum: 380,  tag: 'APPAREL',     desc: 'Lightweight windbreaker in party colours, ideal for outdoor canvassing.',                       img: '/products/windbreaker-green.png',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Green',  swatch: '#00712B', img: '/products/windbreaker-green.png' },
      { name: 'Orange', swatch: '#EA580C', img: '/products/windbreaker-orange.png' },
      { name: 'Black',  swatch: '#111111', img: '/products/windbreaker-black.png' },
      { name: 'Navy',   swatch: '#1e3a5f', img: '/products/windbreaker-navy.png' },
      { name: 'White',  swatch: '#FFFFFF', img: '/products/windbreaker-white.png' },
      { name: 'Gray',   swatch: '#4b5563', img: '/products/windbreaker-gray.png' },
    ],
  },
  { id: 45, name: 'BOZ Snapback Cap',             price: 'K130',  priceNum: 130,  tag: 'ACCESSORIES', desc: 'Flat-brim snapback cap with an embroidered front logo.',                                        img: '/products/snapback-black.png', colors: [{ name: 'Black', swatch: '#111111', img: '/products/snapback-black.png' }, ...SHOP_COLORS.slice(1)] },
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

function ProductCard({ product, cart, addedId, onAdd, onBuyNow }: { product: Product; tilt?: 'left' | 'right'; cart: CartItem[]; addedId: number | null; onAdd: (p: Product) => void; onBuyNow: () => void }) {
  const hasColors = !!product.colors && product.colors.length > 0;
  const hasSizes = !!product.sizes && product.sizes.length > 0;
  const hasVariants = hasColors || hasSizes;
  // Variant ids are product.id*1000 + colourIndex*10 + sizeIndex + 1 (both
  // default to 0 when not applicable), so "in cart" / "just added" need to
  // check the whole family of ids for this product, not just the base id.
  const inCartQty = hasVariants
    ? cart.filter(ci => Math.floor(ci.id / 1000) === product.id).reduce((s, ci) => s + ci.qty, 0)
    : (cart.find(ci => ci.id === product.id)?.qty ?? 0);
  const justAdded = addedId !== null && (hasVariants ? Math.floor(addedId / 1000) === product.id : addedId === product.id);
  const [hover, setHover] = useState(false);
  const [selectedColor, setSelectedColor] = useState<number | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [colorWarning, setColorWarning] = useState(false);
  const [sizeWarning, setSizeWarning] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  useEffect(() => {
    if (showDetail) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [showDetail]);
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
    if (hasSizes && selectedSize === null) {
      setSizeWarning(true);
      setTimeout(() => setSizeWarning(false), 2000);
      return;
    }
    if (hasVariants) {
      const colorIdx = selectedColor ?? 0;
      const sizeIdx = hasSizes ? product.sizes!.indexOf(selectedSize!) : 0;
      const variantLabel = [activeColor?.name, hasSizes ? `Size ${selectedSize}` : null].filter(Boolean).join(', ');
      // Each colour+size combination becomes its own cart line (distinct
      // id), so the exact variant the buyer picked carries through to
      // checkout instead of collapsing into a single generic line.
      onAdd({ ...product, id: product.id * 1000 + colorIdx * 10 + sizeIdx + 1, name: variantLabel ? `${product.name} — ${variantLabel}` : product.name, img: activeColor?.img ?? product.img });
    } else {
      onAdd(product);
    }
  }

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ background: '#fff', color: '#0F1111', width: '190px', flex: '0 0 190px', borderRadius: '8px', padding: '12px', position: 'relative', border: `1px solid ${CARD_BORDER}`, boxShadow: hover ? '0 14px 32px -6px rgba(0,0,0,0.35), 0 4px 10px rgba(0,0,0,0.12)' : '0 8px 20px -4px rgba(0,0,0,0.25), 0 2px 6px rgba(0,0,0,0.08)', transform: hover ? 'translateY(-3px)' : 'translateY(0)', transition: 'box-shadow 0.2s ease, transform 0.2s ease' }}
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

      <div
        onClick={() => setShowDetail(true)}
        style={{ height: '130px', borderRadius: '4px', overflow: 'hidden', marginBottom: '10px', background: activeColor ? tintBackground(activeColor.swatch) : '#FAFAFA', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', cursor: 'pointer', transition: 'background 0.2s ease' }}
      >
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

      <p
        onClick={() => setShowDetail(true)}
        style={{ fontSize: '12.5px', lineHeight: 1.3, fontWeight: 400, margin: '0 0 4px', minHeight: '32px', color: hover ? RED_DARK : '#0F1111', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', cursor: 'pointer' }}
      >
        {product.name}
      </p>
      <p style={{ fontSize: '10px', color: '#565959', margin: '0 0 4px', fontFamily: 'Open Sans, sans-serif' }}>
        Brand: <span style={{ color: '#007185' }}>Build One Zambia</span>
      </p>
      <button
        type="button"
        onClick={() => setShowDetail(true)}
        style={{ background: 'none', border: 'none', padding: 0, margin: '0 0 6px', fontSize: '10px', color: '#007185', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'Open Sans, sans-serif' }}
      >
        View details
      </button>

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

      {hasSizes && (
        <div style={{ marginBottom: '8px' }}>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '3px' }}>
            {product.sizes!.map(s => (
              <button
                key={s}
                type="button"
                onClick={() => { setSelectedSize(s); setSizeWarning(false); }}
                style={{
                  minWidth: '24px', height: '22px', padding: '0 4px', borderRadius: '4px', fontSize: '10px', cursor: 'pointer',
                  background: selectedSize === s ? '#0F1111' : '#fff', color: selectedSize === s ? '#fff' : '#0F1111',
                  border: selectedSize === s ? '1px solid #0F1111' : `1px solid ${CARD_BORDER}`,
                }}
              >
                {s}
              </button>
            ))}
          </div>
          <p style={{ fontSize: '9.5px', color: sizeWarning ? RED : '#565959', margin: 0, fontWeight: sizeWarning ? 700 : 400 }}>
            {sizeWarning ? 'Please select a size' : (selectedSize ? `Size: ${selectedSize}` : 'Select a size')}
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

      {showDetail && createPortal(
        <ProductDetailModal
          product={product}
          activeColor={activeColor}
          displayImg={displayImg}
          showTint={showTint}
          selectedColor={selectedColor}
          onSelectColor={i => { setSelectedColor(i); setColorWarning(false); }}
          selectedSize={selectedSize}
          onSelectSize={s => { setSelectedSize(s); setSizeWarning(false); }}
          meta={meta}
          wasPrice={wasPrice}
          justAdded={justAdded}
          colorWarning={colorWarning}
          sizeWarning={sizeWarning}
          onAdd={handleAdd}
          onAddProduct={onAdd}
          onBuyNow={onBuyNow}
          onClose={() => setShowDetail(false)}
        />,
        document.body
      )}
    </div>
  );
}

function ProductDetailModal({
  product, activeColor, displayImg, showTint, selectedColor, onSelectColor, selectedSize, onSelectSize, wasPrice, justAdded, colorWarning, sizeWarning, onAdd, onAddProduct, onBuyNow, onClose,
}: {
  product: Product;
  activeColor: { name: string; swatch: string; img?: string } | null;
  displayImg: string;
  showTint: boolean;
  selectedColor: number | null;
  onSelectColor: (i: number) => void;
  selectedSize: string | null;
  onSelectSize: (s: string) => void;
  meta: ReturnType<typeof productMeta>;
  wasPrice: number | null;
  justAdded: boolean;
  colorWarning: boolean;
  sizeWarning: boolean;
  onAdd: () => void;
  onAddProduct: (p: Product) => void;
  onBuyNow: () => void;
  onClose: () => void;
}) {
  const hasColors = !!product.colors && product.colors.length > 0;
  const hasSizes = !!product.sizes && product.sizes.length > 0;

  // Real BOZ products only — same category for "related", a couple of
  // other real items for "frequently bought together". No fabricated
  // ratings or review counts here (unlike the reference), since that
  // would mean inventing customer activity that never happened.
  const related = PRODUCTS.filter(p => p.tag === product.tag && p.id !== product.id).slice(0, 4);
  const bundleExtras = PRODUCTS.filter(p => p.id !== product.id && p.tag !== product.tag).slice(0, 2);
  const bundleTotal = product.priceNum + bundleExtras.reduce((s, p) => s + p.priceNum, 0);

  const [qty, setQty] = useState(1);

  // A full opaque page, not a dimmed overlay — the product grid behind it
  // is genuinely gone from view until this closes, not just dimmed and
  // peeking through.
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, backgroundColor: '#fff', overflowY: 'auto' }}>
      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '20px 24px 60px' }}>
        <button
          onClick={onClose}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#F3F3F3', border: '1px solid #D5D9D9', borderRadius: '18px', padding: '7px 16px', fontSize: '12.5px', fontFamily: 'Open Sans, sans-serif', cursor: 'pointer', color: '#0F1111', marginBottom: '24px' }}
        >
          ← Back to Shop
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: '36px' }} className="lg:grid-cols-[1fr_300px]">
        <div>
        {/* One big product image */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '360px', padding: '30px', marginBottom: '24px', borderRadius: '8px', background: activeColor ? tintBackground(activeColor.swatch) : 'transparent', transition: 'background 0.2s ease' }}>
          <img src={displayImg} alt={product.name} style={{ width: '100%', maxWidth: '340px', objectFit: 'contain', filter: showTint ? 'grayscale(0.5) brightness(1.05)' : 'none' }} />
          {showTint && activeColor && (
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: activeColor.swatch, opacity: 0.32, mixBlendMode: 'multiply', borderRadius: '8px' }} />
          )}
        </div>

        <h1 style={{ fontSize: '1.4rem', fontWeight: 600, lineHeight: 1.35, margin: '0 0 8px', color: '#0F1111' }}>{product.name}</h1>


        <div style={{ marginBottom: '14px' }}>
          <span style={{ fontSize: '24px', fontWeight: 700 }}>{product.price}</span>
          {wasPrice && <span style={{ fontSize: '13px', color: '#565959', textDecoration: 'line-through', marginLeft: '10px' }}>K{wasPrice.toLocaleString()}</span>}
        </div>

        {/* Product information — only fields we actually have real data
            for (brand, category, available colours/sizes). Not padded
            out with invented specs like "Item form" or "Unit count"
            that don't apply to a t-shirt or don't exist in the catalog. */}
        <table style={{ width: '100%', maxWidth: '420px', borderCollapse: 'collapse', margin: '0 0 24px' }}>
          <tbody>
            <tr>
              <td style={{ padding: '6px 16px 6px 0', fontSize: '13px', fontWeight: 700, color: '#0F1111', verticalAlign: 'top', whiteSpace: 'nowrap' }}>Brand</td>
              <td style={{ padding: '6px 0', fontSize: '13px', color: '#0F1111' }}>Build One Zambia</td>
            </tr>
            <tr>
              <td style={{ padding: '6px 16px 6px 0', fontSize: '13px', fontWeight: 700, color: '#0F1111', verticalAlign: 'top', whiteSpace: 'nowrap' }}>Category</td>
              <td style={{ padding: '6px 0', fontSize: '13px', color: '#0F1111' }}>{product.tag.charAt(0) + product.tag.slice(1).toLowerCase()}</td>
            </tr>
            {hasColors && (
              <tr>
                <td style={{ padding: '6px 16px 6px 0', fontSize: '13px', fontWeight: 700, color: '#0F1111', verticalAlign: 'top', whiteSpace: 'nowrap' }}>Colours available</td>
                <td style={{ padding: '6px 0', fontSize: '13px', color: '#0F1111' }}>{product.colors!.map(c => c.name).join(', ')}</td>
              </tr>
            )}
            {hasSizes && (
              <tr>
                <td style={{ padding: '6px 16px 6px 0', fontSize: '13px', fontWeight: 700, color: '#0F1111', verticalAlign: 'top', whiteSpace: 'nowrap' }}>Sizes available</td>
                <td style={{ padding: '6px 0', fontSize: '13px', color: '#0F1111' }}>{product.sizes!.join(', ')}</td>
              </tr>
            )}
          </tbody>
        </table>
        <hr style={{ border: 'none', borderTop: `1px solid ${CARD_BORDER}`, margin: '0 0 24px' }} />

        {/* Description — split into bullet points like Amazon's "About this
            item" list, since each product description is written as short
            1-2 sentence facts rather than one paragraph */}
        <p style={{ fontSize: '15px', fontWeight: 700, color: '#0F1111', margin: '0 0 12px', fontFamily: 'Open Sans, sans-serif' }}>About this item</p>
        <ul style={{ margin: '0 0 26px', padding: '0 0 0 20px', listStyle: 'disc' }}>
          {product.desc.split(/(?<=[.!])\s+/).filter(Boolean).map((sentence, i) => (
            <li key={i} style={{ fontSize: '16px', lineHeight: 1.8, color: '#0F1111', marginBottom: '6px' }}>
              {sentence}
            </li>
          ))}
        </ul>

        {hasColors && (
          <div style={{ marginBottom: '22px' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#0F1111', margin: '0 0 8px' }}>
              Colour: <span style={{ fontWeight: 400 }}>{activeColor ? activeColor.name : 'Select a colour'}</span>
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {product.colors!.map((c, i) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => onSelectColor(i)}
                  title={c.name}
                  aria-label={`Select colour ${c.name}`}
                  style={{
                    width: '30px', height: '30px', borderRadius: '50%', background: c.swatch, cursor: 'pointer',
                    border: selectedColor === i ? '2px solid #0F1111' : '1px solid rgba(0,0,0,0.2)',
                    outline: selectedColor === i ? `2px solid ${BUY_YELLOW}` : 'none', outlineOffset: '2px',
                    padding: 0, flexShrink: 0,
                  }}
                />
              ))}
            </div>
            {colorWarning && <p style={{ fontSize: '11px', color: RED, fontWeight: 700, marginTop: '8px' }}>Please select a colour</p>}
          </div>
        )}

        {hasSizes && (
          <div style={{ marginBottom: '22px' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#0F1111', margin: '0 0 8px' }}>
              Size: <span style={{ fontWeight: 400 }}>{selectedSize || 'Select a size'}</span>
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {product.sizes!.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onSelectSize(s)}
                  style={{
                    minWidth: '42px', height: '38px', padding: '0 10px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: 500,
                    background: selectedSize === s ? '#0F1111' : '#fff', color: selectedSize === s ? '#fff' : '#0F1111',
                    border: selectedSize === s ? '1px solid #0F1111' : `1px solid ${CARD_BORDER}`,
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
            {sizeWarning && <p style={{ fontSize: '11px', color: RED, fontWeight: 700, marginTop: '8px' }}>Please select a size</p>}
          </div>
        )}
        </div>

        {/* Buy box — real fields only. No fake "X% claimed" urgency bar and
            no specific delivery-time promises: BOZ doesn't have Amazon's
            fulfilment data to back a "delivery tomorrow 12pm-3pm" claim,
            and a false delivery promise on real campaign merchandise
            orders would cause real problems for actual buyers. */}
        <div>
          <div style={{ border: `1px solid ${CARD_BORDER}`, borderRadius: '8px', padding: '18px', position: 'sticky', top: '18px' }}>
            <div style={{ marginBottom: '10px' }}>
              <span style={{ fontSize: '22px', fontWeight: 700 }}>{product.price}</span>
              {wasPrice && <span style={{ fontSize: '12px', color: '#565959', textDecoration: 'line-through', marginLeft: '8px' }}>K{wasPrice.toLocaleString()}</span>}
            </div>
            <p style={{ fontSize: '13px', color: '#007600', fontWeight: 600, margin: '0 0 14px' }}>In stock</p>

            <label style={{ fontSize: '12px', color: '#0F1111', display: 'block', marginBottom: '6px' }}>Quantity</label>
            <select
              value={qty}
              onChange={e => setQty(parseInt(e.target.value))}
              style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: `1px solid ${CARD_BORDER}`, fontSize: '13px', marginBottom: '16px', background: '#F0F2F2' }}
            >
              {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
            </select>

            <button
              onClick={() => { for (let i = 0; i < qty; i++) onAdd(); }}
              style={{ width: '100%', background: justAdded ? '#2E7D32' : BUY_YELLOW, color: justAdded ? '#fff' : '#0F1111', border: `1px solid ${justAdded ? '#2E7D32' : '#FCD200'}`, borderRadius: '20px', padding: '10px 0', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Open Sans, sans-serif', marginBottom: '10px' }}
            >
              {justAdded ? '✓ Added to cart' : 'Add to Basket'}
            </button>
            <button
              onClick={() => { for (let i = 0; i < qty; i++) onAdd(); onBuyNow(); }}
              style={{ width: '100%', background: '#F08804', color: '#0F1111', border: '1px solid #DA7B00', borderRadius: '20px', padding: '10px 0', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Open Sans, sans-serif', marginBottom: '16px' }}
            >
              Buy Now
            </button>

            <div style={{ borderTop: `1px solid ${CARD_BORDER}`, paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <p style={{ fontSize: '12px', color: '#565959', margin: 0 }}>Shipper / Seller <span style={{ color: '#0F1111' }}>Build One Zambia</span></p>
              <p style={{ fontSize: '12px', color: '#565959', margin: 0 }}>Payment <span style={{ color: '#007185' }}>Secure transaction</span></p>
            </div>
          </div>
        </div>
        </div>

        {/* Frequently bought together — real BOZ products paired for a
            combined price, not a fabricated purchase-pattern stat */}
        {bundleExtras.length > 0 && (
          <div style={{ marginTop: '40px', paddingTop: '32px', borderTop: `1px solid ${CARD_BORDER}` }}>
            <p style={{ fontSize: '17px', fontWeight: 700, color: '#0F1111', margin: '0 0 16px', fontFamily: 'Open Sans, sans-serif' }}>Frequently bought together</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {[product, ...bundleExtras].map((p, i) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '76px', height: '76px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}>
                    <img src={p.img} alt={p.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  </div>
                  {i < bundleExtras.length && <span style={{ fontSize: '18px', color: '#565959' }}>+</span>}
                </div>
              ))}
            </div>
            <p style={{ fontSize: '13px', color: '#0F1111', margin: '0 0 4px' }}>
              <strong>This item:</strong> {product.name}
            </p>
            {bundleExtras.map(p => (
              <p key={p.id} style={{ fontSize: '13px', color: '#565959', margin: '0 0 4px' }}>{p.name} — {p.price}</p>
            ))}
            <p style={{ fontSize: '16px', fontWeight: 700, color: '#0F1111', margin: '10px 0 12px' }}>Total price: K{bundleTotal.toLocaleString()}</p>
            <button
              onClick={() => { onAdd(); bundleExtras.forEach(p => onAddProduct(p)); }}
              style={{ background: BUY_YELLOW, color: '#0F1111', border: '1px solid #FCD200', borderRadius: '20px', padding: '9px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'Open Sans, sans-serif' }}
            >
              Add all {1 + bundleExtras.length} to Cart
            </button>
          </div>
        )}

        {/* Related products — other real items in the same category */}
        {related.length > 0 && (
          <div style={{ marginTop: '36px', paddingTop: '28px', borderTop: `1px solid ${CARD_BORDER}` }}>
            <p style={{ fontSize: '17px', fontWeight: 700, color: '#0F1111', margin: '0 0 16px', fontFamily: 'Open Sans, sans-serif' }}>More from {product.tag.charAt(0) + product.tag.slice(1).toLowerCase()}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '14px' }}>
              {related.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onAddProduct(p)}
                  title={`Add ${p.name} to cart`}
                  style={{ textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', marginBottom: '6px' }}>
                    <img src={p.img} alt={p.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  </div>
                  <p style={{ fontSize: '11.5px', color: '#0F1111', margin: '0 0 3px', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{p.name}</p>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: '#0F1111', margin: 0 }}>{p.price}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
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

function MovingRow({ products, cart, addedId, onAdd, onBuyNow }: { products: Product[]; cart: CartItem[]; addedId: number | null; onAdd: (p: Product) => void; onBuyNow: () => void }) {
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
          <ProductCard key={`${product.id}-${i}`} product={product} tilt={i % 2 === 0 ? 'left' : 'right'} cart={cart} addedId={addedId} onAdd={onAdd} onBuyNow={onBuyNow} />
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
    <div style={{ backgroundColor: '#0b3d1f', fontFamily: 'Open Sans, sans-serif', color: INK, position: 'relative' }}>
      <style>{`
        .boz-row-mask { overflow: hidden; padding: 8px 0; }
        .boz-wave-bg { position: fixed; inset: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none; }
        .boz-shop-content { position: relative; z-index: 1; }
      `}</style>

      {/* Decorative wave backdrop — green/orange, gold hairline accents, fixed behind all scrolling content */}
      <WaveBackground fixed />

      <div className="boz-shop-content">

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
          style={{ position: 'fixed', top: '52px', right: '24px', zIndex: 200, display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: RED, color: '#fff', border: 'none', padding: '14px 24px', cursor: 'pointer', fontFamily: 'Oswald, sans-serif', fontSize: '13px', letterSpacing: '0.1em', boxShadow: '0 8px 32px rgba(220,38,38,0.45)' }}
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
      <section style={{ backgroundColor: 'rgba(0,0,0,0.22)', borderBottom: '1px solid rgba(255,255,255,0.15)', padding: '16px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', textAlign: 'center' }}>
          <ShoppingBag style={{ width: '16px', height: '16px', color: '#F4C066', flexShrink: 0 }} />
          <p style={{ fontFamily: 'Oswald, sans-serif', fontSize: '12px', letterSpacing: '0.08em', color: '#fff', margin: 0 }}>
            ALL PROCEEDS FROM SHOP SALES GO DIRECTLY TO THE <span style={{ color: '#F4C066' }}>BUILD ONE ZAMBIA CAMPAIGN FUND</span>
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
                  <ProductCard key={product.id} product={product} tilt={i % 2 === 0 ? 'left' : 'right'} cart={cart} addedId={addedId} onAdd={addToCart} onBuyNow={openCheckout} />
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
                <MovingRow products={rowProducts} cart={cart} addedId={addedId} onAdd={addToCart} onBuyNow={openCheckout} />
              </div>
            );
          })
        )}
      </section>
      </div>
    </div>
  );
}

export { ShopPage as default };
