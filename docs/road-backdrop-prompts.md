# City backdrop prompts for the level road

Each city's level road runs in front of a wide painted view of that city. Make **two images per city**: part 1 and part 2 join up side by side, and the road scrolls past them slowly.

## How to generate

1. In Gemini, set the aspect ratio to **21:9** (or the widest it offers). No reference image is needed. If you want the style to match the world map, attach `assets/v4/map.webp` as a style reference.
2. Paste the prompt. For part 2, paste the part 2 prompt in the **same chat** straight after part 1, so the two match.
3. Save as PNG or JPG to `assets/road/src/<name>`, for example `assets/road/src/lagos-1.png` and `assets/road/src/lagos-2.png`.
4. Run `node scripts/road-art.mjs`. It shrinks the images to a game-friendly size and plugs them in. A city with no images keeps the drawn skyline.

### What a good backdrop looks like

- The **bottom half** is plain, empty ground (open road verge, earth, sand or grass) with nothing standing on it. The level road is drawn on top of it.
- The **horizon** sits at the middle, with the city's buildings and landmarks along it.
- There's no text, signs with words, logos or people close up.
- Both parts use the same time of day, light and colours.

---

## Lagos: `lagos-1`, `lagos-2`

**Part 1**
```
A wide panoramic painted illustration of Lagos, Nigeria in warm late-afternoon light, seen from street level, for the background of a mobile cooking game. Along the horizon: the Lagos lagoon with the long Third Mainland Bridge crossing it, the Lekki-Ikoyi cable-stayed link bridge, and the high-rise towers of Victoria Island and Ikoyi. Closer in, busy Yaba streets: two- and three-storey buildings with balconies, shop canopies, yellow danfo buses with black stripes, keke napep tricycles, palm trees, power lines. The bottom half of the image is plain, empty open ground (dusty roadside verge and grass) with nothing standing on it. Painterly semi-realistic style, rich colours, soft shadows, slight haze in the distance. No text, no logos, no readable signs, no close-up people.
```
**Part 2**
```
Continue the same Lagos panorama to the right, in exactly the same style, light, colours and horizon height, so the two images join side by side. Along the horizon: Lagos Island skyline, Eko Atlantic towers by the sea, Bar Beach with the Atlantic Ocean, the National Theatre's saucer-shaped roof. Closer in: Balogun market stalls with colourful umbrellas, danfo buses, okada motorbikes, coconut palms. The bottom half is plain, empty open ground with nothing standing on it. No text, no logos, no readable signs, no close-up people.
```

## Ibadan: `ibadan-1`, `ibadan-2`

**Part 1**
```
A wide panoramic painted illustration of Ibadan, Oyo State, Nigeria in warm golden morning light, seen from a low hill, for the background of a mobile cooking game. Along the horizon: endless rolling hills covered in old houses with rusty brown corrugated iron roofs packed close together, the tall Cocoa House tower rising above them, and Bower's Tower on a green hill. Closer in: a red laterite road verge, mango trees, a small roadside buka with a zinc roof, women carrying trays on their heads in the distance. The bottom half of the image is plain, empty red-earth ground with nothing standing on it. Painterly semi-realistic style, rich warm colours, soft shadows, light morning haze. No text, no logos, no readable signs, no close-up people.
```
**Part 2**
```
Continue the same Ibadan panorama to the right, in exactly the same style, light, colours and horizon height, so the two images join side by side. Along the horizon: more brown rusty rooftops over the hills, the University of Ibadan tower, the domes and minarets of the central mosque, Mapo Hall with its white columns on a hilltop. Closer in: Bodija market sheds, palm trees, a yellow taxi in the distance. The bottom half is plain, empty red-earth ground with nothing standing on it. No text, no logos, no readable signs, no close-up people.
```

## Port Harcourt: `ph-1`, `ph-2`

