// Destinations (Cooking Fever-style restaurants across Nigeria).
// The kitchen mechanics are shared; each destination re-skins them with its own dishes, art, customers and levels.
import { SPR } from './assets';
import { MENU, LEVELS2, growLevels, type Level2, type MenuItem } from './data2';

export type DestId = 'lagos' | 'ibadan' | 'ph' | 'enugu' | 'abuja' | 'kano';
import type { StockKey } from './save2';
export type { StockKey };

export const STOCK_INFO: Record<StockKey, { name: string; stall: string; pack: number; price: number; icon: any }> = {
  pepper: { name: 'Pepper & tomato', stall: 'Iya Bisi’s pepper stall', pack: 20, price: 400, icon: require('../../assets/v4/m_pepper.webp') },
  grains: { name: 'Rice, beans & flour', stall: 'Alhaji’s grains', pack: 20, price: 500, icon: require('../../assets/v4/m_grains.webp') },
  protein: { name: 'Meat & fish', stall: 'Mama Nkechi’s meat & fish', pack: 20, price: 900, icon: require('../../assets/v4/m_protein.webp') },
  produce: { name: 'Plantain, yam & greens', stall: 'Plantain & yam corner', pack: 20, price: 400, icon: require('../../assets/v4/m_produce.webp') },
  drinks: { name: 'Drinks', stall: 'Cold drinks', pack: 20, price: 500, icon: require('../../assets/v4/m_drinks.webp') },
};
export const RUNNER_MUL = 2; // the errand boy charges double

type Labels = { blend: string; rice: string; ugu: string; eba: string; chicken: string; suya: string; plantain: string; batter: string; yaji: string; jollof: string; egusi: string; dodo: string; puffpuff: string; zobo: string; chapman: string };

export type Dest = {
  id: DestId; name: string; state: string; place: string; tagline: string; color: string;
  pin: { x: number; y: number }; // on the 844x390 map stage
  starsToUnlock: number; // total stars (all destinations) needed
  playable: boolean;
  menu?: Record<string, MenuItem>;
  levels?: Level2[];
  labels?: Labels;
  stockOf?: Record<string, StockKey>; // ingredient source id -> market stock it drains
  skin?: () => void;
  signature: string;
};

const BASE = {
  bg: [...SPR.bg], food: { ...SPR.food }, burnt: { ...SPR.burnt }, props: { ...SPR.props }, appl: { ...SPR.appl }, cust: [...SPR.cust],
};

const LAGOS_LABELS: Labels = { blend: 'Tomato-pepper', rice: 'Rice', ugu: 'Ugu', eba: 'Eba', chicken: 'Chicken', suya: 'Suya', plantain: 'Plantain', batter: 'Batter', yaji: 'Yaji', jollof: 'jollof', egusi: 'egusi', dodo: 'dodo', puffpuff: 'puff-puff', zobo: 'Zobo', chapman: 'Chapman' };
export const LBL: Labels = { ...LAGOS_LABELS };
export const STOCK_OF: Record<string, StockKey> = {};

const LAGOS_MENU: Record<string, MenuItem> = { ...MENU };
// names for the levels after the hand-made ones, in order
const LAGOS_NAMES = ['Yaba tech week', 'Danfo drivers', 'Rainy season', 'Mainland Owambe', 'Sabo market day', 'Unilag convocation', 'Jollof wars', 'Third Mainland traffic',
  'Eko Atlantic lunch', 'Detty December', 'Surulere derby', 'Ikeja wedding', 'Balogun shoppers', 'Lekki brunch', 'Fela night', 'Iyana Ipaja rush',
  'Ajah carnival', 'Victoria Island suits', 'Bar beach Sunday', 'Ikorodu homecoming', 'Oshodi madness', 'Lagos Marathon', 'Owambe of owambes', 'Festac reunion',
  'Ebute Metta feast', 'Agege bread rush', 'Christmas Eve', 'Mamaput legend'];
const IBADAN_NAMES = ['Mokola matinee', 'Agodi gardens', 'Bower tower climb', 'Oje market', 'Polytechnic rush', 'Iwo road travellers', 'Sango crossroads', 'Ring road jam',
  'Cocoa house lunch', 'Oke Ado elders', 'Challenge park', 'Eleyele fishermen', 'Mapo hall wedding', 'Ojoo junction', 'Apata Sunday', 'Liberty stadium',
  'Akobo estate', 'Molete moonlight', 'Bodija night market', 'Ibadan carnival', 'Oluyole bosses', 'Gate rush hour', 'Amala marathon', 'Egungun festival',
  'Ogunpa rainstorm', 'Agbowo hostel run', 'Old Oyo road', 'Ojude Oba', 'Arulogun crowd', 'Basorun feast', 'Olubadan coronation', 'Amala royalty'];
