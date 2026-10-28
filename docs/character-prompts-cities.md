# Customer prompts for the other cities

One sprite sheet per customer, the same way as the Lagos ones (see `docs/character-sprite-prompts.md` for the checklist).

## How to generate

1. Attach the images listed under the character, **in the order given**.
   - **Ibadan and Port Harcourt:** attach two images, the customer's current portrait, then the Lagos sheet `assets/anim/src/c2.png`. The portrait keeps the person and the Lagos sheet keeps the cartoon style and the grid. Their portraits are drawn more realistically than Lagos, so without the second image they won't match.
   - **Enugu, Kano and Abuja:** these are new characters, so attach only `assets/anim/src/c2.png` as the style reference.
2. Paste the prompt exactly as written.
3. Save as PNG to `assets/anim/src/<name>.png` using the name given, then run `node scripts/slice-characters.mjs`.

Ibadan and Port Harcourt customers switch over in the game as soon as their sheet is sliced. Enugu, Kano and Abuja sheets are kept ready for when those cities become playable.

---

## Ibadan (Oyo State): Iya Basira’s Amala Joint, Bodija

These customers already have portraits in the game. The prompt keeps the person from the portrait but redraws them in the Lagos cartoon style.

### ci0: Baba in agbada
Attach: `assets/v4/ci0.webp`, then `assets/anim/src/c2.png` · Save as: `assets/anim/src/ci0.png`

```
The first attached image is the character: keep the same person (face, skin tone, hair, outfit and colours). The second attached image is the style and layout reference: copy its cartoon painting style, its line work and shading, and its 4 by 2 grid of poses.

Create a sprite sheet for a 2D mobile cooking game.

Character: a cheerful elderly Yoruba man with a short white beard and moustache, wearing a royal-blue agbada over a matching buba and sokoto trousers, a matching blue fila cap, and brown leather slippers. He walks slowly and proudly.

Layout: one 16:9 image divided into a 4 by 2 grid of 8 equal cells. No borders, no grid lines, no text, no numbers. The background is solid flat pure green (#00FF00) everywhere, with no floor, no shadows and no gradient.

Every cell shows the same character, full body from head to shoes, fully inside the cell with a small margin, drawn at the same size and scale in every cell, with the feet at the same height in every cell.

Top row, left to right, a walking cycle moving to the right, in a three-quarter side view facing right:
1. left foot forward, heel touching the ground, right arm swinging forward
2. legs passing each other, body slightly raised
3. right foot forward, heel touching the ground, left arm swinging forward
4. legs passing each other, body slightly raised

Bottom row, left to right, facing the viewer:
5. standing relaxed with a warm smile
6. sitting on an invisible stool, hands resting forward as if on a table, smiling
7. sitting and eating, lifting a spoon to his mouth
8. sitting and chewing happily with eyes closed, spoon lowered

Style: bright, warm, glossy cartoon art like a casual mobile cooking game, clean dark outlines, soft cel shading, friendly happy expression, Nigerian character design.
```

### ci1: Gele auntie
Attach: `assets/v4/ci1.webp`, then `assets/anim/src/c2.png` · Save as: `assets/anim/src/ci1.png`

```
The first attached image is the character: keep the same person (face, skin tone, hair, outfit and colours). The second attached image is the style and layout reference: copy its cartoon painting style, its line work and shading, and its 4 by 2 grid of poses.

Create a sprite sheet for a 2D mobile cooking game.

Character: a warm, smiling Yoruba woman wearing a large orange and brown Ankara gele headwrap, a matching short-sleeved buba blouse and an ankle-length matching wrapper skirt, small gold earrings and simple sandals.

Layout: one 16:9 image divided into a 4 by 2 grid of 8 equal cells. No borders, no grid lines, no text, no numbers. The background is solid flat pure green (#00FF00) everywhere, with no floor, no shadows and no gradient.

Every cell shows the same character, full body from head to shoes, fully inside the cell with a small margin, drawn at the same size and scale in every cell, with the feet at the same height in every cell.

Top row, left to right, a walking cycle moving to the right, in a three-quarter side view facing right:
1. left foot forward, heel touching the ground, right arm swinging forward
2. legs passing each other, body slightly raised
3. right foot forward, heel touching the ground, left arm swinging forward
4. legs passing each other, body slightly raised

Bottom row, left to right, facing the viewer:
5. standing relaxed with a warm smile
6. sitting on an invisible stool, hands resting forward as if on a table, smiling
7. sitting and eating, lifting a spoon to her mouth
8. sitting and chewing happily with eyes closed, spoon lowered

Style: bright, warm, glossy cartoon art like a casual mobile cooking game, clean dark outlines, soft cel shading, friendly happy expression, Nigerian character design.
```

### ci2: UI student
Attach: `assets/v4/ci2.webp`, then `assets/anim/src/c2.png` · Save as: `assets/anim/src/ci2.png`

```
The first attached image is the character: keep the same person (face, skin tone, hair, outfit and colours). The second attached image is the style and layout reference: copy its cartoon painting style, its line work and shading, and its 4 by 2 grid of poses.

Create a sprite sheet for a 2D mobile cooking game.

Character: a cheerful young Nigerian university student with a short haircut, wearing a navy blue t-shirt with yellow letters UI on the chest, blue jeans and white sneakers, with a grey backpack on one shoulder.

Layout: one 16:9 image divided into a 4 by 2 grid of 8 equal cells. No borders, no grid lines, no text, no numbers. The background is solid flat pure green (#00FF00) everywhere, with no floor, no shadows and no gradient.

Every cell shows the same character, full body from head to shoes, fully inside the cell with a small margin, drawn at the same size and scale in every cell, with the feet at the same height in every cell.

Top row, left to right, a walking cycle moving to the right, in a three-quarter side view facing right:
1. left foot forward, heel touching the ground, right arm swinging forward
2. legs passing each other, body slightly raised
3. right foot forward, heel touching the ground, left arm swinging forward
4. legs passing each other, body slightly raised

Bottom row, left to right, facing the viewer:
5. standing relaxed with a warm smile
6. sitting on an invisible stool, hands resting forward as if on a table, smiling
7. sitting and eating, lifting a spoon to his mouth
8. sitting and chewing happily with eyes closed, spoon lowered

Style: bright, warm, glossy cartoon art like a casual mobile cooking game, clean dark outlines, soft cel shading, friendly happy expression, Nigerian character design.
```

### ci3: Okada rider
Attach: `assets/v4/ci3.webp`, then `assets/anim/src/c2.png` · Save as: `assets/anim/src/ci3.png`

