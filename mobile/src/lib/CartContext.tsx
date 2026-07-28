import { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from './products';

export interface CartItem {
  id: number; // product.id * 100 + colourIndex + 1, so each colour is its own line — same scheme as the website
  name: string;
  priceNum: number;
  colour: string;
  qty: number;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (product: Product, colourIndex: number) => void;
  removeItem: (id: number) => void;
  updateQty: (id: number, qty: number) => void;
  total: number;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (product: Product, colourIndex: number) => {
    const colour = product.colors[colourIndex];
    const id = product.id * 100 + colourIndex + 1;
    setItems(prev => {
      const existing = prev.find(i => i.id === id);
      if (existing) return prev.map(i => (i.id === id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { id, name: `${product.name} \u2014 ${colour.name}`, priceNum: product.priceNum, colour: colour.name, qty: 1 }];
    });
  };

  const removeItem = (id: number) => setItems(prev => prev.filter(i => i.id !== id));
  const updateQty = (id: number, qty: number) =>
    setItems(prev => (qty <= 0 ? prev.filter(i => i.id !== id) : prev.map(i => (i.id === id ? { ...i, qty } : i))));
  const clear = () => setItems([]);

  const total = items.reduce((sum, i) => sum + i.priceNum * i.qty, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, total, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