const PH_NAMES = ['Creek road fishers', 'Mile one market', 'Trans Amadi shift', 'Uniport freshers', 'Borokiri breeze', 'Rumuokoro rush', 'Diobu Sunday', 'Choba campus',
  'Bonny ferry', 'Kalabari wrestling', 'Elelenwo evening', 'Rumuola jam', 'Abonnema boat race', 'Oil boom party', 'Woji estate', 'GRA garden party',
  'Port fish market', 'Okrika regatta', 'Rivers carnival', 'Eleme refinery lunch', 'Buguma festival', 'Harmattan haze', 'Pepper soup night', 'Ikwerre road rush',
  'Ogoni harvest', 'Garden City gala', 'Bori camp', 'Amanyanabo feast', 'Waterside wedding', 'Bole king', 'Rivers delight', 'Chief of the creeks'];
const LAGOS_LEVELS: Level2[] = growLevels([...LEVELS2], MENU, LAGOS_NAMES, true);

const V4 = {
  amala: require('../../assets/v4/amala.webp'), ewedu: require('../../assets/v4/ewedu.webp'), gbegiri: require('../../assets/v4/gbegiri.webp'),
  goat_raw: require('../../assets/v4/goat_raw.webp'), asun: require('../../assets/v4/asun.webp'), asun_burnt: require('../../assets/v4/asun_burnt.webp'),
  beef_raw: require('../../assets/v4/beef_raw.webp'), beefstew: require('../../assets/v4/beefstew.webp'), beefstew_burnt: require('../../assets/v4/beefstew_burnt.webp'),
  elubo: require('../../assets/v4/elubo.webp'), kettle: require('../../assets/v4/kettle.webp'), beans: require('../../assets/v4/beans.webp'),
  bole: require('../../assets/v4/bole.webp'), bole_burnt: require('../../assets/v4/bole_burnt.webp'), plantain_whole: require('../../assets/v4/plantain_whole.webp'),
  fish: require('../../assets/v4/fish.webp'), fish_burnt: require('../../assets/v4/fish_burnt.webp'), fish_raw: require('../../assets/v4/fish_raw.webp'),
  peppersauce: require('../../assets/v4/peppersauce.webp'), peppersoup: require('../../assets/v4/peppersoup.webp'), banga: require('../../assets/v4/banga.webp'),
  starch: require('../../assets/v4/starch.webp'), palmfruit: require('../../assets/v4/palmfruit.webp'), catfish: require('../../assets/v4/catfish.webp'),
  palmwine: require('../../assets/v4/palmwine.webp'),
  bgIbadan: require('../../assets/v4/bg_ibadan.webp'), bgPH: require('../../assets/v4/bg_ph.webp'),
  ci: [require('../../assets/v4/ci0.webp'), require('../../assets/v4/ci1.webp'), require('../../assets/v4/ci2.webp'), require('../../assets/v4/ci3.webp'), require('../../assets/v4/ci4.webp'), require('../../assets/v4/ci5.webp')],
  cp: [require('../../assets/v4/cp0.webp'), require('../../assets/v4/cp1.webp'), require('../../assets/v4/cp2.webp'), require('../../assets/v4/cp3.webp'), require('../../assets/v4/cp4.webp'), require('../../assets/v4/cp5.webp')],
};
export const MAP_BG = require('../../assets/v4/map.webp');
export const MARKET_BG = require('../../assets/v4/market.webp');
export const NAIRA = require('../../assets/v4/naira.webp');

const L = (name: string, duration: number, customers: number, menu: string[], maxItems: number, gap: number, patience: number, isNew?: string): Level2 => ({ name, duration, customers, menu, maxItems, gap, patience, isNew });