```
The first attached image is the character: keep the same person (face, skin tone, hair, outfit and colours). The second attached image is the style and layout reference: copy its cartoon painting style, its line work and shading, and its 4 by 2 grid of poses.

Create a sprite sheet for a 2D mobile cooking game.

Character: a friendly young Nigerian motorcycle-taxi rider wearing a red motorcycle helmet, a bright yellow high-visibility vest over a white short-sleeved shirt, dark trousers and black boots, carrying a spare blue helmet under one arm.

Layout: one 16:9 image divided into a 4 by 2 grid of 8 equal cells. No borders, no grid lines, no text, no numbers. The background is solid flat pure green (#00FF00) everywhere, with no floor, no shadows and no gradient.

Every cell shows the same character, full body from head to shoes, fully inside the cell with a small margin, drawn at the same size and scale in every cell, with the feet at the same height in every cell.

Top row, left to right, a walking cycle moving to the right, in a three-quarter side view facing right:
1. left foot forward, heel touching the ground, right arm swinging forward
2. legs passing each other, body slightly raised
3. right foot forward, heel touching the ground, left arm swinging forward
4. legs passing each other, body slightly raised

Bottom row, left to right, facing the viewer:
5. standing relaxed with a warm smile
6. sitting on an invisible stool, hands resting forward as if on a table, smiling
7. sitting and eating, lifting a spoon to his mouth
8. sitting and chewing happily with eyes closed, spoon lowered

Style: bright, warm, glossy cartoon art like a casual mobile cooking game, clean dark outlines, soft cel shading, friendly happy expression, Nigerian character design.
```

### ci4: Office lady
Attach: `assets/v4/ci4.webp`, then `assets/anim/src/c2.png` · Save as: `assets/anim/src/ci4.png`

```
The first attached image is the character: keep the same person (face, skin tone, hair, outfit and colours). The second attached image is the style and layout reference: copy its cartoon painting style, its line work and shading, and its 4 by 2 grid of poses.

Create a sprite sheet for a 2D mobile cooking game.

Character: a confident young Nigerian professional woman with long thin braids and small gold earrings, wearing a navy blue blazer over a white blouse, a matching navy knee-length pencil skirt and black low heels.

Layout: one 16:9 image divided into a 4 by 2 grid of 8 equal cells. No borders, no grid lines, no text, no numbers. The background is solid flat pure green (#00FF00) everywhere, with no floor, no shadows and no gradient.

Every cell shows the same character, full body from head to shoes, fully inside the cell with a small margin, drawn at the same size and scale in every cell, with the feet at the same height in every cell.

Top row, left to right, a walking cycle moving to the right, in a three-quarter side view facing right:
1. left foot forward, heel touching the ground, right arm swinging forward
2. legs passing each other, body slightly raised
3. right foot forward, heel touching the ground, left arm swinging forward
4. legs passing each other, body slightly raised

Bottom row, left to right, facing the viewer:
5. standing relaxed with a warm smile
6. sitting on an invisible stool, hands resting forward as if on a table, smiling
7. sitting and eating, lifting a spoon to her mouth
8. sitting and chewing happily with eyes closed, spoon lowered

Style: bright, warm, glossy cartoon art like a casual mobile cooking game, clean dark outlines, soft cel shading, friendly happy expression, Nigerian character design.
```

### ci5: Big Oga
Attach: `assets/v4/ci5.webp`, then `assets/anim/src/c2.png` · Save as: `assets/anim/src/ci5.png`

```
The first attached image is the character: keep the same person (face, skin tone, hair, outfit and colours). The second attached image is the style and layout reference: copy its cartoon painting style, its line work and shading, and its 4 by 2 grid of poses.

Create a sprite sheet for a 2D mobile cooking game.

Character: a big, jolly, heavy-set Nigerian man with a short beard, wearing a short-sleeved blue and white patterned kaftan with matching trousers and brown leather sandals.

Layout: one 16:9 image divided into a 4 by 2 grid of 8 equal cells. No borders, no grid lines, no text, no numbers. The background is solid flat pure green (#00FF00) everywhere, with no floor, no shadows and no gradient.

Every cell shows the same character, full body from head to shoes, fully inside the cell with a small margin, drawn at the same size and scale in every cell, with the feet at the same height in every cell.

Top row, left to right, a walking cycle moving to the right, in a three-quarter side view facing right:
1. left foot forward, heel touching the ground, right arm swinging forward
2. legs passing each other, body slightly raised
3. right foot forward, heel touching the ground, left arm swinging forward
4. legs passing each other, body slightly raised

Bottom row, left to right, facing the viewer:
5. standing relaxed with a warm smile
6. sitting on an invisible stool, hands resting forward as if on a table, smiling
7. sitting and eating, lifting a spoon to his mouth
8. sitting and chewing happily with eyes closed, spoon lowered

Style: bright, warm, glossy cartoon art like a casual mobile cooking game, clean dark outlines, soft cel shading, friendly happy expression, Nigerian character design.
```

---

## Port Harcourt (Rivers State): Waterside Bole Spot, Rumuola

These customers already have portraits in the game. The prompt keeps the person from the portrait but redraws them in the Lagos cartoon style.

### cp0: Oil worker
Attach: `assets/v4/cp0.webp`, then `assets/anim/src/c2.png` · Save as: `assets/anim/src/cp0.png`

```
The first attached image is the character: keep the same person (face, skin tone, hair, outfit and colours). The second attached image is the style and layout reference: copy its cartoon painting style, its line work and shading, and its 4 by 2 grid of poses.

Create a sprite sheet for a 2D mobile cooking game.

Character: a friendly Nigerian oil-field worker with a goatee, wearing a white hard hat, an orange work coverall with silver reflective stripes on the chest and arms, and brown steel-toe work boots.

Layout: one 16:9 image divided into a 4 by 2 grid of 8 equal cells. No borders, no grid lines, no text, no numbers. The background is solid flat pure green (#00FF00) everywhere, with no floor, no shadows and no gradient.

Every cell shows the same character, full body from head to shoes, fully inside the cell with a small margin, drawn at the same size and scale in every cell, with the feet at the same height in every cell.

Top row, left to right, a walking cycle moving to the right, in a three-quarter side view facing right:
1. left foot forward, heel touching the ground, right arm swinging forward
2. legs passing each other, body slightly raised
3. right foot forward, heel touching the ground, left arm swinging forward
4. legs passing each other, body slightly raised

Bottom row, left to right, facing the viewer:
5. standing relaxed with a warm smile
6. sitting on an invisible stool, hands resting forward as if on a table, smiling
7. sitting and eating, lifting a spoon to his mouth
8. sitting and chewing happily with eyes closed, spoon lowered

Style: bright, warm, glossy cartoon art like a casual mobile cooking game, clean dark outlines, soft cel shading, friendly happy expression, Nigerian character design.
```

