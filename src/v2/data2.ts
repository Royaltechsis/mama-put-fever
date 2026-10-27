import type { Level as BulkLevel } from '../data';

export type Comp = 'jollof' | 'chicken' | 'egusi' | 'eba' | 'suya' | 'yaji' | 'dodo' | 'puffpuff';
export type Drink = 'zobo' | 'chapman';
export type MenuId = string; // ids are per destination (Lagos: jc, jcd, ee, suya, dodo, puff, zobo, chapman)
export type MenuItem = { name: string; comps?: Comp[]; drink?: Drink; price: number };

// Mutable: swapped to the active destination's menu by activateDest() in dests.ts
export const MENU: Record<MenuId, MenuItem> = {
  jc: { name: 'Jollof + chicken', comps: ['jollof', 'chicken'], price: 1200 },
  jcd: { name: 'Jollof, chicken + dodo', comps: ['jollof', 'chicken', 'dodo'], price: 1600 },
  ee: { name: 'Eba + egusi', comps: ['eba', 'egusi'], price: 1300 },
  suya: { name: 'Suya', comps: ['suya', 'yaji'], price: 900 },
  dodo: { name: 'Dodo', comps: ['dodo'], price: 500 },
  puff: { name: 'Puff-puff', comps: ['puffpuff'], price: 400 },
  zobo: { name: 'Zobo', drink: 'zobo', price: 300 },
  chapman: { name: 'Chapman', drink: 'chapman', price: 450 },
};

export type Station = 'pot' | 'grillChicken' | 'grillSuya' | 'fryerDodo' | 'fryerPuff' | 'drinks' | 'egusi';

export type Level2 = {
  name: string;
  duration: number; // seconds
  customers: number;
  menu: MenuId[]; // what customers can order
  maxItems: number; // items per customer
  gap: number; // seconds between arrivals
  patience: number; // seconds of patience
  bulk?: BulkLevel; // owambe event after service
  isNew?: string; // what's introduced
};

const bulk = (title: string, dish: 'jollof' | 'suya' | 'egusi' | 'dodo', people: number, container: 'pack' | 'foil' | 'cooler', sides: Record<string, number>, time: number, customer = 7): BulkLevel => ({
  title, tag: 'Owambe order', time, orders: [{ dish, people, container, sides, customer }],
});

// Mutable: swapped to the active destination's levels by activateDest()
export const LEVELS2: Level2[] = [
  { name: 'Opening day', duration: 100, customers: 5, menu: ['jc'], maxItems: 1, gap: 11, patience: 45, isNew: 'Jollof pot + grill' },
  { name: 'Thirsty Tuesday', duration: 100, customers: 6, menu: ['jc', 'zobo'], maxItems: 2, gap: 10, patience: 42, isNew: 'Zobo from the drink machine' },
  { name: 'Dodo day', duration: 110, customers: 7, menu: ['jc', 'jcd', 'dodo', 'zobo'], maxItems: 2, gap: 10, patience: 42, isNew: 'Fryer: dodo' },
  { name: 'First Owambe', duration: 100, customers: 6, menu: ['jc', 'jcd', 'zobo'], maxItems: 2, gap: 10, patience: 40, bulk: bulk('Owambe: Jollof for 15', 'jollof', 15, 'pack', { water: 15 }, 90), isNew: 'Owambe bulk order' },
  { name: 'Suya night', duration: 110, customers: 8, menu: ['suya', 'jc', 'zobo', 'dodo'], maxItems: 2, gap: 9, patience: 40, isNew: 'Suya on the grill + yaji' },
  { name: 'Chapman o clock', duration: 115, customers: 8, menu: ['suya', 'jcd', 'chapman', 'zobo'], maxItems: 2, gap: 9, patience: 38, isNew: 'Chapman' },
  { name: 'Puff-puff party', duration: 120, customers: 9, menu: ['puff', 'jc', 'suya', 'chapman', 'dodo'], maxItems: 3, gap: 9, patience: 40, isNew: 'Fryer: puff-puff' },
  { name: 'Friday Owambe', duration: 110, customers: 8, menu: ['jc', 'suya', 'puff', 'zobo'], maxItems: 2, gap: 9, patience: 38, bulk: bulk('Owambe: Suya for 12', 'suya', 12, 'foil', {}, 80, 2) },
  { name: 'Swallow time', duration: 120, customers: 9, menu: ['ee', 'jc', 'zobo', 'puff'], maxItems: 2, gap: 9, patience: 40, isNew: 'Egusi pot + eba' },
  { name: 'Lunch rush', duration: 125, customers: 11, menu: ['ee', 'jcd', 'suya', 'chapman', 'zobo'], maxItems: 3, gap: 8, patience: 38 },
  { name: 'Campus crowd', duration: 125, customers: 12, menu: ['jc', 'dodo', 'puff', 'suya', 'zobo', 'chapman'], maxItems: 3, gap: 7.5, patience: 36 },
  { name: "Chief's 60th", duration: 130, customers: 12, menu: ['jcd', 'ee', 'suya', 'puff', 'chapman', 'zobo'], maxItems: 3, gap: 7.5, patience: 36, bulk: bulk('Owambe: Jollof for 30', 'jollof', 30, 'cooler', { water: 30 }, 110, 9) },
];

