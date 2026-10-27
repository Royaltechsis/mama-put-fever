# Mamaput 🍲🇳🇬

A **Cooking Fever-style** restaurant time-management game set in a Lagos *mama put* buka. Built with **Expo (SDK 58) + React Native + TypeScript**, played in **landscape**.

▶ **Play in the browser:** https://mamaput.sites.tab.bot/ (turn your phone sideways)

## How it plays
- Customers queue at your counter (up to 4 at once), each with an order bubble and a draining patience bar.
- Cook on real stations: **jollof pot** (refill it by dragging in tomato-pepper → rice), **suya grill** (chicken / beef suya), **deep fryer** (dodo / puff-puff), **drink machine** (zobo / chapman), **egusi pot + eba**.
- Grill and fryer items go **raw → ready → burnt**. Drag burnt food to the bin.
- Assemble **plates** (jollof + chicken, + dodo; eba + egusi; suya + yaji…) and drag them (or tap them) to the right customer.
- Served customers leave **coins on the counter**. Tap to collect, which frees the spot for the next customer. Quick serves build **combos**, and happy customers tip more.
- **12 levels** with coin goals and **3 stars**. Fixed customer scripts, so you can practise and master each one.
- **Owambe events** (levels 4, 8, 12): a bulk party order where you **cook for 15–30** (quantities scale with the guest count), **package** the right number of packs/coolers plus water, then pick a route for the **okada delivery**.
- **Kitchen upgrades** (grill slots, pot portions, fryer speed and baskets, pour speed, extra plate) and **decor upgrades** (Ankara makeover, ceiling fans, Afrobeats speaker → more patience/tips). Coins, stars and upgrades are saved with AsyncStorage.
- Real drag and drop (react-native-gesture-handler + reanimated), haptics on device.
- **Naija sound**: an original Afrobeats/highlife theme loop (talking drum, shekere, highlife guitar) under the menu, a softer mix plus a low market ambience during service, and buka sound effects. Music and sounds have separate on/off toggles on the home screen.

## Run it
```bash
npm install
npx expo start          # scan with Expo Go (Android/iOS)
npx expo start --web    # browser
npx expo export -p web  # static web build in dist/
```

## Deploy to Vercel
1. On vercel.com: **Add New → Project → Import** `Royaltechsis/mama-put-fever`.
2. Leave every setting as is. `vercel.json` already sets the build (`npx expo export -p web`), the output folder (`dist`) and the single-page rewrite.
3. Click **Deploy**. Every push to `main` redeploys automatically.

## Get an installable Android APK (EAS)
```bash
git clone https://github.com/Royaltechsis/mama-put-fever.git
cd mama-put-fever
npm i
npx eas-cli login
npx eas-cli build -p android --profile preview
```
`eas.json` already has a `preview` profile that builds an **APK** (`buildType: apk`), and `app.json` sets the Android package `com.royaltechsis.mamaputfever`. On the first build EAS asks to create/link a project and to generate a keystore. Answer **Yes** to both. When the build finishes it prints a link and QR code for downloading the APK.

## Code map
- `App.tsx`: screen flow (map → level intro → service → Owambe event → results) and persistence.
- `src/v2/Service.tsx`: the restaurant round (customers, stations, plates, coins, combos).
- `src/v2/OwambeEvent.tsx`: bulk order: cook for N → package → okada delivery.
- `src/v2/data2.ts`: menu, 12 levels, deterministic customer scripts, star goals, upgrades.
- `src/v2/Home2.tsx`, `src/v2/LevelCards.tsx`: map, shops, intro and results cards.
- `src/v2/stage.tsx`: fixed 844×390 landscape stage scaled to any screen, plus a rotate-your-phone hint in portrait.
- `src/dnd.tsx`: drag-and-drop layer (ghost, drop zones, tap fallback).
- `assets/v2/`: generated cartoon art (restaurant, appliances, food, customers) as webp sprites.

## Sounds

All audio is original and generated for this project (no samples from existing songs). Files live in `assets/audio/` and are wired in `src/fx.ts`.

| Cue | File | When it plays |
|---|---|---|
| Theme | `theme.mp3` | 58 s seamless Afrobeats/highlife loop, ~112 BPM. Loud on menus, soft during service |
| Market ambience | `ambience.mp3` | Low Lagos market bed (chatter, pots, distant horns) during service |
| Title flourish | `win.mp3` | Plays once when the title screen first starts the music |
| Customer call | `customer_b.mp3` | "Customer! Come and chop!" when a customer arrives (at most every 7 s; a drum tap otherwise) |
| Burnt | `burnt_a/b.mp3` | "Ehn-ehn! E don burn o!" / "Ah! E don burn!" when grill or fryer food burns |
| Angry customer | (wood thud for now) | An "Abeg!" voice line is planned for when a customer walks out |
| Talking-drum tap | `pop.mp3` | Serving one item |
| Pot plop | `plop.mp3` | Ingredient into the pot, stirring |
| Wood thud | `bad.mp3` | Wrong move |
| Agogo bell | `ding.mp3` | Pot ready |
| Sizzle | `sizzle.mp3` | Meat/plantain hits the grill or fryer |
| Highlife lick | `lick.mp3` | Order complete |
| Talking-drum roll | `combo.mp3` | Order complete during a combo |
| Cha-ching + drum | `cash.mp3` | Collecting naira |
| Okada horn | `horn.mp3` | Owambe delivery route |
| Shekere + drum flourish | `win.mp3` | Level complete |
| Sad sax | `fail.mp3` | Level failed |

Art and audio are AI-generated for this project. Gameplay mechanics are inspired by Cooking Fever; no assets come from it.
