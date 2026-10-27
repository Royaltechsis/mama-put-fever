# 🍲 Mama Put Fever

A Cooking Fever–style time-management game with Nigerian food. Orders come in like *"Owambe order: Jollof rice for 20 people, 115 seconds"*. You **cook** with drag and drop, **package** the right number of packs and sides, then **deliver** on an okada before the customer vexes.

Built with **Expo (SDK 58) + React Native + TypeScript**. Real drag and drop uses `react-native-gesture-handler` and `react-native-reanimated`. All art is flat vector, drawn in code with `react-native-svg`, so there are no image assets to license.

▶ **Play in your phone browser:** https://mamaputfever.sites.tab.bot/

---

## The loop

| Phase | What you do |
|---|---|
| **1. Order** | A prompt card shows the customer, the order ("Jollof for 15 people"), the clock, the packaging and the sides. |
| **2. Cook** | Drag ingredients from the shelf into the pot, grill, pan or bowl **in recipe order**. Quantities scale with the number of people. Tap **STIR** when the pot bubbles, **FLIP** the suya or dodo halfway, and **TURN** the eba. Food goes from raw to ready to burnt, so drag it onto the serving tray in time. A wrong order, a missed stir or flip, or burnt food lowers quality. 🗑 bins a station and restarts it. |
| **3. Package** | Drag takeaway packs (×1 / ×5), foil wraps or coolers (10 portions each) into the Ghana-must-go bag until the count matches the people. Then add the sides they asked for: bottled water (×1 / ×6), coleslaw, dodo. Wrong container, unordered sides and wasted packs all cost you. Seal the bag. |
| **4. Deliver** | Drag the bag(s) onto the okada and pick a route; one has a go-slow reported. At the junction, tap **GO** on green: green saves 3s, red costs 4s. |
| **5. Score** | You get stars for **Speed**, **Accuracy** and **Quality**, naira for the food, tips for speed, and the customer's reaction ("Chai! This food sweet die! 🔥"). |

### Dishes
- **Jollof Rice**: veg oil → onions → tomato-pepper mix → seasoning → rice. Pot, stir.
- **Suya**: beef sticks on the grill, flip, then yaji and onions. Foil wraps.
- **Eba & Egusi**: two stations at once. Egusi soup (palm oil → egusi → tomato-pepper → crayfish → meat, stir, finish with ugu), plus eba (hot water → garri, then turn it).
- **Dodo (fried plantain)**: veg oil → plantain → salt. Pan, flip.

### 10 levels
1. First customer: Jollof for 6 (tutorial hints)
2. Office lunch: Jollof for 10 + water
3. Friday night suya: Suya for 8 *(unlocks Suya)*
4. Birthday party: Jollof for 15 + 15 dodo sides + 15 water
5. Office lunch: 8 plates of Eba & Egusi *(unlocks Eba & Egusi)*
6. Hostel dodo run: Dodo for 12 + coleslaw *(unlocks Dodo)*
7. Church harvest: **two orders at once**, Jollof for 10 + Suya for 8
8. Owambe! Jollof for 20 in coolers + water + coleslaw
9. Lunch rush: **two orders**, Eba & Egusi for 10 + Dodo for 10 (three stations)
10. Owambe finale (Chief's 60th): Jollof for 30 in coolers + Suya for 15

### Progression
- Coins (₦), best stars and unlocked levels persist on the device with AsyncStorage.
- Dishes unlock as you clear levels.
- Upgrades: **Gas cooker** (₦6,000, everything cooks 35% faster) and **Big iron pot** (₦9,000, each scoop feeds more people, so fewer drags).
- Haptics on native via `expo-haptics`. Sound effects via `expo-audio`; the WAVs are generated, not sampled. There's a mute toggle on the home screen.

---

## Run it

```bash
npm install
npx expo start
```

- **Phone:** install **Expo Go**, then scan the QR code. Every native module used ships in Expo Go: gesture-handler, reanimated, svg, async-storage, haptics, audio.
- **Web:** press `w`, or run `npx expo start --web`.
- **Static web build:** `npx expo export -p web` writes `dist/`, which you can host anywhere (Vercel, Netlify, GitHub Pages).

## Build an APK with EAS

```bash
npm i -g eas-cli            # or use npx eas-cli@latest
eas login
eas build:configure         # links the project to your Expo account (adds projectId)
eas build -p android --profile preview   # → installable .apk
```

`eas.json` ships with three profiles. `preview` builds an internal-distribution **APK**. `production` builds an AAB for the Play Store, so use `eas submit -p android` when you're ready. The Android package is `com.royaltechsis.mamaputfever`; change it in `app.json` if you like.

## Code map

```
App.tsx                 state machine: home → intro → cook → pack → deliver → results, level clock
src/data.ts             ingredients, dishes/recipes, packaging, 10 levels, customers, upgrades
src/game.ts             run state + scoring (speed / accuracy / quality → stars, naira, tips)
src/dnd.tsx             drag-and-drop engine: DragProvider (ghost layer + hit testing), Draggable, DropZone
src/screens/Cook.tsx    stations (pot/grill/pan/bowl), recipe order, cook timer, stir/flip/turn, burn
src/screens/Pack.tsx    packaging counts, sides, Ghana-must-go bag, seal
src/screens/Deliver.tsx load the okada, route choice, traffic-light timing tap
src/screens/Results.tsx stars, earnings, customer reaction
src/art/*               all SVG art (ingredients, vessels, okada, customers, ankara band, stall)
src/fx.ts               haptics + sound
src/storage.ts          AsyncStorage save
```

**Adding a dish:** add its ingredients to `INGREDIENTS`, a recipe to `DISHES` (stations, steps with `per` = people per drag, `finish` toppings, `cookTime`, `action`), and use it in a level in `LEVELS`. The screens read everything from data.

## Prototype limits / ideas next
- One buka, 4 dishes, 10 levels. Next ideas: more locations (Lagos street, owambe hall, campus), puff-puff, akara, pepper soup, and customer queues with patience meters.
- No accounts or cloud save. Progress lives on the device.
- Art is code-drawn placeholder-quality vector. A Nigerian illustrator would take it to store quality.
- Sound is simple synth blips.
