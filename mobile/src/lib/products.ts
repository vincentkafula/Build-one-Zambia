/**
 * Mirrors a subset of the website's PRODUCTS list (ShopPage.tsx). The full
 * catalogue lives as static data there too, not a backend endpoint — kept
 * this list to the products that already have real per-colour photography,
 * so the mobile app isn't showing generic stock photos on day one. Add the
 * rest of the website's PRODUCTS array here as needed; the shape matches
 * exactly so it's a straight copy-paste per item.
 */
export interface ProductColor {
  name: string;
  swatch: string;
}

export interface Product {
  id: number;
  name: string;
  price: string;
  priceNum: number;
  tag: string;
  desc: string;
  colors: ProductColor[];
}

export const PRODUCTS: Product[] = [
  {
    id: 1, name: 'BOZ Campaign T-Shirt', price: 'K150', priceNum: 150, tag: 'APPAREL',
    desc: "Branded with the party logo, slogan, and candidate's name. Available in all sizes.",
    colors: [
      { name: 'Gold', swatch: '#F0B429' }, { name: 'White', swatch: '#FFFFFF' },
      { name: 'Green', swatch: '#00712B' }, { name: 'Black', swatch: '#111111' },
      { name: 'Blue', swatch: '#1D4ED8' }, { name: 'Gray', swatch: '#9CA3AF' },
    ],
  },
  {
    id: 2, name: 'BOZ Hoodie', price: 'K280', priceNum: 280, tag: 'APPAREL',
    desc: 'Premium hoodie embroidered with the Build One Zambia logo and 2031 campaign slogan.',
    colors: [
      { name: 'Green', swatch: '#00712B' }, { name: 'Orange', swatch: '#EA580C' },
      { name: 'Black', swatch: '#111111' }, { name: 'Navy', swatch: '#1e3a5f' },
      { name: 'White', swatch: '#FFFFFF' }, { name: 'Gray', swatch: '#4b5563' },
    ],
  },
  {
    id: 22, name: 'BOZ Campaign Jersey', price: 'K320', priceNum: 320, tag: 'APPAREL',
    desc: "Sports-style jersey in party colours with logo and candidate's name.",
    colors: [
      { name: 'Green', swatch: '#00712B' }, { name: 'Orange', swatch: '#EA580C' },
      { name: 'Black', swatch: '#111111' }, { name: 'White', swatch: '#FFFFFF' },
      { name: 'Blue', swatch: '#1D4ED8' }, { name: 'Gray', swatch: '#4b5563' },
    ],
  },
  {
    id: 23, name: 'BOZ Branded Jacket', price: 'K580', priceNum: 580, tag: 'APPAREL',
    desc: 'Embroidered windbreaker/bomber jacket with party logo and colours. Premium collectible.',
    colors: [
      { name: 'Black', swatch: '#111111' }, { name: 'Green', swatch: '#00712B' },
      { name: 'Gold', swatch: '#F0B429' }, { name: 'Blue', swatch: '#1D4ED8' },
      { name: 'Orange', swatch: '#EA580C' }, { name: 'Red', swatch: '#C81E3A' },
    ],
  },
  {
    id: 24, name: 'BOZ Novelty Socks', price: 'K45', priceNum: 45, tag: 'APPAREL',
    desc: 'Fun novelty socks featuring party colours and logo patterns.',
    colors: [
      { name: 'Green', swatch: '#00712B' }, { name: 'Orange', swatch: '#EA580C' },
      { name: 'Black', swatch: '#111111' }, { name: 'White', swatch: '#FFFFFF' },
      { name: 'Navy', swatch: '#1e3a5f' }, { name: 'Gray', swatch: '#6b7280' },
    ],
  },
  {
    id: 27, name: 'BOZ Polo Shirt', price: 'K195', priceNum: 195, tag: 'APPAREL',
    desc: 'Premium cotton polo shirt embroidered with the Build One Zambia logo on the chest.',
    colors: [
      { name: 'Green', swatch: '#00712B' }, { name: 'Orange', swatch: '#EA580C' },
      { name: 'Black', swatch: '#111111' }, { name: 'White', swatch: '#FFFFFF' },
      { name: 'Navy', swatch: '#1e3a5f' }, { name: 'Gray', swatch: '#4b5563' },
    ],
  },
  {
    id: 30, name: 'BOZ Chitenge Wrap', price: 'K85', priceNum: 85, tag: 'APPAREL',
    desc: 'Traditional chitenge fabric printed with the Build One Zambia pattern and colours.',
    colors: [
      { name: 'Green', swatch: '#00712B' }, { name: 'Orange', swatch: '#EA580C' },
      { name: 'Black', swatch: '#111111' }, { name: 'White', swatch: '#FFFFFF' },
      { name: 'Forest Green', swatch: '#0d3d1f' }, { name: 'Maroon', swatch: '#6b1530' },
    ],
  },
  {
    id: 44, name: 'BOZ Windbreaker', price: 'K380', priceNum: 380, tag: 'APPAREL',
    desc: 'Lightweight windbreaker in party colours, ideal for outdoor canvassing.',
    colors: [
      { name: 'Green', swatch: '#00712B' }, { name: 'Orange', swatch: '#EA580C' },
      { name: 'Black', swatch: '#111111' }, { name: 'Navy', swatch: '#1e3a5f' },
      { name: 'White', swatch: '#FFFFFF' }, { name: 'Gray', swatch: '#4b5563' },
    ],
  },
];
