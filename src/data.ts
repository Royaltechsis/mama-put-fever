export type IngId =
  | 'rice' | 'blend' | 'onion' | 'vegoil' | 'palmoil' | 'cube' | 'meat' | 'egusi'
  | 'ugu' | 'garri' | 'hotwater' | 'beef' | 'yaji' | 'plantain' | 'salt' | 'crayfish';

export const INGREDIENTS: Record<IngId, { name: string; color: string }> = {
  rice: { name: 'Rice', color: '#F4EBD9' },
  blend: { name: 'Tomato-pepper', color: '#D7263D' },
  onion: { name: 'Onions', color: '#8E4585' },
  vegoil: { name: 'Veg oil', color: '#F6C945' },
  palmoil: { name: 'Palm oil', color: '#E2531B' },
  cube: { name: 'Seasoning', color: '#E8A21A' },
  meat: { name: 'Meat', color: '#8B3A2B' },
  egusi: { name: 'Egusi', color: '#E9D8A6' },
  ugu: { name: 'Ugu leaves', color: '#2E8B3D' },
  garri: { name: 'Garri', color: '#F3E3B5' },
  hotwater: { name: 'Hot water', color: '#7FB8E0' },
  beef: { name: 'Suya beef', color: '#B23A3A' },
  yaji: { name: 'Yaji spice', color: '#9C5B2E' },
  plantain: { name: 'Plantain', color: '#F2C230' },
  salt: { name: 'Salt', color: '#E6E6E6' },
  crayfish: { name: 'Crayfish', color: '#E07A3F' },
};

export type StationKind = 'pot' | 'grill' | 'pan' | 'bowl';
export type Step = { ing: IngId; per?: number }; // per = people covered by one drag; undefined = always 1

export type StationDef = {
  kind: StationKind;
  label: string;
  steps: Step[];
  finish?: IngId[]; // added once the food is ready
  cookTime: number; // seconds; 0 = no heat (mash instead)
  action: 'stir' | 'flip' | 'mash';
  doneColor: string;
  rawColor: string;
};

export type DishId = 'jollof' | 'egusi' | 'suya' | 'dodo';

export type Dish = {
  id: DishId;
  name: string;
  short: string;
  price: number; // naira per person
  stations: StationDef[];
  unlockLevel: number; // level index (0-based) where it first appears
};

export const DISHES: Record<DishId, Dish> = {
  jollof: {
    id: 'jollof', name: 'Jollof Rice', short: 'Jollof', price: 500, unlockLevel: 0,
    stations: [{
      kind: 'pot', label: 'Jollof pot', cookTime: 9, action: 'stir',
      rawColor: '#E9742B', doneColor: '#D9481C',
      steps: [{ ing: 'vegoil' }, { ing: 'onion', per: 15 }, { ing: 'blend', per: 8 }, { ing: 'cube', per: 15 }, { ing: 'rice', per: 8 }],
    }],
  },
  suya: {
    id: 'suya', name: 'Suya', short: 'Suya', price: 400, unlockLevel: 2,
    stations: [{
      kind: 'grill', label: 'Suya grill', cookTime: 8, action: 'flip',
      rawColor: '#C0453F', doneColor: '#6B2E14',
      steps: [{ ing: 'beef', per: 3 }],
      finish: ['yaji', 'onion'],
    }],
  },
  egusi: {
    id: 'egusi', name: 'Eba & Egusi', short: 'Eba & Egusi', price: 700, unlockLevel: 4,
    stations: [
      {
        kind: 'pot', label: 'Egusi soup', cookTime: 9, action: 'stir',
        rawColor: '#E2A33B', doneColor: '#C9772A',
        steps: [{ ing: 'palmoil' }, { ing: 'egusi', per: 8 }, { ing: 'blend', per: 10 }, { ing: 'crayfish' }, { ing: 'meat', per: 8 }],
        finish: ['ugu'],
      },
      {
        kind: 'bowl', label: 'Eba', cookTime: 0, action: 'mash',
        rawColor: '#F3E3B5', doneColor: '#F5D77A',
        steps: [{ ing: 'hotwater', per: 10 }, { ing: 'garri', per: 6 }],
      },
    ],
  },
  dodo: {
    id: 'dodo', name: 'Dodo (fried plantain)', short: 'Dodo', price: 300, unlockLevel: 5,
    stations: [{
      kind: 'pan', label: 'Dodo pan', cookTime: 7, action: 'flip',
      rawColor: '#F2C230', doneColor: '#D9821E',
      steps: [{ ing: 'vegoil' }, { ing: 'plantain', per: 4 }, { ing: 'salt' }],
    }],
  },
};