### cp1: Waterside mama
Attach: `assets/v4/cp1.webp`, then `assets/anim/src/c2.png` · Save as: `assets/anim/src/cp1.png`

```
The first attached image is the character: keep the same person (face, skin tone, hair, outfit and colours). The second attached image is the style and layout reference: copy its cartoon painting style, its line work and shading, and its 4 by 2 grid of poses.

Create a sprite sheet for a 2D mobile cooking game.

Character: a plump, smiling Nigerian woman wearing a teal, yellow and red Ankara gele headwrap with a matching puff-sleeve blouse and ankle-length wrapper, a gold necklace, gold earrings and gold bangles on both wrists.

Layout: one 16:9 image divided into a 4 by 2 grid of 8 equal cells. No borders, no grid lines, no text, no numbers. The background is solid flat pure green (#00FF00) everywhere, with no floor, no shadows and no gradient.

Every cell shows the same character, full body from head to shoes, fully inside the cell with a small margin, drawn at the same size and scale in every cell, with the feet at the same height in every cell.

Top row, left to right, a walking cycle moving to the right, in a three-quarter side view facing right:
1. left foot forward, heel touching the ground, right arm swinging forward
2. legs passing each other, body slightly raised
3. right foot forward, heel touching the ground, left arm swinging forward
4. legs passing each other, body slightly raised

Bottom row, left to right, facing the viewer:
5. standing relaxed with a warm smile
6. sitting on an invisible stool, hands resting forward as if on a table, smiling
7. sitting and eating, lifting a spoon to her mouth
8. sitting and chewing happily with eyes closed, spoon lowered

Style: bright, warm, glossy cartoon art like a casual mobile cooking game, clean dark outlines, soft cel shading, friendly happy expression, Nigerian character design.
```

### cp2: Fisherman
Attach: `assets/v4/cp2.webp`, then `assets/anim/src/c2.png` · Save as: `assets/anim/src/cp2.png`

```
The first attached image is the character: keep the same person (face, skin tone, hair, outfit and colours). The second attached image is the style and layout reference: copy its cartoon painting style, its line work and shading, and its 4 by 2 grid of poses.

Create a sprite sheet for a 2D mobile cooking game.

Character: a relaxed Nigerian fisherman with a short beard, wearing a woven straw hat, a cream sleeveless singlet, green knee-length shorts and rubber slippers.

Layout: one 16:9 image divided into a 4 by 2 grid of 8 equal cells. No borders, no grid lines, no text, no numbers. The background is solid flat pure green (#00FF00) everywhere, with no floor, no shadows and no gradient.

Every cell shows the same character, full body from head to shoes, fully inside the cell with a small margin, drawn at the same size and scale in every cell, with the feet at the same height in every cell.

Top row, left to right, a walking cycle moving to the right, in a three-quarter side view facing right:
1. left foot forward, heel touching the ground, right arm swinging forward
2. legs passing each other, body slightly raised
3. right foot forward, heel touching the ground, left arm swinging forward
4. legs passing each other, body slightly raised

Bottom row, left to right, facing the viewer:
5. standing relaxed with a warm smile
6. sitting on an invisible stool, hands resting forward as if on a table, smiling
7. sitting and eating, lifting a spoon to his mouth
8. sitting and chewing happily with eyes closed, spoon lowered

Style: bright, warm, glossy cartoon art like a casual mobile cooking game, clean dark outlines, soft cel shading, friendly happy expression, Nigerian character design.
```

### cp3: Ijaw chief
Attach: `assets/v4/cp3.webp`, then `assets/anim/src/c2.png` · Save as: `assets/anim/src/cp3.png`

```
The first attached image is the character: keep the same person (face, skin tone, hair, outfit and colours). The second attached image is the style and layout reference: copy its cartoon painting style, its line work and shading, and its 4 by 2 grid of poses.

Create a sprite sheet for a 2D mobile cooking game.

Character: a dignified elderly Ijaw chief with a short white beard, wearing a black bowler hat, a long white etibo shirt with gold buttons, a heavy gold chain, a red patterned George wrapper tied at the waist down to his ankles, and black shoes, holding a wooden walking stick with a gold top.

Layout: one 16:9 image divided into a 4 by 2 grid of 8 equal cells. No borders, no grid lines, no text, no numbers. The background is solid flat pure green (#00FF00) everywhere, with no floor, no shadows and no gradient.

Every cell shows the same character, full body from head to shoes, fully inside the cell with a small margin, drawn at the same size and scale in every cell, with the feet at the same height in every cell.

Top row, left to right, a walking cycle moving to the right, in a three-quarter side view facing right:
1. left foot forward, heel touching the ground, right arm swinging forward
2. legs passing each other, body slightly raised
3. right foot forward, heel touching the ground, left arm swinging forward
4. legs passing each other, body slightly raised

Bottom row, left to right, facing the viewer:
5. standing relaxed with a warm smile
6. sitting on an invisible stool, hands resting forward as if on a table, smiling
7. sitting and eating, lifting a spoon to his mouth
8. sitting and chewing happily with eyes closed, spoon lowered

Style: bright, warm, glossy cartoon art like a casual mobile cooking game, clean dark outlines, soft cel shading, friendly happy expression, Nigerian character design.
```

### cp4: Purple slay queen
Attach: `assets/v4/cp4.webp`, then `assets/anim/src/c2.png` · Save as: `assets/anim/src/cp4.png`