export function stationsFor(lv: Level2): Set<Station> {
  const s = new Set<Station>();
  lv.menu.forEach((m) => {
    const it = MENU[m];
    if (it.drink) s.add('drinks');
    it.comps?.forEach((c) => {
      if (c === 'jollof') s.add('pot');
      if (c === 'chicken') s.add('grillChicken');
      if (c === 'suya') s.add('grillSuya');
      if (c === 'dodo') s.add('fryerDodo');
      if (c === 'puffpuff') s.add('fryerPuff');
      if (c === 'egusi' || c === 'eba') s.add('egusi');
    });
  });
  return s;
}

// deterministic customer script (Cooking Fever levels are always the same)
export type Cust = { at: number; items: MenuId[]; who: number };
export function scriptFor(idx: number): Cust[] {
  const lv = LEVELS2[idx];
  let seed = 1234 + idx * 977;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const out: Cust[] = [];
  const foods = lv.menu.filter((m) => !MENU[m].drink);
  const drinks = lv.menu.filter((m) => MENU[m].drink);
  for (let i = 0; i < lv.customers; i++) {
    const n = i === 0 ? 1 : 1 + Math.floor(rnd() * lv.maxItems);
    const items: MenuId[] = [foods[Math.floor(rnd() * foods.length)]];
    for (let k = 1; k < n; k++) {
      const pool = drinks.length && rnd() < 0.6 ? drinks : foods;
      items.push(pool[Math.floor(rnd() * pool.length)]);
    }
    out.push({ at: i === 0 ? 1 : 1 + i * lv.gap * (0.8 + rnd() * 0.4), items, who: Math.floor(rnd() * 6) });
  }
  return out;
}

export function goalsFor(idx: number) {
  const base = scriptFor(idx).reduce((a, c) => a + c.items.reduce((b, m) => b + MENU[m].price, 0), 0);
  const bulkBonus = LEVELS2[idx].bulk ? 0.6 * LEVELS2[idx].bulk!.orders.reduce((a, o) => a + o.people * ({ jollof: 500, suya: 400, egusi: 700, dodo: 300 } as const)[o.dish], 0) : 0;
  const r = (v: number) => Math.round(v / 100) * 100;
  return [r((base + bulkBonus) * 0.55), r((base + bulkBonus) * 0.85), r((base + bulkBonus) * 1.12)];
}

export type KitchenUp = 'grill' | 'pot' | 'fryer' | 'drinks' | 'plates';
export type DecorUp = 'ankara' | 'fans' | 'music';

export const KITCHEN: Record<KitchenUp, { name: string; levels: string[]; prices: number[] }> = {
  grill: { name: 'Suya grill', levels: ['2 slots', '3 slots', '4 slots'], prices: [3500, 9000] },
  pot: { name: 'Jollof pot', levels: ['4 portions', '6 portions', '8 portions'], prices: [3000, 8000] },
  fryer: { name: 'Deep fryer', levels: ['2 baskets, normal', '2 baskets, fast', '3 baskets, fast'], prices: [4000, 9500] },
  drinks: { name: 'Drink machine', levels: ['Normal pour', 'Fast pour', 'Super fast'], prices: [2500, 6000] },
  plates: { name: 'Plates', levels: ['3 plates', '4 plates'], prices: [5000] },
};
export const DECOR: Record<DecorUp, { name: string; desc: string; price: number }> = {
  ankara: { name: 'Ankara makeover', desc: 'Fresh paint, ankara curtains, new tables. Customers wait 15% longer.', price: 6000 },
  fans: { name: 'Ceiling fans & plants', desc: 'Cool breeze. Customers wait another 10% longer.', price: 5000 },
  music: { name: 'Afrobeats speaker', desc: 'Good vibes: +20% tips.', price: 7000 },
};