export type PkgId = 'pack1' | 'pack5' | 'foil1' | 'foil5' | 'cooler' | 'water1' | 'water6' | 'slaw1' | 'slaw5' | 'side1' | 'side5';
export type Container = 'pack' | 'foil' | 'cooler';
export type SideId = 'water' | 'slaw' | 'side';

export const PACKAGING: Record<PkgId, { label: string; kind: Container | SideId; units: number }> = {
  pack1: { label: 'Food pack', kind: 'pack', units: 1 },
  pack5: { label: 'Packs ×5', kind: 'pack', units: 5 },
  foil1: { label: 'Foil wrap', kind: 'foil', units: 1 },
  foil5: { label: 'Foil ×5', kind: 'foil', units: 5 },
  cooler: { label: 'Cooler (10)', kind: 'cooler', units: 1 },
  water1: { label: 'Water', kind: 'water', units: 1 },
  water6: { label: 'Water ×6', kind: 'water', units: 6 },
  slaw1: { label: 'Coleslaw', kind: 'slaw', units: 1 },
  slaw5: { label: 'Slaw ×5', kind: 'slaw', units: 5 },
  side1: { label: 'Dodo side', kind: 'side', units: 1 },
  side5: { label: 'Dodo ×5', kind: 'side', units: 5 },
};
export const PKG_ORDER: PkgId[] = ['pack1', 'pack5', 'foil1', 'foil5', 'cooler', 'water1', 'water6', 'slaw1', 'slaw5', 'side1', 'side5'];

export const CONTAINER_INFO: Record<Container, { name: string; per: number; plural: string }> = {
  pack: { name: 'takeaway pack', plural: 'takeaway packs', per: 1 },
  foil: { name: 'foil wrap', plural: 'foil wraps', per: 1 },
  cooler: { name: 'cooler', plural: 'coolers', per: 10 },
};
export const SIDE_INFO: Record<SideId, { name: string; plural: string }> = {
  water: { name: 'bottle of water', plural: 'bottled water' },
  slaw: { name: 'coleslaw', plural: 'coleslaw' },
  side: { name: 'dodo side', plural: 'dodo sides' },
};

export type Order = {
  dish: DishId;
  people: number;
  container: Container;
  sides: Partial<Record<SideId, number>>;
  customer: number; // index into CUSTOMERS
};

export type Level = {
  title: string;
  tag: string; // e.g. "Owambe order"
  time: number; // seconds
  orders: Order[];
  hint?: boolean;
};