```
The first attached image is the character: keep the same person (face, skin tone, hair, outfit and colours). The second attached image is the style and layout reference: copy its cartoon painting style, its line work and shading, and its 4 by 2 grid of poses.

Create a sprite sheet for a 2D mobile cooking game.

Character: a stylish young Nigerian woman with long braids, wearing a purple sleeveless jumpsuit with a matching belt, big gold hoop earrings, gold bangles and purple heels.

Layout: one 16:9 image divided into a 4 by 2 grid of 8 equal cells. No borders, no grid lines, no text, no numbers. The background is solid flat pure green (#00FF00) everywhere, with no floor, no shadows and no gradient.

Every cell shows the same character, full body from head to shoes, fully inside the cell with a small margin, drawn at the same size and scale in every cell, with the feet at the same height in every cell.

Top row, left to right, a walking cycle moving to the right, in a three-quarter side view facing right:
1. left foot forward, heel touching the ground, right arm swinging forward
2. legs passing each other, body slightly raised
3. right foot forward, heel touching the ground, left arm swinging forward
4. legs passing each other, body slightly raised

Bottom row, left to right, facing the viewer:
5. standing relaxed with a warm smile
6. sitting on an invisible stool, hands resting forward as if on a table, smiling
7. sitting and eating, lifting a spoon to her mouth
8. sitting and chewing happily with eyes closed, spoon lowered

Style: bright, warm, glossy cartoon art like a casual mobile cooking game, clean dark outlines, soft cel shading, friendly happy expression, Nigerian character design.
```

### cp5: Headphones guy
Attach: `assets/v4/cp5.webp`, then `assets/anim/src/c2.png` · Save as: `assets/anim/src/cp5.png`

```
The first attached image is the character: keep the same person (face, skin tone, hair, outfit and colours). The second attached image is the style and layout reference: copy its cartoon painting style, its line work and shading, and its 4 by 2 grid of poses.

Create a sprite sheet for a 2D mobile cooking game.

Character: a laid-back young Nigerian man with a short beard, wearing black over-ear headphones, a green football jersey with white trim, dark grey jogger trousers and white sneakers.

Layout: one 16:9 image divided into a 4 by 2 grid of 8 equal cells. No borders, no grid lines, no text, no numbers. The background is solid flat pure green (#00FF00) everywhere, with no floor, no shadows and no gradient.

Every cell shows the same character, full body from head to shoes, fully inside the cell with a small margin, drawn at the same size and scale in every cell, with the feet at the same height in every cell.

Top row, left to right, a walking cycle moving to the right, in a three-quarter side view facing right:
1. left foot forward, heel touching the ground, right arm swinging forward
2. legs passing each other, body slightly raised
3. right foot forward, heel touching the ground, left arm swinging forward
4. legs passing each other, body slightly raised

Bottom row, left to right, facing the viewer:
5. standing relaxed with a warm smile
6. sitting on an invisible stool, hands resting forward as if on a table, smiling
7. sitting and eating, lifting a spoon to his mouth
8. sitting and chewing happily with eyes closed, spoon lowered

Style: bright, warm, glossy cartoon art like a casual mobile cooking game, clean dark outlines, soft cel shading, friendly happy expression, Nigerian character design.
```

---

## Enugu (Enugu State): Coal City Kitchen

Enugu is not playable yet. These sheets will be ready when the city is built.

### ce0: Igbo chief
Attach: `assets/anim/src/c2.png` (style only) · Save as: `assets/anim/src/ce0.png`

```
Use the attached image only as a style and layout reference: copy its cartoon painting style, its line work and shading, and its 4 by 2 grid of poses. Draw a NEW character, not the person in the reference.

Create a sprite sheet for a 2D mobile cooking game.

Character: a proud elderly Igbo chief with a grey moustache, wearing a red okpu-agu cap with a single white feather, a black and gold isiagu shirt with a lion-head pattern, black trousers, a string of red coral beads round his neck and black shoes, holding a short carved walking stick.

Layout: one 16:9 image divided into a 4 by 2 grid of 8 equal cells. No borders, no grid lines, no text, no numbers. The background is solid flat pure green (#00FF00) everywhere, with no floor, no shadows and no gradient.

Every cell shows the same character, full body from head to shoes, fully inside the cell with a small margin, drawn at the same size and scale in every cell, with the feet at the same height in every cell.

Top row, left to right, a walking cycle moving to the right, in a three-quarter side view facing right:
1. left foot forward, heel touching the ground, right arm swinging forward
2. legs passing each other, body slightly raised
3. right foot forward, heel touching the ground, left arm swinging forward
4. legs passing each other, body slightly raised

Bottom row, left to right, facing the viewer:
5. standing relaxed with a warm smile
6. sitting on an invisible stool, hands resting forward as if on a table, smiling
7. sitting and eating, lifting a spoon to his mouth
8. sitting and chewing happily with eyes closed, spoon lowered

Style: bright, warm, glossy cartoon art like a casual mobile cooking game, clean dark outlines, soft cel shading, friendly happy expression, Nigerian character design.
```

### ce1: Market woman
Attach: `assets/anim/src/c2.png` (style only) · Save as: `assets/anim/src/ce1.png`

```
Use the attached image only as a style and layout reference: copy its cartoon painting style, its line work and shading, and its 4 by 2 grid of poses. Draw a NEW character, not the person in the reference.

Create a sprite sheet for a 2D mobile cooking game.

Character: a lively Igbo market woman wearing a large red and gold head tie, a white lace puff-sleeve blouse, a red and gold George wrapper to her ankles, red coral beads and simple sandals.

Layout: one 16:9 image divided into a 4 by 2 grid of 8 equal cells. No borders, no grid lines, no text, no numbers. The background is solid flat pure green (#00FF00) everywhere, with no floor, no shadows and no gradient.

Every cell shows the same character, full body from head to shoes, fully inside the cell with a small margin, drawn at the same size and scale in every cell, with the feet at the same height in every cell.

Top row, left to right, a walking cycle moving to the right, in a three-quarter side view facing right:
1. left foot forward, heel touching the ground, right arm swinging forward
2. legs passing each other, body slightly raised
3. right foot forward, heel touching the ground, left arm swinging forward
4. legs passing each other, body slightly raised

Bottom row, left to right, facing the viewer:
5. standing relaxed with a warm smile
6. sitting on an invisible stool, hands resting forward as if on a table, smiling
7. sitting and eating, lifting a spoon to her mouth
8. sitting and chewing happily with eyes closed, spoon lowered

Style: bright, warm, glossy cartoon art like a casual mobile cooking game, clean dark outlines, soft cel shading, friendly happy expression, Nigerian character design.
```

### ce2: Campus girl
Attach: `assets/anim/src/c2.png` (style only) · Save as: `assets/anim/src/ce2.png`