export const DESTS: Dest[] = [
  {
    id: 'lagos', name: 'Lagos', state: 'Lagos State', place: 'Mamaput Buka, Yaba', tagline: 'Jollof, chicken, suya & dodo', color: '#F28C28',
    pin: { x: 116, y: 262 }, starsToUnlock: 0, playable: true, signature: 'Jollof + chicken + dodo',
    menu: LAGOS_MENU, levels: LAGOS_LEVELS, labels: LAGOS_LABELS,
    stockOf: { blend: 'pepper', rice: 'grains', ugu: 'produce', chicken_raw: 'protein', suya_raw: 'protein', plantain: 'produce', batter: 'grains', drinks: 'drinks' },
  },
  {
    id: 'ibadan', name: 'Ibadan', state: 'Oyo State', place: 'Iya Basira’s Amala Joint, Bodija', tagline: 'Amala, ewedu, gbegiri & asun', color: '#8C5A2B',
    pin: { x: 186, y: 64 }, starsToUnlock: 5, playable: true, signature: 'Abula: amala + gbegiri + ewedu',
    labels: { blend: 'Hot water', rice: 'Elubo', ugu: 'Peeled beans', eba: 'Ewedu', chicken: 'Goat meat', suya: 'Suya', plantain: 'Beef', batter: 'Batter', yaji: 'Yaji', jollof: 'amala', egusi: 'gbegiri', dodo: 'fried beef', puffpuff: 'puff-puff', zobo: 'Zobo', chapman: 'Chapman' },
    stockOf: { blend: 'pepper', rice: 'grains', ugu: 'grains', chicken_raw: 'protein', plantain: 'protein', drinks: 'drinks' },
    menu: {
      ae: { name: 'Amala + ewedu', comps: ['jollof', 'eba'], price: 900 },
      abula: { name: 'Abula (amala, gbegiri, ewedu)', comps: ['jollof', 'egusi', 'eba'], price: 1500 },
      abulab: { name: 'Abula + fried beef', comps: ['jollof', 'egusi', 'eba', 'dodo'], price: 2200 },
      aeb: { name: 'Amala, ewedu + beef', comps: ['jollof', 'eba', 'dodo'], price: 1500 },
      asun: { name: 'Asun (peppered goat)', comps: ['chicken'], price: 1100 },
      zobo: { name: 'Zobo', drink: 'zobo', price: 300 },
      chapman: { name: 'Chapman', drink: 'chapman', price: 450 },
    },
    levels: [
      L('Bodija morning', 100, 5, ['ae'], 1, 11, 46, 'Amala pot: hot water → elubo. Ewedu from the bowl'),
      L('Gbegiri day', 105, 6, ['ae', 'abula'], 1, 10, 45, 'Gbegiri pot: hot water → peeled beans'),
      L('Thirsty students', 105, 7, ['ae', 'abula', 'zobo'], 2, 10, 43),
      L('Meat sef', 110, 7, ['abula', 'aeb', 'zobo'], 2, 9.5, 42, 'Fry beef for the plate'),
      L('Asun o’clock', 115, 8, ['abula', 'asun', 'aeb', 'chapman'], 2, 9, 41, 'Asun: goat meat on the grill'),
      L('Dugbe market rush', 120, 9, ['abulab', 'ae', 'asun', 'zobo', 'chapman'], 2, 8.5, 40),
      L('UI exam week', 120, 10, ['abula', 'aeb', 'asun', 'zobo'], 3, 8, 38),
      L('Olubadan’s feast', 130, 11, ['abulab', 'abula', 'asun', 'aeb', 'chapman', 'zobo'], 3, 7.5, 37),
    ],
    skin: () => {
      Object.assign(SPR.food, { jollof: V4.amala, egusi: V4.gbegiri, eba: V4.ewedu, chicken_raw: V4.goat_raw, chicken: V4.asun, plantain: V4.beef_raw, dodo: V4.beefstew });
      Object.assign(SPR.burnt, { chicken: V4.asun_burnt, dodo: V4.beefstew_burnt });
      Object.assign(SPR.props, { blend: V4.kettle, rice: V4.elubo, ugu: V4.beans });
      SPR.bg.splice(0, 2, V4.bgIbadan, V4.bgIbadan); SPR.cust.splice(0, 6, ...V4.ci);
    },
  },
  {
    id: 'ph', name: 'Port Harcourt', state: 'Rivers State', place: 'Waterside Bole Spot, Rumuola', tagline: 'Bole & fish, pepper soup, starch & banga', color: '#1F7A8C',
    pin: { x: 540, y: 328 }, starsToUnlock: 12, playable: true, signature: 'Bole & fish with pepper sauce',
    labels: { blend: 'Water', rice: 'Catfish & spices', ugu: 'Palm fruit', eba: 'Starch', chicken: 'Croaker fish', suya: 'Plantain', plantain: 'Plantain', batter: 'Batter', yaji: 'Pepper sauce', jollof: 'pepper soup', egusi: 'banga', dodo: 'dodo', puffpuff: 'puff-puff', zobo: 'Zobo', chapman: 'Palm wine' },
    stockOf: { blend: 'pepper', rice: 'protein', ugu: 'produce', chicken_raw: 'protein', suya_raw: 'produce', drinks: 'drinks' },
    menu: {
      bole: { name: 'Bole + pepper sauce', comps: ['suya', 'yaji'], price: 900 },
      bolefish: { name: 'Bole & fish', comps: ['suya', 'yaji', 'chicken'], price: 2000 },
      fish: { name: 'Grilled croaker', comps: ['chicken'], price: 1200 },
      psoup: { name: 'Catfish pepper soup', comps: ['jollof'], price: 1400 },
      banga: { name: 'Starch + banga soup', comps: ['eba', 'egusi'], price: 1600 },
      zobo: { name: 'Zobo', drink: 'zobo', price: 300 },
      chapman: { name: 'Palm wine', drink: 'chapman', price: 500 },
    },
    levels: [
      L('Waterside opening', 100, 5, ['bole'], 1, 11, 46, 'Bole: plantain on the grill, then pepper sauce'),
      L('Fish don land', 105, 6, ['bole', 'bolefish'], 1, 10, 45, 'Croaker fish on the grill'),
      L('Palm wine evening', 110, 7, ['bolefish', 'bole', 'chapman'], 2, 10, 43, 'Palm wine from the keg'),
      L('Pepper soup weather', 110, 8, ['bolefish', 'psoup', 'chapman'], 2, 9.5, 42, 'Pepper soup pot: water → catfish & spices'),
      L('Oil workers’ lunch', 115, 8, ['bolefish', 'fish', 'psoup', 'zobo'], 2, 9, 41),
      L('Starch & banga', 120, 9, ['banga', 'bole', 'psoup', 'chapman'], 2, 8.5, 40, 'Banga pot: water → palm fruit. Starch from the tray'),
      L('Garden City rush', 125, 10, ['bolefish', 'banga', 'psoup', 'zobo', 'chapman'], 3, 8, 38),
      L('Chief’s boat party', 130, 11, ['bolefish', 'banga', 'psoup', 'fish', 'chapman', 'zobo'], 3, 7.5, 37),
    ],
    skin: () => {
      Object.assign(SPR.food, { jollof: V4.peppersoup, egusi: V4.banga, eba: V4.starch, chicken_raw: V4.fish_raw, chicken: V4.fish, suya_raw: V4.plantain_whole, suya: V4.bole });
      Object.assign(SPR.burnt, { chicken: V4.fish_burnt, suya: V4.bole_burnt });
      Object.assign(SPR.props, { blend: V4.kettle, rice: V4.catfish, ugu: V4.palmfruit, yaji: V4.peppersauce, chapman: V4.palmwine });
      SPR.bg.splice(0, 2, V4.bgPH, V4.bgPH); SPR.cust.splice(0, 6, ...V4.cp);
    },
  },
  { id: 'enugu', name: 'Enugu', state: 'Enugu State', place: 'Coal City Kitchen', tagline: 'Abacha, nkwobi & ofe onugbu', color: '#2E7D32', pin: { x: 672, y: 212 }, starsToUnlock: 30, playable: false, signature: 'Abacha & nkwobi' },
  { id: 'abuja', name: 'Abuja', state: 'FCT', place: 'Aso Rock Grand Buka', tagline: 'The finale: every dish in one kitchen', color: '#B8860B', pin: { x: 442, y: 112 }, starsToUnlock: 45, playable: false, signature: 'Finale mix' },
  { id: 'kano', name: 'Kano', state: 'Kano State', place: 'Sabon Gari Suya Spot', tagline: 'Suya, masa, tuwo & kunu', color: '#C0392B', pin: { x: 650, y: 54 }, starsToUnlock: 38, playable: false, signature: 'Masa & suya' },
];