**Part 1**
```
A wide panoramic painted illustration of Port Harcourt, Rivers State, Nigeria at the waterside in soft evening light, for the background of a mobile cooking game. Along the horizon: the Bonny River creek with wooden fishing canoes and a small ferry, thick green mangrove forest, an oil refinery in the distance with tall chimneys and a gas flare glowing orange. Closer in: wooden waterfront houses on stilts, fishing nets drying on poles, coconut palms. The bottom half of the image is plain, empty open ground (sandy waterside earth and grass) with nothing standing on it. Painterly semi-realistic style, rich colours, humid soft light, reflections on the water. No text, no logos, no readable signs, no close-up people.
```
**Part 2**
```
Continue the same Port Harcourt panorama to the right, in exactly the same style, light, colours and horizon height, so the two images join side by side. Along the horizon: the Garden City skyline with office towers and the old port cranes, the river curving away, more mangroves. Closer in: a busy fish market with tarpaulin shades, roadside bole roasting smoke rising, palm trees. The bottom half is plain, empty open ground with nothing standing on it. No text, no logos, no readable signs, no close-up people.
```

## Enugu: `enugu-1`, `enugu-2`

**Part 1**
```
A wide panoramic painted illustration of Enugu, the Coal City, Enugu State, Nigeria in fresh morning light after rain, for the background of a mobile cooking game. Along the horizon: the green rolling Udi hills and escarpment, an old coal mine headframe tower on a hillside, red roads winding up the hills. Closer in: neat bungalows with red roofs, tall trees, an old colonial railway line. The bottom half of the image is plain, empty open ground (grass and red earth) with nothing standing on it. Painterly semi-realistic style, lush greens, soft clouds. No text, no logos, no readable signs, no close-up people.
```
**Part 2**
```
Continue the same Enugu panorama to the right, in exactly the same style, light, colours and horizon height, so the two images join side by side. Along the horizon: more green hills, the city centre with low office buildings, a stadium, a church with a tall spire. Closer in: Ogbete market sheds, palm trees, a yellow tricycle in the distance. The bottom half is plain, empty open ground with nothing standing on it. No text, no logos, no readable signs, no close-up people.
```

## Kano: `kano-1`, `kano-2`

**Part 1**
```
A wide panoramic painted illustration of Kano, Nigeria in warm hazy harmattan afternoon light, for the background of a mobile cooking game. Along the horizon: the ancient Kano city walls of red-brown mud with pointed tops, the green and white domes and minarets of the Kano Central Mosque, the Emir's palace (Gidan Rumfa) with its traditional Hausa mud architecture and raised geometric patterns. Closer in: flat-roofed mud houses with zanko horn points on the roofs, a camel and its herder in the distance, neem trees. The bottom half of the image is plain, empty sandy ground with nothing standing on it. Painterly semi-realistic style, warm ochre and sand colours, dusty haze. No text, no logos, no readable signs, no close-up people.
```
**Part 2**
```
Continue the same Kano panorama to the right, in exactly the same style, light, colours and horizon height, so the two images join side by side. Along the horizon: the Kofar Mata indigo dye pits with blue cloth drying, Dala hill, more mud houses and minarets, groundnut pyramids in the far distance. Closer in: Kurmi market stalls with straw shades, neem trees, a donkey cart. The bottom half is plain, empty sandy ground with nothing standing on it. No text, no logos, no readable signs, no close-up people.
```

## Abuja: `abuja-1`, `abuja-2`

**Part 1**
```
A wide panoramic painted illustration of Abuja, the Federal Capital Territory, Nigeria in clear bright afternoon light, for the background of a mobile cooking game. Along the horizon: the huge granite dome of Aso Rock, the golden dome and four minarets of the Abuja National Mosque, the National Christian Centre. Closer in: wide clean boulevards with palm-lined medians, modern government buildings, green parks. The bottom half of the image is plain, empty open ground (neat grass verge) with nothing standing on it. Painterly semi-realistic style, clean bright colours, blue sky with a few clouds. No text, no logos, no readable signs, no close-up people.
```
**Part 2**
```
Continue the same Abuja panorama to the right, in exactly the same style, light, colours and horizon height, so the two images join side by side. Along the horizon: the Millennium Tower, the Central Bank headquarters, Zuma Rock in the far distance, modern glass office towers. Closer in: Millennium Park trees, a fountain, wide roads. The bottom half is plain, empty open ground with nothing standing on it. No text, no logos, no readable signs, no close-up people.
```