```
Use the attached image only as a style and layout reference: copy its cartoon painting style, its line work and shading, and its 4 by 2 grid of poses. Draw a NEW character, not the person in the reference.

Create a sprite sheet for a 2D mobile cooking game.

Character: a cheerful young Nigerian university student with an afro puff, wearing a green and white striped t-shirt, high-waisted blue jeans and white sneakers, with a small yellow backpack.

Layout: one 16:9 image divided into a 4 by 2 grid of 8 equal cells. No borders, no grid lines, no text, no numbers. The background is solid flat pure green (#00FF00) everywhere, with no floor, no shadows and no gradient.

Every cell shows the same character, full body from head to shoes, fully inside the cell with a small margin, drawn at the same size and scale in every cell, with the feet at the same height in every cell.

Top row, left to right, a walking cycle moving to the right, in a three-quarter side view facing right:
1. left foot forward, heel touching the ground, right arm swinging forward
2. legs passing each other, body slightly raised
3. right foot forward, heel touching the ground, left arm swinging forward
4. legs passing each other, body slightly raised

Bottom row, left to right, facing the viewer:
5. standing relaxed with a warm smile
6. sitting on an invisible stool, hands resting forward as if on a table, smiling
7. sitting and eating, lifting a spoon to her mouth
8. sitting and chewing happily with eyes closed, spoon lowered

Style: bright, warm, glossy cartoon art like a casual mobile cooking game, clean dark outlines, soft cel shading, friendly happy expression, Nigerian character design.
```

### ce3: Spare-parts trader
Attach: `assets/anim/src/c2.png` (style only) · Save as: `assets/anim/src/ce3.png`

```
Use the attached image only as a style and layout reference: copy its cartoon painting style, its line work and shading, and its 4 by 2 grid of poses. Draw a NEW character, not the person in the reference.

Create a sprite sheet for a 2D mobile cooking game.

Character: a busy Igbo spare-parts trader with a neat moustache, wearing a brown native-style long-sleeved shirt with matching trousers, a black fez cap and black loafers, holding a mobile phone.

Layout: one 16:9 image divided into a 4 by 2 grid of 8 equal cells. No borders, no grid lines, no text, no numbers. The background is solid flat pure green (#00FF00) everywhere, with no floor, no shadows and no gradient.

Every cell shows the same character, full body from head to shoes, fully inside the cell with a small margin, drawn at the same size and scale in every cell, with the feet at the same height in every cell.

Top row, left to right, a walking cycle moving to the right, in a three-quarter side view facing right:
1. left foot forward, heel touching the ground, right arm swinging forward
2. legs passing each other, body slightly raised
3. right foot forward, heel touching the ground, left arm swinging forward
4. legs passing each other, body slightly raised

Bottom row, left to right, facing the viewer:
5. standing relaxed with a warm smile
6. sitting on an invisible stool, hands resting forward as if on a table, smiling
7. sitting and eating, lifting a spoon to his mouth
8. sitting and chewing happily with eyes closed, spoon lowered

Style: bright, warm, glossy cartoon art like a casual mobile cooking game, clean dark outlines, soft cel shading, friendly happy expression, Nigerian character design.
```

### ce4: Nne grandma
Attach: `assets/anim/src/c2.png` (style only) · Save as: `assets/anim/src/ce4.png`

```
Use the attached image only as a style and layout reference: copy its cartoon painting style, its line work and shading, and its 4 by 2 grid of poses. Draw a NEW character, not the person in the reference.

Create a sprite sheet for a 2D mobile cooking game.

Character: a sweet, slightly stooped Igbo grandmother with grey hair under a simple blue headscarf, wearing a loose white blouse, a blue and white wrapper to her ankles and slippers.

Layout: one 16:9 image divided into a 4 by 2 grid of 8 equal cells. No borders, no grid lines, no text, no numbers. The background is solid flat pure green (#00FF00) everywhere, with no floor, no shadows and no gradient.

Every cell shows the same character, full body from head to shoes, fully inside the cell with a small margin, drawn at the same size and scale in every cell, with the feet at the same height in every cell.

Top row, left to right, a walking cycle moving to the right, in a three-quarter side view facing right:
1. left foot forward, heel touching the ground, right arm swinging forward
2. legs passing each other, body slightly raised
3. right foot forward, heel touching the ground, left arm swinging forward
4. legs passing each other, body slightly raised

Bottom row, left to right, facing the viewer:
5. standing relaxed with a warm smile
6. sitting on an invisible stool, hands resting forward as if on a table, smiling
7. sitting and eating, lifting a spoon to his mouth
8. sitting and chewing happily with eyes closed, spoon lowered

Style: bright, warm, glossy cartoon art like a casual mobile cooking game, clean dark outlines, soft cel shading, friendly happy expression, Nigerian character design.
```

### ce5: Ankara girl
Attach: `assets/anim/src/c2.png` (style only) · Save as: `assets/anim/src/ce5.png`

```
Use the attached image only as a style and layout reference: copy its cartoon painting style, its line work and shading, and its 4 by 2 grid of poses. Draw a NEW character, not the person in the reference.

Create a sprite sheet for a 2D mobile cooking game.

Character: a fashionable young Igbo woman with short natural hair, wearing a knee-length orange, green and blue Ankara dress, big wooden earrings and tan sandals.

Layout: one 16:9 image divided into a 4 by 2 grid of 8 equal cells. No borders, no grid lines, no text, no numbers. The background is solid flat pure green (#00FF00) everywhere, with no floor, no shadows and no gradient.

Every cell shows the same character, full body from head to shoes, fully inside the cell with a small margin, drawn at the same size and scale in every cell, with the feet at the same height in every cell.

Top row, left to right, a walking cycle moving to the right, in a three-quarter side view facing right:
1. left foot forward, heel touching the ground, right arm swinging forward
2. legs passing each other, body slightly raised
3. right foot forward, heel touching the ground, left arm swinging forward
4. legs passing each other, body slightly raised

Bottom row, left to right, facing the viewer:
5. standing relaxed with a warm smile
6. sitting on an invisible stool, hands resting forward as if on a table, smiling
7. sitting and eating, lifting a spoon to her mouth
8. sitting and chewing happily with eyes closed, spoon lowered

Style: bright, warm, glossy cartoon art like a casual mobile cooking game, clean dark outlines, soft cel shading, friendly happy expression, Nigerian character design.
```

---

## Kano (Kano State): Sabon Gari Suya Spot

Kano is not playable yet. These sheets will be ready when the city is built.

### ck0: Alhaji
Attach: `assets/anim/src/c2.png` (style only) · Save as: `assets/anim/src/ck0.png`

