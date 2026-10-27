# Cooking Fever: what makes it feel like Cooking Fever (research, Oct 27 2026)
Sources: Google Play store screenshots (Nordcurrent listing, viewed 4 landscape shots), gamedesign.consulting
"Introducing Challenge to Casual Games: Cooking Fever", Cooking Fever Fandom wiki (Restaurants / Fast Food Court),
r/officialcookingfever beginner tips, Cooking Fever FB tips post.

Look (from the store screenshots)
- Landscape. The counter is the hero: it fills the bottom ~55-60% of the screen in 2.5D perspective (seen slightly from above),
  packed edge to edge with appliances and trays (grill with patties, fryer, drink machine, plates, ingredient bins, bin).
- Customers: big cartoon upper bodies standing behind the counter in a row (3-4), each with a white order card above/next
  to them showing item icons. Restaurant interior behind them (windows, plants, shelves, tables), bright and saturated.
- Rendering: glossy, shaded, highlights, rich colour; food looks juicy; chunky blue banners with white bold text.
- Upgrade screen = before/after of the same restaurant (appliances + interior decor visibly nicer).

Play (wiki + design analysis + tips)
- A round ends when time runs out or the last customer is served. Score = coins; stars depend on coins earned.
- Each customer wants a list of items; you prepare by drag and drop (ingredients -> appliance -> plate -> customer).
- Happiness/patience meter starts draining once a customer is servable; at 0 they leave. Happier = bigger tip.
- Max 4 customers at a time. Served customers leave coins on the counter; you tap to collect, which frees the slot
  (players use this to pace the round).
- Each restaurant/area has one main-dish assembly method + side dishes/drinks; difficulty ramps by adding components.
- Levels are deterministic (same customers each time) so players can master them; 40 levels per restaurant; need >=1 star
  to unlock the next level.
- Appliance upgrades let an appliance produce 2-3 items per cycle / faster; interior upgrades (tables, decor) raise
  patience/tips. Restaurants unlock on a map.

What I'll copy for Mama Put Fever v2 (mechanics, not assets)
- Landscape stage, perspective counter with stations in a row, 4 customer slots with order cards + patience bars.
- Drag (and tap) flow: raw -> grill/fryer/pot -> plate assembly -> customer; drinks from a dispenser; bin.
- Raw -> ready -> burnt on grill/fryer; pot refills by dragging the recipe ingredients in.
- Coins left on the counter, tap to collect (frees the slot), tips by happiness, combo bonus.
- Coin-goal levels with 3 stars, fixed customer scripts, appliance + decor upgrades between levels.
- Her ask kept: Owambe bulk EVENT orders (cook for N -> count packs -> okada delivery) inside some levels.
