# Character sprite sheet prompts

One image per character. Each one is a sprite sheet the game slices into animation frames.

## How to generate

1. Open Gemini (or Antigravity) image generation.
2. **Attach the reference image** listed for the character. This is what keeps the face and outfit matching the art already in the game.
3. Paste the prompt for that character exactly as written.
4. Check the result against the checklist below. Regenerate if it fails. It often takes 2–3 tries.
5. Save it as PNG (JPG also works) to `assets/anim/src/<name>`, for example `assets/anim/src/c0.png`.
6. Run `node scripts/slice-characters.mjs`. It cuts the sheet into frames and wires them into the game. A character with no sheet keeps its current portrait.

### Checklist before saving

- 8 figures in a 4 × 2 grid (4 on top, 4 on the bottom). For staff, the last cell may be empty.
- Plain bright green background, with no floor, shadows, grid lines, text or numbers.
- Every figure is the whole body, head to shoes, and nothing is cut off at the edge.
- Same face, outfit and colours in all 8 cells.
- Top row walks **to the right**.

If Gemini keeps getting the grid wrong, add this to the end of the prompt: `Strictly 4 columns and 2 rows, evenly spaced.`

---

## Customers

### c0 — Ankara auntie
Reference: `assets/v2/c0.webp` · Save as: `assets/anim/src/c0.png`

```
Using the attached character as the exact reference (same face, skin tone, hairstyle, outfit, colours and cartoon painting style), create a sprite sheet for a 2D mobile cooking game.

Character: a plump, cheerful Nigerian woman wearing an orange and purple Ankara gele headwrap with a matching puff-sleeve buba blouse and an ankle-length orange and purple Ankara wrapper skirt, gold drop earrings, and simple brown sandals.

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

### c1 — Agbada man
Reference: `assets/v2/c1.webp` · Save as: `assets/anim/src/c1.png`

```
Using the attached character as the exact reference (same face, skin tone, beard, outfit, colours and cartoon painting style), create a sprite sheet for a 2D mobile cooking game.

Character: a friendly Nigerian man with a short beard wearing a sky-blue embroidered agbada over a matching buba and sokoto trousers, a matching blue fila cap tilted to one side, and brown leather slippers.

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

### c2 — Jersey guy
Reference: `assets/v2/c2.webp` · Save as: `assets/anim/src/c2.png`

```
Using the attached character as the exact reference (same face, skin tone, hairstyle, outfit, colours and cartoon painting style), create a sprite sheet for a 2D mobile cooking game.

Character: a cheerful young Nigerian man with short twists, wearing a red football jersey with white stripes on the shoulders, dark blue jeans and white sneakers.

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

### c3 — Braids student
Reference: `assets/v2/c3.webp` · Save as: `assets/anim/src/c3.png`

```
Using the attached character as the exact reference (same face, skin tone, hairstyle, outfit, colours and cartoon painting style), create a sprite sheet for a 2D mobile cooking game.

Character: a cheerful young Nigerian woman with long box braids with gold cuffs, round gold-rimmed glasses and gold hoop earrings, wearing a yellow fitted t-shirt, blue jeans and white sneakers, with a black backpack on her shoulders.

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

### c4 — Office man
Reference: `assets/v2/c4.webp` · Save as: `assets/anim/src/c4.png`

```
Using the attached character as the exact reference (same face, skin tone, glasses, goatee, outfit, colours and cartoon painting style), create a sprite sheet for a 2D mobile cooking game.

Character: a friendly Nigerian office worker with black-rimmed glasses and a goatee, wearing a white shirt with rolled-up sleeves, a navy blue tie with a gold tie clip, dark navy trousers with a black belt, and black leather shoes.

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

### c5 — Grandma
Reference: `assets/v2/c5.webp` · Save as: `assets/anim/src/c5.png`

```
Using the attached character as the exact reference (same face, skin tone, grey hair, outfit, colours and cartoon painting style), create a sprite sheet for a 2D mobile cooking game.

Character: a sweet, plump elderly Nigerian grandmother with grey hair, wearing a purple gele headwrap, a purple floral lace buba blouse, a teal-green patterned wrapper skirt to her ankles, gold earrings and simple sandals. She walks a little slower and slightly stooped.

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

## Staff

### cook — Mama Put cook
Reference: `assets/v2/staff_waiter.webp` (the woman in the yellow MAMAPUT apron) · Save as: `assets/anim/src/cook.png`