```
Use the attached image only as a style and layout reference: copy its cartoon painting style, its line work and shading, and its 4 by 2 grid of poses. Draw a NEW character, not the person in the reference.

Create a sprite sheet for a 2D mobile cooking game.

Character: a dignified elderly Hausa man with a white beard, wearing a large flowing white babban riga robe with green embroidery on the chest, matching trousers, a red and white embroidered fula cap and leather slippers, holding a string of prayer beads.

Layout: one 16:9 image divided into a 4 by 2 grid of 8 equal cells. No borders, no grid lines, no text, no numbers. The background is solid flat pure green (#00FF00) everywhere, with no floor, no shadows and no gradient.

Every cell shows the same character, full body from head to shoes, fully inside the cell with a small margin, drawn at the same size and scale in every cell, with the feet at the same height in every cell.

Top row, left to right, a walking cycle moving to the right, in a three-quarter side view facing right:
1. left foot forward, heel touching the ground, right arm swinging forward
2. legs passing each other, body slightly raised
3. right foot forward, heel touching the ground, left arm swinging forward
4. legs passing each other, body slightly raised

Bottom row, left to right, facing the viewer:
5. standing relaxed with a warm smile
6. sitting on an invisible stool, hands resting forward as if on a table, smiling
7. sitting and eating, lifting a spoon to his mouth
8. sitting and chewing happily with eyes closed, spoon lowered

Style: bright, warm, glossy cartoon art like a casual mobile cooking game, clean dark outlines, soft cel shading, friendly happy expression, Nigerian character design.
```

### ck1: Hausa mama
Attach: `assets/anim/src/c2.png` (style only) · Save as: `assets/anim/src/ck1.png`

```
Use the attached image only as a style and layout reference: copy its cartoon painting style, its line work and shading, and its 4 by 2 grid of poses. Draw a NEW character, not the person in the reference.

Create a sprite sheet for a 2D mobile cooking game.

Character: a graceful Hausa woman wearing a bright yellow and purple atampa wrapper and matching blouse, with a long matching mayafi veil draped over her head and shoulders, henna patterns on her hands and gold earrings.

Layout: one 16:9 image divided into a 4 by 2 grid of 8 equal cells. No borders, no grid lines, no text, no numbers. The background is solid flat pure green (#00FF00) everywhere, with no floor, no shadows and no gradient.

Every cell shows the same character, full body from head to shoes, fully inside the cell with a small margin, drawn at the same size and scale in every cell, with the feet at the same height in every cell.

Top row, left to right, a walking cycle moving to the right, in a three-quarter side view facing right:
1. left foot forward, heel touching the ground, right arm swinging forward
2. legs passing each other, body slightly raised
3. right foot forward, heel touching the ground, left arm swinging forward
4. legs passing each other, body slightly raised

Bottom row, left to right, facing the viewer:
5. standing relaxed with a warm smile
6. sitting on an invisible stool, hands resting forward as if on a table, smiling
7. sitting and eating, lifting a spoon to her mouth
8. sitting and chewing happily with eyes closed, spoon lowered

Style: bright, warm, glossy cartoon art like a casual mobile cooking game, clean dark outlines, soft cel shading, friendly happy expression, Nigerian character design.
```

### ck2: Kaftan guy
Attach: `assets/anim/src/c2.png` (style only) · Save as: `assets/anim/src/ck2.png`

```
Use the attached image only as a style and layout reference: copy its cartoon painting style, its line work and shading, and its 4 by 2 grid of poses. Draw a NEW character, not the person in the reference.

Create a sprite sheet for a 2D mobile cooking game.

Character: a cheerful young Hausa man with a thin moustache, wearing a sky-blue jalabia kaftan to his shins, an embroidered white hula cap, and white sneakers.

Layout: one 16:9 image divided into a 4 by 2 grid of 8 equal cells. No borders, no grid lines, no text, no numbers. The background is solid flat pure green (#00FF00) everywhere, with no floor, no shadows and no gradient.

Every cell shows the same character, full body from head to shoes, fully inside the cell with a small margin, drawn at the same size and scale in every cell, with the feet at the same height in every cell.

Top row, left to right, a walking cycle moving to the right, in a three-quarter side view facing right:
1. left foot forward, heel touching the ground, right arm swinging forward
2. legs passing each other, body slightly raised
3. right foot forward, heel touching the ground, left arm swinging forward
4. legs passing each other, body slightly raised

Bottom row, left to right, facing the viewer:
5. standing relaxed with a warm smile
6. sitting on an invisible stool, hands resting forward as if on a table, smiling
7. sitting and eating, lifting a spoon to his mouth
8. sitting and chewing happily with eyes closed, spoon lowered

Style: bright, warm, glossy cartoon art like a casual mobile cooking game, clean dark outlines, soft cel shading, friendly happy expression, Nigerian character design.
```

### ck3: Fulani herder
Attach: `assets/anim/src/c2.png` (style only) · Save as: `assets/anim/src/ck3.png`

```
Use the attached image only as a style and layout reference: copy its cartoon painting style, its line work and shading, and its 4 by 2 grid of poses. Draw a NEW character, not the person in the reference.

Create a sprite sheet for a 2D mobile cooking game.

Character: a smiling young Fulani herder wearing a pointed woven straw malafa hat, a long cream robe with a red and blue blanket over one shoulder, and leather sandals, holding a long wooden herding stick.

Layout: one 16:9 image divided into a 4 by 2 grid of 8 equal cells. No borders, no grid lines, no text, no numbers. The background is solid flat pure green (#00FF00) everywhere, with no floor, no shadows and no gradient.

Every cell shows the same character, full body from head to shoes, fully inside the cell with a small margin, drawn at the same size and scale in every cell, with the feet at the same height in every cell.

Top row, left to right, a walking cycle moving to the right, in a three-quarter side view facing right:
1. left foot forward, heel touching the ground, right arm swinging forward
2. legs passing each other, body slightly raised
3. right foot forward, heel touching the ground, left arm swinging forward
4. legs passing each other, body slightly raised

Bottom row, left to right, facing the viewer:
5. standing relaxed with a warm smile
6. sitting on an invisible stool, hands resting forward as if on a table, smiling
7. sitting and eating, lifting a spoon to his mouth
8. sitting and chewing happily with eyes closed, spoon lowered

Style: bright, warm, glossy cartoon art like a casual mobile cooking game, clean dark outlines, soft cel shading, friendly happy expression, Nigerian character design.
```

### ck4: Abaya lady
Attach: `assets/anim/src/c2.png` (style only) · Save as: `assets/anim/src/ck4.png`