export const LEVELS: Level[] = [
  { title: 'First customer', tag: 'Walk-in order', time: 100, hint: true,
    orders: [{ dish: 'jollof', people: 6, container: 'pack', sides: {}, customer: 0 }] },
  { title: 'Office lunch', tag: 'Office lunch', time: 95, hint: true,
    orders: [{ dish: 'jollof', people: 10, container: 'pack', sides: { water: 10 }, customer: 1 }] },
  { title: 'Friday night suya', tag: 'Friday night', time: 80,
    orders: [{ dish: 'suya', people: 8, container: 'foil', sides: {}, customer: 2 }] },
  { title: 'Birthday party', tag: 'Birthday order', time: 95,
    orders: [{ dish: 'jollof', people: 15, container: 'pack', sides: { side: 15, water: 15 }, customer: 3 }] },
  { title: 'Plates of Eba & Egusi', tag: 'Office lunch', time: 105,
    orders: [{ dish: 'egusi', people: 8, container: 'pack', sides: { water: 8 }, customer: 4 }] },
  { title: 'Hostel dodo run', tag: 'Hostel order', time: 80,
    orders: [{ dish: 'dodo', people: 12, container: 'pack', sides: { slaw: 6 }, customer: 5 }] },
  { title: 'Two orders at once!', tag: 'Church harvest', time: 115,
    orders: [
      { dish: 'jollof', people: 10, container: 'pack', sides: { water: 10 }, customer: 6 },
      { dish: 'suya', people: 8, container: 'foil', sides: {}, customer: 2 },
    ] },
  { title: 'Owambe!', tag: 'Owambe order', time: 105,
    orders: [{ dish: 'jollof', people: 20, container: 'cooler', sides: { water: 20, slaw: 10 }, customer: 7 }] },
  { title: 'Lunch rush', tag: 'Two orders at once', time: 125,
    orders: [
      { dish: 'egusi', people: 10, container: 'pack', sides: { water: 10 }, customer: 8 },
      { dish: 'dodo', people: 10, container: 'pack', sides: { slaw: 5 }, customer: 5 },
    ] },
  { title: 'Owambe finale', tag: 'Chief\'s 60th', time: 130,
    orders: [
      { dish: 'jollof', people: 30, container: 'cooler', sides: { water: 30 }, customer: 9 },
      { dish: 'suya', people: 15, container: 'foil', sides: {}, customer: 9 },
    ] },
];

export const CUSTOMERS = [
  { name: 'Aunty Bisi', skin: '#8D5524', wrap: '#D7263D', female: true },
  { name: 'Mr. Okafor', skin: '#6B3E26', wrap: '#1B998B', female: false },
  { name: 'Emeka', skin: '#7A4A2A', wrap: '#2B1B12', female: false },
  { name: 'Ngozi', skin: '#9C6644', wrap: '#6A3E9E', female: true },
  { name: 'Uncle Tunde', skin: '#5C3A21', wrap: '#F28C28', female: false },
  { name: 'Hajia Amina', skin: '#A0673F', wrap: '#0B6E4F', female: true },
  { name: 'Pastor John', skin: '#6B3E26', wrap: '#2D4F9E', female: false },
  { name: 'Mrs. Bello', skin: '#8D5524', wrap: '#E8A21A', female: true },
  { name: 'Kemi from HR', skin: '#9C6644', wrap: '#D7263D', female: true },
  { name: 'Chief Adewale', skin: '#5C3A21', wrap: '#6A3E9E', female: false },
];

export const UPGRADES = {
  stove: { name: 'Gas cooker', desc: 'Everything cooks 35% faster', price: 6000 },
  bigpot: { name: 'Big iron pot', desc: 'Each scoop feeds more people (fewer drags)', price: 9000 },
} as const;
export type UpgradeId = keyof typeof UPGRADES;

export function stepQty(step: Step, people: number, bigPot: boolean) {
  if (!step.per) return 1;
  const per = bigPot ? Math.round(step.per * 1.5) : step.per;
  return Math.max(1, Math.ceil(people / per));
}

export function containerNeeded(o: Order) {
  return Math.ceil(o.people / CONTAINER_INFO[o.container].per);
}

export function orderPrompt(level: Level, o: Order) {
  const d = DISHES[o.dish];
  if (o.dish === 'egusi') return `${o.people} plates of Eba & Egusi`;
  if (o.dish === 'suya') return `Suya for ${o.people} people`;
  return `${d.short} for ${o.people} people`;
}

export function orderValue(o: Order) {
  return o.people * DISHES[o.dish].price;
}