```
Using the attached character as the exact reference (same face, skin tone, hairstyle, outfit, colours and cartoon painting style), create a sprite sheet for a 2D mobile cooking game.

Character: a cheerful Nigerian woman cook wearing a yellow cap, gold hoop earrings, a brown short-sleeved shirt, a long yellow apron with the word MAMAPUT on the chest, dark brown trousers and comfortable black shoes. Her hands are empty (no plate).

Layout: one 16:9 image divided into a 4 by 2 grid of 8 equal cells. No borders, no grid lines, no text other than MAMAPUT on the apron, no numbers. The background is solid flat pure green (#00FF00) everywhere, with no floor, no shadows and no gradient.

Every cell shows the same character, full body from head to shoes, fully inside the cell with a small margin, drawn at the same size and scale in every cell, with the feet at the same height in every cell.

Top row, left to right, a walking cycle moving to the right, in a three-quarter side view facing right:
1. left foot forward, heel touching the ground, right arm swinging forward
2. legs passing each other, body slightly raised
3. right foot forward, heel touching the ground, left arm swinging forward
4. legs passing each other, body slightly raised

Bottom row, left to right, facing the viewer:
5. standing relaxed with a warm smile, hands on hips
6. stirring with a long wooden spoon held in both hands, spoon tilted left
7. stirring with a long wooden spoon held in both hands, spoon tilted right
8. leave this cell empty, plain green only

Style: bright, warm, glossy cartoon art like a casual mobile cooking game, clean dark outlines, soft cel shading, friendly happy expression, Nigerian character design.
```

### waiter — Waiter
Reference: `assets/v2/c2.webp` (**style reference only**, this is a new character) · Save as: `assets/anim/src/waiter.png`

```
Use the attached image only as a style reference (same cartoon painting style, line work and shading). Draw a NEW character, not the person in the reference. Create a sprite sheet for a 2D mobile cooking game.

Character: a smart, smiling young Nigerian waiter with a neat low haircut and a thin moustache, wearing a crisp white long-sleeved shirt, a black waistcoat, a red bow tie, black trousers and shiny black shoes, with a small white cloth folded over his left forearm. His hands are empty.

Layout: one 16:9 image divided into a 4 by 2 grid of 8 equal cells. No borders, no grid lines, no text, no numbers. The background is solid flat pure green (#00FF00) everywhere, with no floor, no shadows and no gradient.

Every cell shows the same character, full body from head to shoes, fully inside the cell with a small margin, drawn at the same size and scale in every cell, with the feet at the same height in every cell.

Top row, left to right, a brisk walking cycle moving to the right, in a three-quarter side view facing right:
1. left foot forward, heel touching the ground, right arm swinging forward
2. legs passing each other, body slightly raised
3. right foot forward, heel touching the ground, left arm swinging forward
4. legs passing each other, body slightly raised

Bottom row, left to right, facing the viewer:
5. standing politely with hands clasped in front, smiling
6. writing on a small notepad with a pencil
7. bowing slightly with one hand on his chest, smiling
8. leave this cell empty, plain green only

Style: bright, warm, glossy cartoon art like a casual mobile cooking game, clean dark outlines, soft cel shading, friendly happy expression, Nigerian character design.
```

### cleaner — Cleaner
Reference: `assets/v2/staff_cleaner.webp` · Save as: `assets/anim/src/cleaner.png`

```
Using the attached character as the exact reference (same face, skin tone, headwrap, outfit, colours and cartoon painting style), create a sprite sheet for a 2D mobile cooking game.

Character: a cheerful, plump Nigerian woman cleaner wearing a blue and white patterned headwrap, a blue short-sleeved uniform dress to below the knee, yellow rubber gloves and white canvas shoes, holding a wooden mop with a grey mop head.

Layout: one 16:9 image divided into a 4 by 2 grid of 8 equal cells. No borders, no grid lines, no text, no numbers. The background is solid flat pure green (#00FF00) everywhere, with no floor, no shadows and no gradient.

Every cell shows the same character, full body from head to shoes, fully inside the cell with a small margin, drawn at the same size and scale in every cell, with the feet at the same height in every cell.

Top row, left to right, a walking cycle moving to the right in a three-quarter side view facing right, carrying the mop upright beside her:
1. left foot forward, heel touching the ground
2. legs passing each other, body slightly raised
3. right foot forward, heel touching the ground
4. legs passing each other, body slightly raised

Bottom row, left to right, facing the viewer:
5. standing relaxed holding the mop upright, smiling
6. mopping the floor, mop head swept to the left
7. mopping the floor, mop head swept to the right
8. leave this cell empty, plain green only

Style: bright, warm, glossy cartoon art like a casual mobile cooking game, clean dark outlines, soft cel shading, friendly happy expression, Nigerian character design.
```

---

## Ibadan and Port Harcourt customers (optional)

These destinations use their own customer portraits (`assets/v4/ci0–ci5.webp` and `assets/v4/cp0–cp5.webp`). To animate them, use the customer prompt above with that portrait attached. Replace the "Character:" line with a short description of the person in the portrait. Save the sheet as `assets/anim/src/ci0.png` … `cp5.png`, using the portrait's own name.