```
Use the attached image only as a style and layout reference: copy its cartoon painting style, its line work and shading, and its 4 by 2 grid of poses. Draw a NEW character, not the person in the reference.

Create a sprite sheet for a 2D mobile cooking game.

Character: a stylish young Hausa woman wearing a long emerald-green abaya, a patterned gold and green scarf wrapped around her head, gold earrings and gold sandals.

Layout: one 16:9 image divided into a 4 by 2 grid of 8 equal cells. No borders, no grid lines, no text, no numbers. The background is solid flat pure green (#00FF00) everywhere, with no floor, no shadows and no gradient.

Every cell shows the same character, full body from head to shoes, fully inside the cell with a small margin, drawn at the same size and scale in every cell, with the feet at the same height in every cell.

Top row, left to right, a walking cycle moving to the right, in a three-quarter side view facing right:
1. left foot forward, heel touching the ground, right arm swinging forward
2. legs passing each other, body slightly raised
3. right foot forward, heel touching the ground, left arm swinging forward
4. legs passing each other, body slightly raised

Bottom row, left to right, facing the viewer:
5. standing relaxed with a warm smile
6. sitting on an invisible stool, hands resting forward as if on a table, smiling
7. sitting and eating, lifting a spoon to her mouth
8. sitting and chewing happily with eyes closed, spoon lowered

Style: bright, warm, glossy cartoon art like a casual mobile cooking game, clean dark outlines, soft cel shading, friendly happy expression, Nigerian character design.
```

### ck5: Arewa student
Attach: `assets/anim/src/c2.png` (style only) · Save as: `assets/anim/src/ck5.png`

```
Use the attached image only as a style and layout reference: copy its cartoon painting style, its line work and shading, and its 4 by 2 grid of poses. Draw a NEW character, not the person in the reference.

Create a sprite sheet for a 2D mobile cooking game.

Character: a friendly young Hausa student wearing a white kaftan with matching trousers, a white embroidered hula cap and black sneakers, with a brown satchel bag across his body.

Layout: one 16:9 image divided into a 4 by 2 grid of 8 equal cells. No borders, no grid lines, no text, no numbers. The background is solid flat pure green (#00FF00) everywhere, with no floor, no shadows and no gradient.

Every cell shows the same character, full body from head to shoes, fully inside the cell with a small margin, drawn at the same size and scale in every cell, with the feet at the same height in every cell.

Top row, left to right, a walking cycle moving to the right, in a three-quarter side view facing right:
1. left foot forward, heel touching the ground, right arm swinging forward
2. legs passing each other, body slightly raised
3. right foot forward, heel touching the ground, left arm swinging forward
4. legs passing each other, body slightly raised

Bottom row, left to right, facing the viewer:
5. standing relaxed with a warm smile
6. sitting on an invisible stool, hands resting forward as if on a table, smiling
7. sitting and eating, lifting a spoon to his mouth
8. sitting and chewing happily with eyes closed, spoon lowered

Style: bright, warm, glossy cartoon art like a casual mobile cooking game, clean dark outlines, soft cel shading, friendly happy expression, Nigerian character design.
```

---

## Abuja (FCT): Aso Rock Grand Buka

Abuja is not playable yet. These sheets will be ready when the city is built.

### ca0: Senator
Attach: `assets/anim/src/c2.png` (style only) · Save as: `assets/anim/src/ca0.png`

```
Use the attached image only as a style and layout reference: copy its cartoon painting style, its line work and shading, and its 4 by 2 grid of poses. Draw a NEW character, not the person in the reference.

Create a sprite sheet for a 2D mobile cooking game.

Character: an important-looking Nigerian politician with a grey moustache, wearing a grand cream agbada with heavy gold embroidery over matching trousers, a matching cream and gold fila cap and shiny brown shoes.

Layout: one 16:9 image divided into a 4 by 2 grid of 8 equal cells. No borders, no grid lines, no text, no numbers. The background is solid flat pure green (#00FF00) everywhere, with no floor, no shadows and no gradient.

Every cell shows the same character, full body from head to shoes, fully inside the cell with a small margin, drawn at the same size and scale in every cell, with the feet at the same height in every cell.

Top row, left to right, a walking cycle moving to the right, in a three-quarter side view facing right:
1. left foot forward, heel touching the ground, right arm swinging forward
2. legs passing each other, body slightly raised
3. right foot forward, heel touching the ground, left arm swinging forward
4. legs passing each other, body slightly raised

Bottom row, left to right, facing the viewer:
5. standing relaxed with a warm smile
6. sitting on an invisible stool, hands resting forward as if on a table, smiling
7. sitting and eating, lifting a spoon to his mouth
8. sitting and chewing happily with eyes closed, spoon lowered

Style: bright, warm, glossy cartoon art like a casual mobile cooking game, clean dark outlines, soft cel shading, friendly happy expression, Nigerian character design.
```

### ca1: Big madam
Attach: `assets/anim/src/c2.png` (style only) · Save as: `assets/anim/src/ca1.png`

```
Use the attached image only as a style and layout reference: copy its cartoon painting style, its line work and shading, and its 4 by 2 grid of poses. Draw a NEW character, not the person in the reference.

Create a sprite sheet for a 2D mobile cooking game.

Character: a glamorous Nigerian woman wearing a tall emerald-green aso-oke gele, a matching emerald lace blouse and wrapper, a gold necklace, gold earrings, and gold heels, holding a small gold clutch bag.

Layout: one 16:9 image divided into a 4 by 2 grid of 8 equal cells. No borders, no grid lines, no text, no numbers. The background is solid flat pure green (#00FF00) everywhere, with no floor, no shadows and no gradient.

Every cell shows the same character, full body from head to shoes, fully inside the cell with a small margin, drawn at the same size and scale in every cell, with the feet at the same height in every cell.

Top row, left to right, a walking cycle moving to the right, in a three-quarter side view facing right:
1. left foot forward, heel touching the ground, right arm swinging forward
2. legs passing each other, body slightly raised
3. right foot forward, heel touching the ground, left arm swinging forward
4. legs passing each other, body slightly raised

Bottom row, left to right, facing the viewer:
5. standing relaxed with a warm smile
6. sitting on an invisible stool, hands resting forward as if on a table, smiling
7. sitting and eating, lifting a spoon to her mouth
8. sitting and chewing happily with eyes closed, spoon lowered

Style: bright, warm, glossy cartoon art like a casual mobile cooking game, clean dark outlines, soft cel shading, friendly happy expression, Nigerian character design.
```

