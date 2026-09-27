import { atom, computed } from 'nanostores';
import { readJson, writeJson } from './storage';

export interface CartItem {
  sku: string;
  slug: string;
  size?: string;
  qty: number;
}

const KEY = 'ofca-cart-v1';
export const MAX_QTY = 20;

export const cart = atom<CartItem[]>([]);
export const cartCount = computed(cart, (items) => items.reduce((n, i) => n + i.qty, 0));

let hydrated = false;
export function hydrateCart() {
  if (hydrated || typeof window === 'undefined') return;
  hydrated = true;
  cart.set(readJson<CartItem[]>(KEY, []));
  cart.listen((items) => writeJson(KEY, items));
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) cart.set(readJson<CartItem[]>(KEY, []));
  });
}

export function addToCart(item: Omit<CartItem, 'qty'>, qty = 1) {
  const items = cart.get();
  const found = items.find((i) => i.sku === item.sku);
  if (found) {
    cart.set(items.map((i) => (i.sku === item.sku ? { ...i, qty: Math.min(MAX_QTY, i.qty + qty) } : i)));
  } else {
    cart.set([...items, { ...item, qty }]);
  }
}

export function setQty(sku: string, qty: number) {
  if (qty <= 0) return removeFromCart(sku);
  cart.set(cart.get().map((i) => (i.sku === sku ? { ...i, qty: Math.min(MAX_QTY, qty) } : i)));
}

export function removeFromCart(sku: string) {
  cart.set(cart.get().filter((i) => i.sku !== sku));
}

export function clearCart() {
  cart.set([]);
}
