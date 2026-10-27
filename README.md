# Mamaput 🍲🇳🇬

A **Cooking Fever-style** restaurant time-management game that travels across Nigeria: start in a Lagos *mama put* buka, then unlock new cities with stars. Built with **Expo (SDK 58) + React Native + TypeScript**, played in **landscape**.

▶ **Play in the browser:** https://mamaput.sites.tab.bot/ (turn your phone sideways)

## How it plays
- **World map of Nigeria**: Lagos (jollof, chicken, suya, dodo), **Ibadan** (amala + ewedu + gbegiri, asun, fried beef; 8 levels, unlocks at 5⭐) and **Port Harcourt** (bole & fish with pepper sauce, catfish pepper soup, starch + banga, palm wine; 8 levels, unlocks at 12⭐). Enugu, Kano and Abuja are on the map as *coming soon*.
- **Oja (market)**: stalls for pepper & tomato, rice/beans/flour, meat & fish, plantain/yam/greens and drinks. Every pot, grill item and drink uses stock; restock with ₦ (if you run out mid-shift the errand boy buys more at double price). Kitchen gear and decor are sold here too.
- Saves migrate automatically from `mamaput.save.v2` to `mamaput.save.v3` (Lagos progress kept).
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
| Customer arrives | `bell_a/b/c.mp3` + `f_*.mp3` / `m_*.mp3` | A quiet counter bell every time (never the same bell twice running). About 45% of arrivals also get one short voice matched to the customer: women say "Good afternoon o!", "Aunty, good afternoon!", "Ehen?", "Mmm!" or hum; men say "Aunty!", "How far?", "Ẹ kú àsán o!", a satisfied "Ahh", "Mm-hmm" or a grunt. Never the same voice twice in a row, at most one every 6.5 s |
| Burnt | `burnt_a/b.mp3` | "Ehn-ehn! E don burn o!" / "Ah! E don burn!" when grill or fryer food burns (alternating, never the same twice in a row) |
| Angry customer | `angry_a/b.mp3` | "Mtchew! Abeg, I no fit wait!" / "Abeg! Una too slow!" when a customer walks out (alternating; wood thud if two leave within 4 s) |
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

## v5: run a full buka (day loop)

Every level is now one day at the buka:

1. **Morning prep** (`src/v2/Prep.tsx`): three cooking mini-games drawn in SVG. Chop pepper, tomato and onion on the board (tap or swipe). Stir the pot in circles with Low/Med/High heat; it changes colour as it cooks, and leaving high heat unstirred burns the bottom. Fry dodo and flip each piece when it turns golden. Ibadan does amala and fried beef; Port Harcourt does pepper soup and roasted bole. Your prep score decides how many jollof portions start in the cooler, how much dodo starts on the tray, and how much bonus pepper stock you get. Prep can be skipped after the first time.
2. **Service** (`src/v2/Service.tsx`): customers sit on your chairs, eat, pay, and leave a dirty plate. Tap the plate to clear the seat. Hired staff do their jobs on screen: the cleaner clears plates, the waiter carries finished plates, drinks and coins, and the cook keeps the pot and grill going.
3. **Day summary** (`src/v2/DaySummary.tsx`): food sales, tips, wages and profit.
4. **My Buka** (`src/v2/MyBuka.tsx`), reachable from the map, city screen and summary: extra seats (3→5), wooden or cushioned chairs, canopy, generator, TV, the older decor, and hiring a cleaner (2⭐), waiter (5⭐) or cook (9⭐) for a daily wage.

The save is now `mamaput.save.v4`. A v3 save migrates automatically and the v3 key is kept as a backup.

## Accounts (optional)

Players can create an account (username, email, password) at any time from the **Save progress** button on the map. The game still works fully as a guest with the save on the device. An account just keeps progress safe across devices.

- API: Vercel serverless functions in `/api`: `auth/signup`, `auth/login`, `auth/logout`, `auth/me`, and `save` (GET/PUT). They live in the same project and are served from the same domain as the game.
- Database: Neon Postgres through `@neondatabase/serverless`. The tables `mp_users` and `mp_saves` are created automatically on the first call.
- Passwords are hashed with bcrypt. The session is an httpOnly cookie signed with `SESSION_SECRET`.
- On login or signup, the device save and the account save are compared, and the one with more progress (stars, then days, then coins) is kept. After that, the save goes up to the account at the end of every day.
- The static copies on `*.sites.tab.bot` have no API, so there the button explains that accounts live on the main site.

### Set-up (one time, in Vercel → Project → Settings → Environment Variables)

1. `DATABASE_URL`: your Neon connection string (`postgresql://...`).
2. `SESSION_SECRET`: any long random string, e.g. the output of `openssl rand -hex 32`.

Then redeploy. Until both are set, the account screen shows "Accounts are not set up on this server yet." and the game keeps working as a guest.

Local test of the API without a database: `npm i --no-save pg-mem`, then run a harness that sets `globalThis.__mp_q` to a pg-mem query function (see `api/_lib.js`).