// top Ibadan and Port Harcourt up to the full level count, from their own menus
const MORE_NAMES: Partial<Record<DestId, string[]>> = { ibadan: IBADAN_NAMES, ph: PH_NAMES };
DESTS.forEach((d) => { const names = MORE_NAMES[d.id]; if (names && d.levels && d.menu) d.levels = growLevels(d.levels, d.menu, names); });

export const destById =(id: string) => DESTS.find((d) => d.id === id) ?? DESTS[0];

/** Swap the shared kitchen over to a destination: its menu, levels, art, labels, stock mapping. */
export function activateDest(id: DestId) {
  const d = destById(id);
  if (!d.playable || !d.menu || !d.levels) return;
  Object.assign(SPR.food, BASE.food); Object.assign(SPR.burnt, BASE.burnt); Object.assign(SPR.props, BASE.props); Object.assign(SPR.appl, BASE.appl);
  SPR.bg.splice(0, SPR.bg.length, ...BASE.bg); SPR.cust.splice(0, SPR.cust.length, ...BASE.cust);
  Object.keys(MENU).forEach((k) => delete (MENU as any)[k]); Object.assign(MENU, d.menu);
  LEVELS2.splice(0, LEVELS2.length, ...d.levels);
  Object.assign(LBL, d.labels ?? LAGOS_LABELS);
  Object.keys(STOCK_OF).forEach((k) => delete STOCK_OF[k]); Object.assign(STOCK_OF, d.stockOf ?? {});
  d.skin?.();
}