### ca2: Tech bro
Attach: `assets/anim/src/c2.png` (style only) · Save as: `assets/anim/src/ca2.png`

```
Use the attached image only as a style and layout reference: copy its cartoon painting style, its line work and shading, and its 4 by 2 grid of poses. Draw a NEW character, not the person in the reference.

Create a sprite sheet for a 2D mobile cooking game.

Character: a relaxed young Nigerian tech worker with short twists and round glasses, wearing a grey hoodie, black jeans and white sneakers, holding a closed laptop under one arm.

Layout: one 16:9 image divided into a 4 by 2 grid of 8 equal cells. No borders, no grid lines, no text, no numbers. The background is solid flat pure green (#00FF00) everywhere, with no floor, no shadows and no gradient.

Every cell shows the same character, full body from head to shoes, fully inside the cell with a small margin, drawn at the same size and scale in every cell, with the feet at the same height in every cell.

Top row, left to right, a walking cycle moving to the right, in a three-quarter side view facing right:
1. left foot forward, heel touching the ground, right arm swinging forward
2. legs passing each other, body slightly raised
3. right foot forward, heel touching the ground, left arm swinging forward
4. legs passing each other, body slightly raised

Bottom row, left to right, facing the viewer:
5. standing relaxed with a warm smile
6. sitting on an invisible stool, hands resting forward as if on a table, smiling
7. sitting and eating, lifting a spoon to his mouth
8. sitting and chewing happily with eyes closed, spoon lowered

Style: bright, warm, glossy cartoon art like a casual mobile cooking game, clean dark outlines, soft cel shading, friendly happy expression, Nigerian character design.
```

### ca3: Corps member
Attach: `assets/anim/src/c2.png` (style only) · Save as: `assets/anim/src/ca3.png`

```
Use the attached image only as a style and layout reference: copy its cartoon painting style, its line work and shading, and its 4 by 2 grid of poses. Draw a NEW character, not the person in the reference.

Create a sprite sheet for a 2D mobile cooking game.

Character: a cheerful young Nigerian NYSC corps member wearing a khaki jacket, a white t-shirt, khaki trousers, a khaki peaked cap and white canvas shoes, with no logos.

Layout: one 16:9 image divided into a 4 by 2 grid of 8 equal cells. No borders, no grid lines, no text, no numbers. The background is solid flat pure green (#00FF00) everywhere, with no floor, no shadows and no gradient.

Every cell shows the same character, full body from head to shoes, fully inside the cell with a small margin, drawn at the same size and scale in every cell, with the feet at the same height in every cell.

Top row, left to right, a walking cycle moving to the right, in a three-quarter side view facing right:
1. left foot forward, heel touching the ground, right arm swinging forward
2. legs passing each other, body slightly raised
3. right foot forward, heel touching the ground, left arm swinging forward
4. legs passing each other, body slightly raised

Bottom row, left to right, facing the viewer:
5. standing relaxed with a warm smile
6. sitting on an invisible stool, hands resting forward as if on a table, smiling
7. sitting and eating, lifting a spoon to his mouth
8. sitting and chewing happily with eyes closed, spoon lowered

Style: bright, warm, glossy cartoon art like a casual mobile cooking game, clean dark outlines, soft cel shading, friendly happy expression, Nigerian character design.
```

### ca4: Business lady
Attach: `assets/anim/src/c2.png` (style only) · Save as: `assets/anim/src/ca4.png`

```
Use the attached image only as a style and layout reference: copy its cartoon painting style, its line work and shading, and its 4 by 2 grid of poses. Draw a NEW character, not the person in the reference.

Create a sprite sheet for a 2D mobile cooking game.

Character: a confident Nigerian businesswoman with a short natural haircut, wearing a tailored red trouser suit, a white blouse, pearl earrings and black heels, carrying a black work bag.

Layout: one 16:9 image divided into a 4 by 2 grid of 8 equal cells. No borders, no grid lines, no text, no numbers. The background is solid flat pure green (#00FF00) everywhere, with no floor, no shadows and no gradient.

Every cell shows the same character, full body from head to shoes, fully inside the cell with a small margin, drawn at the same size and scale in every cell, with the feet at the same height in every cell.

Top row, left to right, a walking cycle moving to the right, in a three-quarter side view facing right:
1. left foot forward, heel touching the ground, right arm swinging forward
2. legs passing each other, body slightly raised
3. right foot forward, heel touching the ground, left arm swinging forward
4. legs passing each other, body slightly raised

Bottom row, left to right, facing the viewer:
5. standing relaxed with a warm smile
6. sitting on an invisible stool, hands resting forward as if on a table, smiling
7. sitting and eating, lifting a spoon to her mouth
8. sitting and chewing happily with eyes closed, spoon lowered

Style: bright, warm, glossy cartoon art like a casual mobile cooking game, clean dark outlines, soft cel shading, friendly happy expression, Nigerian character design.
```

### ca5: Professor
Attach: `assets/anim/src/c2.png` (style only) · Save as: `assets/anim/src/ca5.png`

```
Use the attached image only as a style and layout reference: copy its cartoon painting style, its line work and shading, and its 4 by 2 grid of poses. Draw a NEW character, not the person in the reference.

Create a sprite sheet for a 2D mobile cooking game.

Character: a kind elderly Nigerian professor with grey hair and a grey beard, wearing round glasses, a brown tweed jacket over a cream shirt, a dark green bow tie, brown trousers and brown shoes, holding a book.

Layout: one 16:9 image divided into a 4 by 2 grid of 8 equal cells. No borders, no grid lines, no text, no numbers. The background is solid flat pure green (#00FF00) everywhere, with no floor, no shadows and no gradient.

Every cell shows the same character, full body from head to shoes, fully inside the cell with a small margin, drawn at the same size and scale in every cell, with the feet at the same height in every cell.

Top row, left to right, a walking cycle moving to the right, in a three-quarter side view facing right:
1. left foot forward, heel touching the ground, right arm swinging forward
2. legs passing each other, body slightly raised
3. right foot forward, heel touching the ground, left arm swinging forward
4. legs passing each other, body slightly raised

Bottom row, left to right, facing the viewer:
5. standing relaxed with a warm smile
6. sitting on an invisible stool, hands resting forward as if on a table, smiling
7. sitting and eating, lifting a spoon to his mouth
8. sitting and chewing happily with eyes closed, spoon lowered

Style: bright, warm, glossy cartoon art like a casual mobile cooking game, clean dark outlines, soft cel shading, friendly happy expression, Nigerian character design.
```

