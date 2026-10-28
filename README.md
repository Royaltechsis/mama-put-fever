# Mamaput 🍲🇳🇬

A **Cooking Fever-style** restaurant time-management game that travels across Nigeria: start in a Lagos *mama put* buka, then unlock new cities with stars. Built with **Expo (SDK 58) + React Native + TypeScript**, played in **landscape**.

▶ **Play in the browser:** https://mamaput.sites.tab.bot/ (turn your phone sideways)

## How it plays
- **World map of Nigeria**: Lagos (jollof, chicken, suya, dodo), **Ibadan** (amala + ewedu + gbegiri, asun, fried beef; 8 levels, unlocks at 5⭐) and **Port Harcourt** (bole & fish with pepper sauce, catfish pepper soup, starch + banga, palm wine; 8 levels, unlocks at 12⭐). Enugu, Kano and Abuja are on the map as *coming soon*.
- **Oja (market)**: stalls for pepper & tomato, rice/beans/flour, meat & fish, plantain/yam/greens and drinks. Every pot, grill item and drink uses stock; restock with ₦ (if you run out mid-shift the errand boy buys more at double price). Kitchen gear and decor are sold here too.
- Saves migrate automatically from `mamaput.save.v2` to `mamaput.save.v3` (Lagos progress kept).
- The dining room is a **real 3D scene** (three.js through react-three-fiber, low-poly): a back wall with windows and string lights, a plank floor and rug, wooden tables with chairs, and a pass counter with the kitchen behind it. Customers are 3D figures that walk in from the door, sit (two to a table, up to 6 seats), eat from a 3D plate, pay and walk out. The camera is orthographic and tilted, so the 2D layer (order bubbles, drop targets, coins, the cooking area) lines up exactly.
- Cook on real stations: **jollof pot** and **egusi pot** (follow the recipe), **suya grill** (chicken / beef suya), **deep fryer** (dodo / puff-puff), **drink machine** (zobo / chapman), **eba**.
- **Recipes are timed.** Open the 📜 recipe book (it also opens on its own the first time). Pots need the right ingredients from the shelf in the right order, and each one has a green timing window on the pot's bar: too early or too late costs quality, a wrong ingredient spoils the batch. Then simmer and tap the pot to stir, or it catches.
- **Grill and fryer** have a timing bar (green = perfect, orange = risky, red = burns). Chicken and suya must be **flipped** halfway (tap the 🔄). Burnt food goes to the bin, and dumping a bad pot in the bin costs ₦50.
- Everything is scored **1–5★**, and the plate shows the average. A ruined 1★ dish is sent back, ★★ pays 55% with no tip, ★★★ 75%, ★★★★ 90%, ★★★★★ pays full with a bigger tip.
- Assemble **plates** (jollof + chicken, + dodo; eba + egusi; suya + yaji…) and drag them (or tap them) to the right table.
- Every customer leaves a **review** from the food quality and how long they waited. Your buka's **⭐ rating** carries over between days: a good rating brings more customers, longer patience and bigger tips, a bad one the opposite.
- Served customers leave **coins on the table**. Tap to collect, then tap the dirty plate to clear the table (a hired waiter and cleaner do both). Quick serves build **combos**.
- **Chef level**: good dishes earn XP. Each level widens the timing windows a little and adds a bit to tips.
- **12 levels** with coin goals and **3 stars**. Fixed customer scripts, so you can practise and master each one.
- **Owambe events** (levels 4, 8, 12): a bulk party order where you **cook for 15–30** (quantities scale with the guest count), **package** the right number of packs/coolers plus water, then pick a route for the **okada delivery**.
- **Hired help** (My Buka → Hire help): up to 3 waiters, 2 cleaners and 2 cooks, each a named person who unlocks with total stars and has their own level and wage (₦1,200–₦4,400 a day at level 1). Waiters and cleaners walk the lane and aisles between tables, cooks work behind the counter. Workers earn experience by working and you pay to **train** them: faster walking, steadier hands (a low-skill cook misses timing windows), a higher wage. They also tire as the day goes on. Waiters and cleaners are 3D people who walk the lane in front of the tables and the gaps between them; waiters collect plates and drinks at the pass; cooks work behind it.
- **Kitchen upgrades** (grill slots, pot portions, fryer speed and baskets, pour speed, extra plate) and **decor upgrades** (Ankara makeover, ceiling fans, Afrobeats speaker → more patience/tips). Coins, stars and upgrades are saved with AsyncStorage.
- **Pause menu**: the pause button (or Esc, or switching tabs) freezes the clock, the customers, the staff, the cooking timers and the 3D room, and opens a menu with Resume, Restart, sound and music toggles, and Leave level (restart and leave both ask for a second tap).
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
- `src/v2/Service.tsx`: the restaurant round (customers, stations, plates, coins, combos, staff AI).
- `src/v2/recipes.ts`: pot recipes, timing windows, quality scoring, pay and review text.
- `src/v2/Dining.tsx`: seat and table plan, and the 2D overlays on the 3D seats (order bubble, drop target, coins, dirty plate), review chips, staff name tags.
- `src/v2/world3d/`: the 3D dining room. `geom.ts` (projection between the 3D room and the stage), `Room.tsx` (floor, walls, furniture, pass counter), `Person.tsx` (low-poly people and their animations), `World3D.tsx` (scene, lights, customers, staff), `GLCanvas.web.tsx` / `GLCanvas.tsx` (web DOM canvas and native expo-gl).
- `src/v2/CookUI.tsx`: timing bars, steam and the recipe book.
- `src/v2/OwambeEvent.tsx`: bulk order: cook for N → package → okada delivery.
- `src/v2/data2.ts`: menu, 12 levels, deterministic customer scripts, star goals, upgrades.
- `src/v2/Home2.tsx`, `src/v2/LevelCards.tsx`: map, shops, intro and results cards.
- `src/v2/stage.tsx`: fixed 844×390 landscape stage scaled to any screen, plus a rotate-your-phone hint when the window is narrower than `MIN_PLAY_WIDTH` (square tablets and portrait laptops just letterbox).
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

## Install as an app (PWA)

Mamaput is an installable Progressive Web App. It has `public/manifest.json` (fullscreen, landscape, normal and maskable icons), Apple home-screen meta tags, and a service worker (`public/sw.js`).

After the first visit, the game shell, the game code and the art and audio are cached, so guest play works offline. Account sign-in and sync always need the network.

- On Android/Chrome: menu → **Install app**.
- On iPhone/Safari: Share → **Add to Home Screen**.
