#!/usr/bin/env python3
"""Generate Somax ORIGINAL sports-nutrition meals -> meals/somax-sports-meals.json

Licensing: every recipe below is a Somax original, composed from general
sports-nutrition principles (recovery 4 Rs, pre-training timing, portion scaling
with training load) and ordinary food knowledge. Nothing here is taken from or
adapted from the AIS recipe set held in meals/held/ (CC BY-NC-ND) - that file was
deliberately not opened while writing this.

Macros: each recipe lists raw/as-sold ingredient weights. Per-100 g values in FOODS
are rounded from AUSNUT 2011-13 / Australian Food Composition Database where a
matching item exists, otherwise USDA FoodData Central (SR Legacy). Carbohydrate is
*available* carbohydrate (excludes fibre), as in AUSNUT. Per-serving macros are
the ingredient sum / servings. kcal uses the food's own energy value (which
includes fibre/alcohol energy), so we also check it is within 10% of 4P+4C+9F.

Diet tags are DERIVED from ingredient flags (never hand-tagged):
  n = not vegetarian (meat/fish/animal-rennet cheese/stock)
  a = animal product (egg, honey) -> not vegan
  d = dairy -> not vegan, not dairy-free
  g = contains or may contain gluten (wheat, oats, barley, regular soy sauce,
      stock, miso, most sauces) -> not gluten-free. Oats are flagged g because
      FSANZ does not allow oats to be labelled gluten-free in Australia.
  l = liquid (amount shown in ml, 1 g ~ 1 ml)
high-protein: protein >= 25 g (meals) / >= 15 g (snacks) AND >= 20% of energy.
low-carb: carbs <= 25 g AND < 26% of energy.

Run:  python3 tools/gen_somax_sports_meals.py   (writes + validates)
"""
import json, os, sys, collections

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, "meals", "somax-sports-meals.json")

# key: (display name, kcal, protein g, avail carb g, fat g, flags)   per 100 g
FOODS = {
    # --- grains & starches (dry/raw unless stated) ---
    "oats":        ("rolled oats", 375, 13.0, 60.0, 8.0, "g"),
    "rice_white":  ("jasmine or basmati rice (dry)", 355, 7.0, 79.0, 0.6, ""),
    "rice_sushi":  ("sushi rice (dry)", 355, 7.0, 79.0, 0.6, ""),
    "rice_brown":  ("brown rice (dry)", 360, 7.5, 76.0, 2.7, ""),
    "rice_cooked": ("cooked white rice", 150, 2.8, 32.0, 1.5, ""),
    "pasta":       ("dried pasta", 355, 12.5, 71.0, 1.5, "g"),
    "couscous":    ("couscous (dry)", 360, 12.8, 72.0, 0.6, "g"),
    "quinoa":      ("quinoa (dry)", 368, 14.0, 57.0, 6.0, ""),
    "polenta":     ("instant polenta (dry)", 360, 8.0, 76.0, 1.5, ""),
    "rice_noodle": ("dried rice noodles", 360, 6.0, 81.0, 0.6, ""),
    "vermicelli":  ("dried rice vermicelli", 360, 6.0, 81.0, 0.6, ""),
    "wheat_noodle":("dried wheat noodles", 350, 11.0, 72.0, 1.5, "g"),
    "udon":        ("fresh udon noodles", 130, 3.5, 27.0, 0.4, "g"),
    "hokkien":     ("hokkien noodles", 165, 5.0, 33.0, 1.5, "g"),
    "gnocchi":     ("potato gnocchi (shelf)", 150, 3.5, 32.0, 0.4, "g"),
    "potato":      ("potatoes", 77, 2.0, 15.5, 0.1, ""),
    "sweet_potato":("sweet potato", 86, 1.6, 17.0, 0.1, ""),
    "pumpkin":     ("butternut pumpkin", 45, 1.0, 9.5, 0.1, ""),
    "bread_wm":    ("wholemeal bread", 245, 10.5, 41.0, 3.2, "g"),
    "bread_white": ("white bread", 255, 8.5, 47.0, 2.5, "g"),
    "sourdough":   ("sourdough bread", 250, 9.0, 48.0, 1.5, "g"),
    "fruit_loaf":  ("fruit loaf", 275, 8.0, 52.0, 3.5, "g"),
    "roll_wm":     ("wholemeal bread roll", 260, 10.0, 45.0, 3.5, "g"),
    "bun_white":   ("white burger bun", 270, 9.0, 50.0, 3.5, "g"),
    "wrap_wm":     ("wholemeal wrap", 300, 9.0, 50.0, 6.0, "g"),
    "pita":        ("pita bread", 275, 9.0, 55.0, 1.2, "g"),
    "corn_tort":   ("corn tortillas (100% corn)", 220, 5.7, 44.0, 2.9, ""),
    "muffin_eng":  ("English muffin", 230, 9.0, 43.0, 2.0, "g"),
    "bagel":       ("plain bagel", 260, 10.0, 50.0, 1.5, "g"),
    "crumpet":     ("crumpets", 190, 6.0, 38.0, 1.0, "dg"),   # some brands contain milk solids
    "rice_cracker":("plain rice crackers", 400, 7.0, 84.0, 2.5, ""),
    "rice_cake":   ("plain puffed rice cakes", 385, 8.0, 80.0, 3.0, ""),
    "rice_paper":  ("rice paper sheets", 345, 6.0, 80.0, 0.5, ""),
    "wheat_bix":   ("wholegrain wheat breakfast biscuits", 358, 12.3, 67.0, 1.4, "g"),
    "muesli":      ("untoasted muesli", 360, 10.0, 60.0, 7.0, "g"),
    # --- fruit ---
    "banana":      ("banana", 89, 1.1, 20.5, 0.3, ""),
    "apple":       ("apple", 52, 0.3, 12.5, 0.2, ""),
    "berries":     ("frozen mixed berries", 45, 0.8, 8.0, 0.3, ""),
    "blueberries": ("blueberries", 57, 0.7, 12.0, 0.3, ""),
    "strawberries":("strawberries", 32, 0.7, 6.0, 0.3, ""),
    "raspberries": ("frozen raspberries", 52, 1.2, 5.4, 0.7, ""),
    "mango":       ("mango (fresh or frozen)", 60, 0.8, 14.0, 0.4, ""),
    "pineapple":   ("pineapple", 50, 0.5, 11.5, 0.1, ""),
    "kiwi":        ("kiwifruit", 61, 1.1, 12.0, 0.5, ""),
    "orange":      ("orange", 47, 0.9, 10.0, 0.1, ""),
    "watermelon":  ("watermelon", 30, 0.6, 7.5, 0.2, ""),
    "dates":       ("medjool dates (pitted)", 277, 1.8, 66.0, 0.2, ""),
    "sultanas":    ("sultanas", 300, 3.0, 72.0, 0.5, ""),
    "apricot_dry": ("dried apricots", 240, 3.4, 50.0, 0.5, ""),
    "lemon":       ("lemon juice", 22, 0.4, 7.0, 0.2, "l"),
    "lime":        ("lime juice", 25, 0.4, 7.5, 0.1, "l"),
    "oj":          ("orange juice", 42, 0.6, 9.5, 0.1, "l"),
    "coconut_water":("coconut water", 19, 0.7, 3.7, 0.2, "l"),
    # --- dairy & eggs ---
    "milk_skim":   ("skim milk", 35, 3.5, 5.0, 0.1, "dl"),
    "milk_rf":     ("reduced-fat milk", 46, 3.5, 5.0, 1.4, "dl"),
    "milk_full":   ("full-cream milk", 65, 3.3, 4.8, 3.6, "dl"),
    "choc_milk":   ("reduced-fat chocolate milk", 75, 3.6, 11.0, 1.6, "dgl"),
    "greek0":      ("no-fat Greek yoghurt (plain)", 60, 10.0, 4.0, 0.2, "d"),
    "yog_vanilla": ("reduced-fat vanilla yoghurt", 85, 5.0, 13.0, 1.5, "dg"),
    "cottage":     ("reduced-fat cottage cheese", 85, 12.5, 3.0, 2.5, "d"),
    "ricotta":     ("light ricotta", 120, 10.5, 4.0, 7.0, "d"),
    "feta":        ("reduced-fat feta (vegetarian rennet)", 220, 20.0, 0.5, 15.0, "d"),
    "cheese_light":("light tasty cheese (vegetarian rennet)", 310, 30.0, 0.5, 21.0, "d"),
    "mozz_light":  ("reduced-fat mozzarella (vegetarian rennet)", 255, 26.0, 2.0, 16.0, "d"),
    "parmesan":    ("parmesan", 400, 35.0, 0.0, 29.0, "dn"),   # traditional animal rennet
    "custard":     ("reduced-fat custard", 95, 3.5, 15.5, 2.0, "dg"),
    "whey":        ("vanilla whey protein isolate", 375, 85.0, 5.0, 1.5, "dg"),
    "whey_gf":     ("whey protein isolate (gluten-free labelled)", 375, 85.0, 5.0, 1.5, "d"),
    "egg":         ("eggs", 137, 12.6, 0.3, 9.5, "a"),
    "egg_white":   ("liquid egg whites", 52, 10.9, 0.7, 0.2, "al"),
    # --- plant milks & proteins ---
    "soy_milk":    ("calcium-fortified soy milk", 55, 3.4, 4.5, 2.4, "gl"),  # some brands use barley malt
    "pea_protein": ("vanilla pea protein powder", 380, 78.0, 6.0, 6.0, "g"),
    "tofu":        ("firm tofu", 120, 13.0, 1.5, 7.0, ""),
    "tempeh":      ("tempeh", 192, 20.3, 7.6, 10.8, "g"),
    "edamame":     ("frozen shelled edamame", 121, 11.9, 4.0, 5.2, ""),
    "chickpeas":   ("canned chickpeas (drained)", 115, 6.3, 13.4, 2.0, ""),
    "lentils":     ("canned brown lentils (drained)", 82, 6.5, 11.0, 0.5, ""),
    "red_lentils": ("dried red lentils", 340, 24.0, 48.0, 1.5, ""),
    "black_beans": ("canned black beans (drained)", 110, 7.0, 14.0, 0.5, ""),
    "kidney":      ("canned red kidney beans (drained)", 105, 7.0, 13.5, 0.5, ""),
    "cannellini":  ("canned cannellini beans (drained)", 100, 6.5, 12.5, 0.5, ""),
    "baked_beans": ("baked beans in tomato sauce", 85, 4.8, 11.5, 0.4, "g"),
    "hummus":      ("hummus", 250, 7.5, 10.0, 20.0, ""),
    "pb":          ("natural peanut butter", 610, 25.0, 13.0, 50.0, ""),
    "almonds":     ("almonds", 600, 21.0, 5.0, 53.0, ""),
    "walnuts":     ("walnuts", 690, 15.0, 3.0, 68.0, ""),
    "cashews":     ("cashews", 590, 18.0, 27.0, 47.0, ""),
    "chia":        ("chia seeds", 483, 17.0, 6.0, 31.0, ""),
    "pepitas":     ("pepitas", 575, 30.0, 5.0, 49.0, ""),
    "sesame":      ("sesame seeds", 590, 18.0, 1.0, 52.0, ""),
    "tahini":      ("tahini", 640, 18.0, 3.0, 58.0, ""),
    # --- meat & seafood (raw unless stated) ---
    "chicken":     ("skinless chicken breast", 110, 23.5, 0.0, 1.5, "n"),
    "chicken_ckd": ("cooked skinless chicken breast", 165, 31.0, 0.0, 3.6, "n"),
    "chicken_mince":("lean chicken breast mince", 115, 21.5, 0.0, 3.0, "n"),
    "chicken_thigh":("trimmed chicken thigh fillets", 135, 19.5, 0.0, 6.5, "n"),
    "beef_mince":  ("lean beef mince (5% fat)", 135, 21.0, 0.0, 5.5, "n"),
    "beef_rump":   ("trimmed beef rump steak", 125, 22.5, 0.0, 4.0, "n"),
    "pork":        ("pork fillet", 115, 22.0, 0.0, 2.8, "n"),
    "lamb":        ("trimmed lamb leg steak", 140, 21.0, 0.0, 6.3, "n"),
    "turkey_mince":("lean turkey mince", 140, 21.0, 0.0, 6.0, "n"),
    "roo":         ("kangaroo fillet", 98, 22.0, 0.0, 1.0, "n"),
    "roo_mince":   ("kangaroo mince", 105, 21.5, 0.0, 2.0, "n"),
    "salmon":      ("salmon fillet", 200, 20.5, 0.0, 13.0, "n"),
    "salmon_sash": ("sashimi-grade salmon", 200, 20.5, 0.0, 13.0, "n"),
    "white_fish":  ("barramundi or other white fish fillet", 90, 19.0, 0.0, 1.5, "n"),
    "prawns":      ("raw peeled prawns", 80, 18.5, 0.0, 0.8, "n"),
    "tuna":        ("canned tuna in springwater (drained)", 110, 25.0, 0.0, 1.0, "n"),
    "smoked_salmon":("smoked salmon", 155, 22.0, 0.0, 7.5, "n"),
    "salmon_can_f":("canned pink salmon (drained)", 145, 21.0, 0.0, 6.8, "n"),
    "silken_tofu": ("silken tofu", 55, 5.5, 2.0, 2.7, ""),
    # --- vegetables ---
    "spinach":     ("baby spinach", 23, 2.9, 1.0, 0.4, ""),
    "rocket":      ("rocket", 25, 2.6, 2.0, 0.7, ""),
    "kale":        ("kale", 35, 2.9, 4.4, 0.6, ""),
    "cos":         ("cos lettuce", 17, 1.2, 1.5, 0.3, ""),
    "broccoli":    ("broccoli or broccolini", 34, 3.5, 3.5, 0.4, ""),
    "capsicum":    ("red capsicum", 31, 1.0, 6.0, 0.3, ""),
    "onion":       ("brown onion", 40, 1.1, 8.0, 0.1, ""),
    "red_onion":   ("red onion", 40, 1.1, 8.0, 0.1, ""),
    "spring_onion":("spring onion", 32, 1.8, 5.0, 0.2, ""),
    "garlic":      ("garlic", 149, 6.4, 30.0, 0.5, ""),
    "ginger":      ("fresh ginger", 80, 1.8, 17.0, 0.8, ""),
    "tomato":      ("tomato", 18, 0.9, 3.0, 0.2, ""),
    "cherry_tom":  ("cherry tomatoes", 18, 0.9, 3.0, 0.2, ""),
    "tin_tom":     ("canned diced tomatoes", 22, 1.0, 3.5, 0.2, ""),
    "passata":     ("tomato passata", 30, 1.4, 5.5, 0.2, ""),
    "tom_paste":   ("tomato paste", 82, 4.3, 15.0, 0.5, ""),
    "carrot":      ("carrot", 41, 0.9, 7.5, 0.2, ""),
    "zucchini":    ("zucchini", 17, 1.2, 2.5, 0.3, ""),
    "mushrooms":   ("mushrooms", 22, 3.1, 0.5, 0.3, ""),
    "peas":        ("frozen peas", 75, 5.4, 10.0, 0.4, ""),
    "corn":        ("corn kernels (canned or frozen)", 86, 3.3, 16.0, 1.4, ""),
    "green_beans": ("green beans", 31, 1.8, 4.5, 0.2, ""),
    "snow_peas":   ("snow peas", 42, 2.8, 5.5, 0.2, ""),
    "cucumber":    ("cucumber", 15, 0.6, 2.5, 0.1, ""),
    "avocado":     ("avocado", 200, 1.9, 0.5, 20.0, ""),
    "bok_choy":    ("bok choy", 13, 1.5, 1.2, 0.2, ""),
    "cabbage":     ("red cabbage (shredded)", 30, 1.3, 5.5, 0.2, ""),
    "slaw":        ("coleslaw mix (undressed)", 30, 1.3, 5.5, 0.2, ""),
    "stirfry_veg": ("frozen stir-fry vegetables", 35, 2.0, 5.0, 0.3, ""),
    "mixed_veg":   ("frozen peas, corn & carrot", 65, 3.0, 11.0, 0.5, ""),
    "beetroot":    ("canned sliced beetroot", 50, 1.0, 10.0, 0.1, ""),
    "sprouts":     ("bean sprouts", 30, 3.0, 4.0, 0.2, ""),
    "roast_capsicum":("roasted capsicum (jar, drained)", 30, 1.0, 5.0, 0.5, ""),
    "herbs":       ("fresh herbs", 30, 2.5, 3.0, 0.6, ""),
    "chilli":      ("fresh chilli", 40, 1.9, 7.0, 0.4, ""),
    # --- pantry ---
    "olive_oil":   ("olive oil", 884, 0.0, 0.0, 100.0, ""),
    "sesame_oil":  ("sesame oil", 884, 0.0, 0.0, 100.0, ""),
    "honey":       ("honey", 304, 0.3, 82.0, 0.0, "a"),
    "maple":       ("pure maple syrup", 260, 0.0, 67.0, 0.1, ""),
    "jam":         ("strawberry jam", 250, 0.4, 62.0, 0.1, ""),
    "tamari":      ("gluten-free tamari", 60, 10.0, 5.0, 0.1, "l"),
    "soy_sauce":   ("reduced-salt soy sauce", 55, 8.0, 5.5, 0.1, "gl"),
    "fish_sauce":  ("fish sauce", 35, 5.0, 3.6, 0.0, "ngl"),
    "sweet_chilli":("sweet chilli sauce", 220, 0.5, 52.0, 0.5, "g"),
    "salsa":       ("tomato salsa (jar)", 35, 1.5, 6.5, 0.2, "g"),
    "bbq_sauce":   ("barbecue sauce", 170, 1.0, 40.0, 0.5, "ng"),  # may contain anchovy (Worcestershire)
    "gochujang":   ("gochujang chilli paste", 200, 4.0, 42.0, 1.5, "g"),
    "miso":        ("white miso paste", 200, 12.0, 26.0, 6.0, "g"),
    "pesto":       ("basil pesto", 450, 5.0, 6.0, 45.0, "nd"),  # parmesan -> animal rennet
    "coconut_milk":("light coconut milk", 115, 1.0, 3.0, 11.0, "l"),
    "stock_chicken":("reduced-salt chicken stock", 5, 0.6, 0.4, 0.1, "ngl"),
    "stock_chicken_gf":("gluten-free chicken stock", 5, 0.6, 0.4, 0.1, "nl"),
    "stock_beef_gf":("gluten-free beef stock", 6, 0.8, 0.4, 0.1, "nl"),
    "stock_veg":   ("reduced-salt vegetable stock", 8, 0.3, 1.2, 0.2, "gl"),
    "stock_veg_gf":("gluten-free vegetable stock", 8, 0.3, 1.2, 0.2, "l"),
    "cocoa":       ("cocoa powder", 245, 20.0, 12.0, 13.0, ""),
    "balsamic":    ("balsamic vinegar", 88, 0.5, 17.0, 0.0, "l"),
    "spices":      ("spices (see method)", 300, 12.0, 40.0, 12.0, ""),
    "curry_powder":("curry powder", 325, 14.0, 26.0, 14.0, ""),
    "coffee":      ("cold brew coffee", 2, 0.1, 0.0, 0.0, "l"),
    "water":       ("water", 0, 0, 0, 0, "l"),
    "salt":        ("salt", 0, 0, 0, 0, ""),
    "nori":        ("nori sheets", 300, 41.0, 5.0, 3.0, ""),
    "capers":      ("capers", 25, 2.4, 2.0, 0.9, ""),
}

def I(key, grams, label=None, amount=None):
    return (key, grams, label, amount)

RECIPES = []
def R(id, name, mealType, level, goals, prep, servings, ings, steps, desc, who,
      light_text, light_keys, tip2, timing, tags=()):
    RECIPES.append(dict(id=id, name=name, mealType=mealType, level=level, goals=goals,
        prep=prep, servings=servings, ings=ings, steps=steps, desc=desc, who=who,
        light_text=light_text, light_keys=list(light_keys), tip2=tip2,
        timing=timing, tags=set(tags)))

# ============================================================ HIGH-PROTEIN / PRE-TRAINING BREAKFASTS
R("somax-sn-berry-crunch-biscuit-bowl", "Somax Berry Crunch Breakfast Bowl", "breakfast", "beginner",
  ["general-fitness", "endurance"], 5, 1,
  [I("wheat_bix", 45, "wholegrain wheat breakfast biscuits (3)"), I("milk_skim", 200), I("greek0", 150),
   I("berries", 100), I("honey", 10)],
  ["Crumble the wheat biscuits into a wide bowl.", "Spoon the yoghurt down one side and pour the milk around it.",
   "Scatter over the berries (straight from frozen is fine) and drizzle with honey."],
  "A crunchy, creamy bowl that lands ~30 g protein and plenty of easy carbs with zero cooking.",
  "Morning trainers: eat it 1.5-2 hours before a session, or straight after an early one with a piece of fruit.",
  "use 2 biscuits and skip the honey", ["wheat_bix:0.667", "honey:0"],
  "Frozen berries thaw into the yoghurt in 5 minutes and make a built-in sauce.", "pre-training meal", ["budget"])

R("somax-sn-smoky-bean-egg-wrap", "Somax Smoky Bean & Egg Breakfast Wrap", "breakfast", "beginner",
  ["muscle", "strength"], 10, 1,
  [I("wrap_wm", 65, "wholemeal wrap (1 large)"), I("egg", 100, "eggs (2 large)"), I("egg_white", 60),
   I("black_beans", 80), I("salsa", 30), I("spinach", 30), I("cheese_light", 15), I("spices", 1, "smoked paprika")],
  ["Whisk the eggs, egg whites and smoked paprika.", "Warm the black beans in a non-stick pan, push to one side and scramble the eggs alongside.",
   "Lay spinach on the wrap, pile on beans and eggs, top with salsa and cheese.", "Roll tightly and toast seam-side down for 1 minute."],
  "A hand-held hot breakfast with ~35 g protein from eggs and beans.",
  "Lifters training later in the day: eat it 3+ hours before the gym or as the first meal after a morning session.",
  "use a small (40 g) wrap and halve the beans", ["wrap_wm:0.6", "black_beans"],
  "Make 3 and freeze in foil; reheat from frozen in a sandwich press for 6-7 minutes.", "high-protein breakfast", ["batch"])

R("somax-sn-choc-banana-overnight-jar", "Somax Choc-Banana Overnight Oat Jar", "breakfast", "beginner",
  ["muscle", "endurance"], 5, 1,
  [I("oats", 50), I("soy_milk", 200), I("pea_protein", 25), I("cocoa", 6), I("banana", 100, "banana (1 small)"), I("chia", 8)],
  ["Mash half the banana in a jar.", "Stir in oats, soy milk, pea protein, cocoa and chia until smooth.",
   "Refrigerate overnight; slice the rest of the banana on top before eating."],
  "A dairy-free chocolate oat jar with ~32 g plant protein.",
  "Early sessions and plant-based eaters: grab it 60-90 minutes before training or eat it on the commute after.",
  "halve the oats and banana", ["oats", "banana"],
  "Line up 3 jars on Sunday night; they keep 3 days in the fridge.", "overnight/batch-prep", ["batch"])

R("somax-sn-tofu-scramble-sourdough", "Somax Golden Tofu Scramble on Sourdough", "breakfast", "intermediate",
  ["muscle", "general-fitness"], 15, 1,
  [I("tofu", 180), I("sourdough", 80, "sourdough bread (2 slices)"), I("mushrooms", 70), I("spinach", 40),
   I("cherry_tom", 80), I("olive_oil", 5), I("spices", 2, "ground turmeric & cumin")],
  ["Brown the mushrooms in the oil over high heat for 3 minutes.", "Crumble in the tofu with turmeric, cumin and a pinch of salt; cook 4 minutes until golden.",
   "Fold through spinach and halved tomatoes until just wilted.", "Pile onto toasted sourdough."],
  "A turmeric-gold vegan scramble that eats like a café brekkie.",
  "Plant-based athletes: a big recovery breakfast within 1-2 hours of morning training.",
  "use 1 slice of sourdough", ["sourdough"],
  "Press the tofu between paper towel for 5 minutes first - it browns rather than steams.", "high-protein breakfast")

R("somax-sn-smoked-salmon-bagel", "Somax Smoked Salmon & Whipped Cottage Bagel", "breakfast", "beginner",
  ["muscle", "general-fitness"], 5, 1,
  [I("bagel", 90, "plain bagel (1)"), I("cottage", 80), I("smoked_salmon", 60), I("rocket", 15), I("lemon", 5), I("capers", 5)],
  ["Blitz or whisk the cottage cheese with lemon juice until smooth.", "Toast the bagel halves.",
   "Spread with whipped cottage, top with salmon, capers and rocket; finish with black pepper."],
  "Deli-style bagel with ~33 g protein and omega-3s.",
  "Anyone after a filling post-training breakfast within 1-2 hours of a morning session.",
  "use half the bagel (one side)", ["bagel"],
  "Whipped cottage cheese is a high-protein swap for cream cheese at a fraction of the fat.", "high-protein breakfast")

R("somax-sn-mango-lassi-bowl", "Somax Mango Lassi Yoghurt Bowl", "breakfast", "beginner",
  ["endurance", "general-fitness"], 5, 1,
  [I("greek0", 200), I("mango", 150), I("muesli", 40), I("honey", 8), I("spices", 0.5, "ground cardamom")],
  ["Blend half the mango with the yoghurt and cardamom until smooth.", "Pour into a bowl and top with the remaining diced mango and muesli.",
   "Drizzle with honey."],
  "All the flavour of a mango lassi as a spoonable bowl, ~25 g protein.",
  "Morning runners and riders: 1-2 hours before an easy session, or as a cool recovery breakfast in summer.",
  "halve the mango and muesli", ["mango", "muesli"],
  "Frozen mango makes it thick like soft-serve.", "pre-training meal")

R("somax-sn-apple-cinnamon-baked-oats", "Somax Apple-Cinnamon Baked Oat Slice", "breakfast", "beginner",
  ["muscle", "endurance"], 40, 4,
  [I("oats", 240), I("egg", 100, "eggs (2 large)"), I("milk_skim", 500), I("apple", 300, "apples (2, grated)"),
   I("whey", 60), I("maple", 40), I("spices", 3, "cinnamon")],
  ["Heat oven to 180C and line a 20 cm square tin.", "Whisk eggs, milk, whey, maple and cinnamon; stir in oats and grated apple.",
   "Pour into the tin and bake 30-35 minutes until set and golden.", "Cool and cut into 4 big squares."],
  "A make-ahead breakfast slice: one square is ~29 g protein and 70 g carbs.",
  "Busy athletes: reheat a square 2 hours before training, or eat it cold after a morning session.",
  "half a square with a piece of fruit", ["*:0.5"],
  "Keeps 4 days in the fridge or freeze squares individually.", "overnight/batch-prep", ["batch", "budget"])

R("somax-sn-polenta-berry-porridge", "Somax Creamy Polenta Berry Porridge", "breakfast", "intermediate",
  ["endurance", "general-fitness"], 10, 1,
  [I("polenta", 50), I("milk_rf", 300), I("greek0", 120), I("blueberries", 100), I("maple", 10), I("spices", 1, "vanilla & cinnamon")],
  ["Bring the milk to a simmer and whisk in the polenta.", "Stir for 3-4 minutes until thick and creamy; add vanilla and cinnamon.",
   "Top with Greek yoghurt, blueberries and maple."],
  "A gluten-free alternative to oats - silky, warm and carb-rich.",
  "Gluten-free athletes: eat 2 hours before training or a morning race for steady, low-fibre fuel.",
  "halve the polenta", ["polenta"],
  "Polenta thickens more as it sits - loosen with a splash of milk.", "pre-training meal")

R("somax-sn-quinoa-banana-breakfast-pot", "Somax Vegan Quinoa Banana Breakfast Pot", "breakfast", "intermediate",
  ["general-fitness", "endurance"], 20, 1,
  [I("quinoa", 50), I("soy_milk", 250), I("banana", 100), I("pea_protein", 20), I("pepitas", 10), I("spices", 1, "cinnamon")],
  ["Rinse quinoa, then simmer in the soy milk with cinnamon for 15 minutes until tender.", "Stir in pea protein off the heat (add a splash of water if thick).",
   "Top with sliced banana and pepitas."],
  "Warm, nutty and fully plant-based with ~32 g protein.",
  "Vegan athletes: a recovery breakfast within 1-2 hours of training, or 2-3 hours before.",
  "halve the quinoa and banana", ["quinoa", "banana"],
  "Cook a triple batch of quinoa in milk and reheat portions all week.", "high-protein breakfast", ["batch"])

R("somax-sn-egg-potato-hash", "Somax Egg & Crispy Potato Breakfast Hash", "breakfast", "intermediate",
  ["strength", "muscle"], 25, 1,
  [I("potato", 250), I("egg", 150, "eggs (3 large)"), I("egg_white", 80), I("capsicum", 80), I("spinach", 40),
   I("spring_onion", 15), I("olive_oil", 7)],
  ["Dice potatoes into 1.5 cm cubes and microwave 4 minutes to par-cook.", "Fry in the oil with capsicum until crisp, 8-10 minutes.",
   "Stir in spinach and spring onion, make wells and crack in the eggs; pour the whites around.", "Cover and cook 3-4 minutes until the eggs are set."],
  "A one-pan hash with real crunch, gluten-free and dairy-free.",
  "Strength athletes: a weekend recovery brunch 1-2 hours after a heavy session.",
  "halve the potato", ["potato"],
  "Leftover cooked potatoes from dinner make this a 10-minute job.", "recovery meal")

R("somax-sn-race-morning-toast-stack", "Somax Race-Morning Jam & Banana Toast Stack", "breakfast", "beginner",
  ["endurance"], 5, 1,
  [I("bread_white", 105, "white bread (3 slices)"), I("jam", 30), I("banana", 120, "banana (1 medium)"), I("milk_rf", 250, "reduced-fat milk (to drink or in coffee)")],
  ["Toast the bread and spread with jam.", "Slice the banana over the top.", "Have the milk as a drink or a milky coffee."],
  "Deliberately low-fibre, low-fat, high-carb fuel (~110 g carbs) that sits light in the stomach.",
  "Race or game mornings: eat 2-3 hours before the start. Practise it on a long training day first.",
  "use 1.5 slices of toast, half the jam and half the banana", ["bread_white", "banana", "jam"],
  "White bread here is intentional - less fibre means fewer gut issues mid-race.", "game/race-day", ["budget"])

R("somax-sn-honey-rice-pudding-pot", "Somax Honey-Cinnamon Rice Pudding Pot", "breakfast", "beginner",
  ["endurance"], 10, 1,
  [I("rice_cooked", 200), I("milk_rf", 250), I("honey", 15), I("sultanas", 20), I("spices", 1, "cinnamon")],
  ["Simmer the cooked rice in the milk for 6-8 minutes, stirring, until creamy.", "Stir in honey and sultanas; dust with cinnamon.",
   "Eat warm, or chill in a jar for the next morning."],
  "Comforting, gut-friendly carbs (~105 g) from leftover rice.",
  "Endurance athletes: 2-3 hours before a race or long ride, or during a carb-loading day.",
  "halve the rice and sultanas", ["rice_cooked", "sultanas"],
  "Cook extra rice the night before - cold-cooked rice works perfectly.", "game/race-day", ["budget", "batch"])

R("somax-sn-english-muffin-egg-stack", "Somax Double Egg English Muffin", "breakfast", "beginner",
  ["muscle", "general-fitness"], 10, 1,
  [I("muffin_eng", 70, "English muffin (1)"), I("egg", 50, "egg (1 large)"), I("egg_white", 80), I("cheese_light", 20),
   I("spinach", 20), I("tomato", 50)],
  ["Pour egg whites into a lightly sprayed ring or small pan and cook until set; fry the whole egg alongside.",
   "Toast the muffin and layer spinach, tomato, egg white, egg and cheese.", "Close and press for 30 seconds so the cheese melts."],
  "A drive-thru-style muffin with ~29 g protein and about half the fat.",
  "Anyone needing a quick recovery breakfast within an hour of training.",
  "use half the muffin open-face", ["muffin_eng"],
  "Wrap in baking paper - it travels well to work.", "high-protein breakfast")

# ============================================================ PRE-TRAINING MEALS (2-4 h before)
R("somax-sn-lemon-herb-chicken-rice", "Somax Lemon-Herb Chicken Rice Bowl", "lunch", "beginner",
  ["endurance", "general-fitness"], 25, 1,
  [I("chicken", 140), I("rice_white", 90), I("zucchini", 100), I("cherry_tom", 80), I("lemon", 15), I("herbs", 10, "parsley & oregano"), I("olive_oil", 5)],
  ["Cook the rice.", "Toss chicken with lemon, oregano and half the oil; pan-cook 5-6 minutes each side.",
   "Char sliced zucchini and tomatoes in the same pan.", "Slice chicken over rice and veg; finish with parsley and extra lemon."],
  "Clean, simple and easy to digest - ~37 g protein, ~78 g carbs, low fat.",
  "Eat as lunch 3-4 hours before an afternoon session or game.",
  "halve the rice", ["rice_white"],
  "Cook 4 portions of chicken at once for grab-and-go lunches.", "pre-training meal", ["batch"])

R("somax-sn-tuna-lemon-penne", "Somax Lemony Tuna, Pea & Rocket Penne", "dinner", "beginner",
  ["endurance", "general-fitness"], 15, 1,
  [I("pasta", 100), I("tuna", 95, "canned tuna in springwater (1 can, drained)"), I("peas", 80), I("cherry_tom", 80),
   I("lemon", 15), I("rocket", 30), I("olive_oil", 5), I("garlic", 5)],
  ["Boil pasta; add peas for the last 2 minutes.", "Meanwhile warm garlic and halved tomatoes in the oil.",
   "Drain pasta and peas, toss with tomatoes, tuna, lemon juice and rocket."],
  "A 15-minute pantry pasta with ~40 g protein and ~85 g carbs.",
  "Eat 3-4 hours before an evening session, or as a recovery dinner after one.",
  "halve the pasta", ["pasta"],
  "Add chilli flakes and lemon zest if you have them.", "pre-training meal", ["budget"])

R("somax-sn-chicken-tomato-gnocchi", "Somax Chicken & Tomato Gnocchi", "dinner", "beginner",
  ["endurance", "muscle"], 20, 1,
  [I("gnocchi", 250), I("chicken", 120), I("passata", 150), I("spinach", 40), I("parmesan", 10), I("garlic", 5), I("olive_oil", 4)],
  ["Pan-fry diced chicken in the oil until cooked; add garlic for 30 seconds.", "Pour in passata and simmer 5 minutes.",
   "Boil gnocchi until they float, then toss into the sauce with spinach.", "Finish with parmesan."],
  "Soft pillowy gnocchi in a light tomato sauce - ~100 g carbs, low fat.",
  "A pre-game or pre-race dinner the night before, or 3-4 hours ahead of an evening game.",
  "use half the gnocchi", ["gnocchi"],
  "Shelf gnocchi cooks in 2 minutes - check the label for low fat.", "endurance carb meal")

R("somax-sn-prawn-rice-noodle-salad", "Somax Prawn & Rice Noodle Herb Salad", "lunch", "intermediate",
  ["fat-loss", "endurance"], 20, 1,
  [I("rice_noodle", 80), I("prawns", 150), I("cucumber", 80), I("carrot", 60), I("herbs", 15, "mint & coriander"),
   I("lime", 20), I("tamari", 10), I("honey", 8), I("chilli", 5)],
  ["Soak or boil noodles per packet; rinse in cold water.", "Cook prawns in a hot pan 2 minutes each side.",
   "Shake lime, tamari, honey and chilli into a dressing.", "Toss noodles, ribboned cucumber and carrot, herbs and prawns with the dressing."],
  "Fresh, zingy and gluten-free - ~32 g protein with barely any fat.",
  "A light lunch 2-3 hours before afternoon training, or a summer recovery meal.",
  "halve the noodles", ["rice_noodle"],
  "Use cooked prawns to make it a 10-minute desk lunch.", "pre-training meal")

R("somax-sn-pumpkin-ricotta-penne", "Somax Roast Pumpkin, Spinach & Ricotta Penne", "dinner", "intermediate",
  ["endurance", "general-fitness"], 35, 1,
  [I("pasta", 100), I("pumpkin", 200), I("ricotta", 80), I("spinach", 40), I("pepitas", 10), I("olive_oil", 5), I("garlic", 5)],
  ["Roast diced pumpkin with the oil at 200C for 25 minutes.", "Cook pasta; reserve a splash of water.",
   "Mash half the pumpkin with ricotta, garlic and pasta water into a sauce.", "Toss pasta with sauce, remaining pumpkin and spinach; top with pepitas."],
  "Sweet roast pumpkin in a creamy ricotta sauce - vegetarian carb fuel.",
  "Vegetarian endurance athletes: the dinner before a long session, or 3-4 hours before an evening one.",
  "halve the pasta", ["pasta"],
  "Roast a whole pumpkin on Sunday and this takes 12 minutes.", "pre-training meal")

R("somax-sn-tamari-tofu-pineapple-rice", "Somax Sticky Tamari Tofu & Pineapple Rice Bowl", "dinner", "intermediate",
  ["general-fitness", "endurance"], 25, 1,
  [I("tofu", 180), I("rice_white", 80), I("pineapple", 100), I("capsicum", 80), I("snow_peas", 60),
   I("tamari", 15), I("maple", 10), I("sesame_oil", 3), I("spring_onion", 10)],
  ["Cook the rice.", "Cube and pat dry the tofu; brown in a non-stick pan with sesame oil.",
   "Add capsicum, snow peas and pineapple for 3 minutes.", "Pour over tamari and maple and toss until sticky; serve over rice with spring onion."],
  "Sweet-salty glazed tofu that's vegan and gluten-free.",
  "Plant-based athletes: dinner 3-4 hours before an evening session or as recovery 1-2 hours after.",
  "halve the rice", ["rice_white"],
  "Swap tofu for chicken breast if you're not plant-based.", "pre-training meal")

# ============================================================ PRE-TRAINING SNACKS (within the hour before)
R("somax-sn-cinnamon-fruit-toast-milk", "Somax Cinnamon Fruit Toast & Milk", "snack", "beginner",
  ["endurance", "general-fitness"], 3, 1,
  [I("fruit_loaf", 70, "fruit loaf (2 slices)"), I("honey", 8), I("spices", 0.5, "cinnamon"), I("milk_skim", 250)],
  ["Toast the fruit loaf.", "Drizzle with honey and dust with cinnamon.", "Drink the milk alongside."],
  "Hits the snack template: >=10 g protein and >=35 g carbs.",
  "Eat 45-60 minutes before training, or as a recovery snack within 30 minutes after.",
  "one slice of toast", ["fruit_loaf", "honey"],
  "Iced or warm, the milk counts towards your fluid too.", "pre-training snack", ["budget"])

R("somax-sn-banana-date-oat-bars", "Somax Banana-Date Oat Bars", "snack", "beginner",
  ["endurance", "muscle"], 35, 8,
  [I("oats", 240), I("banana", 360, "ripe bananas (3)"), I("dates", 120), I("pb", 60), I("sultanas", 60), I("spices", 3, "cinnamon")],
  ["Heat oven to 180C and line a slice tin.", "Mash bananas; blitz or finely chop dates.",
   "Mix bananas, dates, peanut butter, cinnamon, oats and sultanas.", "Press into the tin, bake 25 minutes, cool fully and cut into 8 bars."],
  "No-added-sugar fuel bars sweetened with fruit - ~45 g carbs each.",
  "Eat a bar 45-60 minutes before training, or pack them for long rides and tournament days.",
  "half a bar", ["*:0.5"],
  "Wrap individually and freeze; they thaw in your bag by the session.", "pre-training snack", ["batch", "budget"])

R("somax-sn-tropical-fruit-yoghurt-dip", "Somax Tropical Fruit Cup & Honey Yoghurt Dip", "snack", "beginner",
  ["endurance", "fat-loss"], 5, 1,
  [I("pineapple", 100), I("watermelon", 150), I("kiwi", 80, "kiwifruit (1)"), I("greek0", 100), I("honey", 10)],
  ["Cube the pineapple, watermelon and kiwi.", "Stir honey through the yoghurt.", "Dip fruit into yoghurt."],
  "Hydrating, juicy carbs with a protein dip.",
  "Hot-weather sessions: 45-60 minutes before training, or as a cooling recovery snack.",
  "skip the pineapple", ["pineapple:0"],
  "Watermelon is ~90% water - great when you're hot and not hungry.", "pre-training snack")

R("somax-sn-orange-coconut-cooler", "Somax Orange-Coconut Electrolyte Cooler", "snack", "beginner",
  ["endurance"], 2, 1,
  [I("oj", 250), I("coconut_water", 250), I("salt", 0.5, "salt (a small pinch)"), I("water", 100, "water or ice")],
  ["Shake everything together in a bottle with ice.", "Sip before and during long sessions."],
  "A homemade sports-drink alternative: ~33 g carbs plus a little sodium and potassium.",
  "Sip in the hour before, and during, sessions over 60-90 minutes or in the heat.",
  "use half the juice and top up with water", ["oj"],
  "Not a recovery meal on its own - add protein afterwards.", "game/race-day", ["budget"])

# ============================================================ RECOVERY SNACKS & DRINKS (within 30 min)
R("somax-sn-choc-banana-recovery-shake", "Somax Choc-Banana Recovery Shake", "snack", "beginner",
  ["muscle", "endurance"], 3, 1,
  [I("milk_skim", 300), I("banana", 120), I("cocoa", 8), I("whey", 20), I("honey", 10), I("water", 50, "ice")],
  ["Add milk first, then everything else, to the blender.", "Blend 30-45 seconds until smooth and frothy; drink straight away."],
  "Chocolate-milkshake taste with ~33 g protein and ~50 g carbs.",
  "Drink within 30 minutes after training - ticks refuel, repair and rehydrate in one glass.",
  "use half a banana and skip the honey", ["banana", "honey:0"],
  "Freeze peeled banana chunks for an extra-thick shake.", "recovery snack/drink")

R("somax-sn-mango-lime-vegan-smoothie", "Somax Mango-Lime Vegan Recovery Smoothie", "snack", "beginner",
  ["muscle", "endurance"], 3, 1,
  [I("soy_milk", 300), I("mango", 150), I("pea_protein", 25), I("oats", 20), I("lime", 10), I("water", 50, "ice")],
  ["Add soy milk first, then the rest, to the blender.", "Blend until thick and smooth; add a splash of water if too thick."],
  "A fully plant-based recovery smoothie with ~32 g protein.",
  "Within 30 minutes after training for vegan and dairy-free athletes.",
  "halve the mango and skip the oats", ["mango", "oats:0"],
  "Frozen mango cheeks are cheaper and blend thicker.", "recovery snack/drink")

R("somax-sn-strawberry-cheesecake-pot", "Somax Strawberry Cheesecake Recovery Pot", "snack", "beginner",
  ["muscle", "general-fitness"], 5, 1,
  [I("greek0", 200), I("ricotta", 50), I("strawberries", 100), I("wheat_bix", 15, "wheat breakfast biscuit (1), crushed"), I("honey", 15)],
  ["Whisk yoghurt, ricotta and half the honey until smooth.", "Layer in a jar with sliced strawberries.",
   "Top with crushed wheat biscuit and the remaining honey."],
  "Dessert-style recovery: ~29 g protein and ~37 g carbs.",
  "Within 30 minutes after an evening session, or as a pre-bed snack.",
  "skip the honey", ["honey:0"],
  "Make 2 at once; they keep 2 days (add the crumb just before eating).", "recovery snack/drink")

R("somax-sn-chicken-avo-recovery-roll", "Somax Chicken, Avo & Salad Recovery Roll", "snack", "beginner",
  ["muscle", "general-fitness"], 5, 1,
  [I("roll_wm", 80, "wholemeal roll (1)"), I("chicken_ckd", 80), I("avocado", 25), I("cos", 20), I("tomato", 50)],
  ["Split the roll and smash avocado on both sides.", "Fill with chicken, lettuce and sliced tomato; season with pepper."],
  "A sandwich-shop roll that does the recovery job - ~34 g protein.",
  "Within 30 minutes of finishing training when a proper meal is 2+ hours away.",
  "use half the roll", ["roll_wm"],
  "Use leftover roast chicken or a rinsed BBQ chook breast.", "recovery snack/drink")

R("somax-sn-sweet-chilli-tuna-rice-cup", "Somax Sweet-Chilli Tuna Rice Cup", "snack", "beginner",
  ["muscle", "endurance"], 3, 1,
  [I("rice_cooked", 125, "microwave rice (half a pouch)"), I("tuna", 95, "canned tuna (1 can, drained)"), I("corn", 40), I("greek0", 20), I("sweet_chilli", 10)],
  ["Heat the rice for 60 seconds.", "Stir yoghurt and sweet chilli together.", "Top rice with tuna, corn and the sauce."],
  "A 3-minute bag-friendly recovery snack: ~30 g protein, ~54 g carbs.",
  "Within 30 minutes after training, especially if you train again within 8 hours.",
  "use a quarter pouch of rice", ["rice_cooked"],
  "Keep a rice pouch and a can of tuna in your locker.", "recovery snack/drink", ["budget"])

R("somax-sn-bean-cheese-toastie", "Somax Baked Bean & Cheese Toastie", "snack", "beginner",
  ["muscle", "general-fitness"], 7, 1,
  [I("bread_wm", 70, "wholemeal bread (2 slices)"), I("baked_beans", 130, "baked beans (half a can)"), I("cheese_light", 20)],
  ["Fill bread with beans and cheese.", "Toast in a sandwich press 4-5 minutes until sealed and golden."],
  "The cheapest recovery snack in the cupboard - ~20 g protein, ~44 g carbs.",
  "Within 30-60 minutes after training, or as a quick lunch on light days.",
  "make it open-face on one slice", ["bread_wm"],
  "Let it rest a minute - the beans are lava-hot.", "recovery snack/drink", ["budget"])

R("somax-sn-vanilla-custard-berry-cup", "Somax Vanilla Custard & Berry Protein Cup", "snack", "beginner",
  ["muscle", "general-fitness"], 3, 1,
  [I("custard", 150), I("greek0", 100), I("whey", 10), I("raspberries", 80)],
  ["Stir the whey into the yoghurt until smooth.", "Layer with custard and raspberries."],
  "Tastes like dessert, recovers like a shake.",
  "Within 30 minutes after an evening session or as a pre-bed snack.",
  "halve the custard", ["custard"],
  "Use custard from the fridge aisle - no cooking needed.", "recovery snack/drink")

R("somax-sn-iced-coffee-protein-shake", "Somax Iced Coffee Protein Shake", "snack", "beginner",
  ["muscle", "strength"], 3, 1,
  [I("milk_skim", 300), I("whey", 25), I("coffee", 100), I("banana", 100), I("oats", 20), I("water", 50, "ice")],
  ["Add milk, cold brew and whey to the blender, then banana, oats and ice.", "Blend until frothy and pour over extra ice."],
  "Your coffee fix with ~36 g protein and ~48 g carbs.",
  "Morning lifters: 45-60 minutes before training for a caffeine and carb boost, or as recovery straight after.",
  "skip the oats and use half the banana", ["oats:0", "banana"],
  "Skip caffeine after 2 pm if it affects your sleep.", "recovery snack/drink")

R("somax-sn-vegan-choc-pb-shake", "Somax Vegan Choc-Peanut Recovery Shake", "snack", "beginner",
  ["muscle", "strength"], 3, 1,
  [I("soy_milk", 300), I("banana", 120), I("pea_protein", 25), I("pb", 15), I("cocoa", 5), I("dates", 20), I("water", 50, "ice")],
  ["Add soy milk first, then the remaining ingredients.", "Blend until completely smooth."],
  "A thick plant-based shake with ~35 g protein - tastes like a choc-peanut bar.",
  "Within 30 minutes after training for vegan athletes; also a good energy-dense extra for muscle gain.",
  "skip the dates and use half the banana", ["dates:0", "banana"],
  "Soak dates in hot water for 5 minutes if your blender is basic.", "recovery snack/drink")

R("somax-sn-big-mango-carb-shake", "Somax Big Mango-Banana Carb Shake", "snack", "beginner",
  ["endurance"], 3, 1,
  [I("milk_skim", 300), I("mango", 150), I("banana", 120), I("honey", 20), I("oats", 30)],
  ["Add milk first, then fruit, honey and oats.", "Blend until smooth - add ice for a colder, thicker shake."],
  "~95 g carbs in a glass for when you can't face more food.",
  "Carb-loading days, or within 30 minutes after a long session when you train again tomorrow.",
  "halve the mango and skip the honey", ["mango", "honey:0"],
  "Add 20 g whey if you need it to double as recovery protein.", "endurance carb meal")

# ============================================================ RECOVERY MEALS (1-2 h after)
R("somax-sn-kangaroo-sweet-potato-mash", "Somax Kangaroo with Sweet Potato Mash & Charred Greens", "dinner", "intermediate",
  ["muscle", "strength"], 25, 1,
  [I("roo", 150), I("sweet_potato", 250), I("broccoli", 120), I("olive_oil", 5), I("garlic", 5), I("milk_skim", 30)],
  ["Boil sweet potato chunks 12 minutes; mash with milk, salt and pepper.", "Rub kangaroo with half the oil; sear 2-3 minutes each side (keep it medium-rare) and rest 5 minutes.",
   "Char broccolini with garlic and the remaining oil.", "Slice kangaroo over mash and greens."],
  "Lean, iron-rich Aussie red meat with ~40 g protein and under 10 g fat.",
  "Dinner 1-2 hours after training - especially good for female athletes watching iron.",
  "halve the sweet potato", ["sweet_potato"],
  "Kangaroo is very lean - don't cook past medium or it toughens.", "recovery meal")

R("somax-sn-ginger-beef-hokkien", "Somax Ginger Beef & Hokkien Noodle Toss", "dinner", "beginner",
  ["muscle", "strength"], 15, 1,
  [I("beef_rump", 130), I("hokkien", 200), I("stirfry_veg", 150), I("soy_sauce", 15), I("honey", 10),
   I("ginger", 8), I("garlic", 5), I("sesame_oil", 3)],
  ["Slice beef thinly across the grain.", "Sear beef in a hot wok with sesame oil for 2 minutes; remove.",
   "Stir-fry veg with ginger and garlic for 3 minutes; add noodles loosened with hot water.", "Return beef, add soy and honey and toss for 1 minute."],
  "Takeaway-style noodles with ~41 g protein and ~85 g carbs.",
  "A recovery dinner within 1-2 hours of training.",
  "halve the noodles", ["hokkien"],
  "Freeze the steak for 20 minutes - it slices paper-thin.", "recovery meal", ["budget"])

R("somax-sn-moroccan-chicken-couscous", "Somax Moroccan-Spiced Chicken & Chickpea Couscous", "dinner", "intermediate",
  ["muscle", "endurance"], 25, 1,
  [I("chicken", 130), I("couscous", 75), I("chickpeas", 80), I("zucchini", 100), I("capsicum", 80),
   I("olive_oil", 5), I("lemon", 15), I("herbs", 10, "parsley & mint"), I("spices", 3, "cumin, paprika & cinnamon")],
  ["Rub chicken with the spices and half the oil; pan-cook 5-6 minutes each side.", "Pour boiling water over couscous (1:1), cover 5 minutes, fluff.",
   "Char diced zucchini and capsicum, toss through couscous with chickpeas, lemon and herbs.", "Top with sliced chicken."],
  "Warm-spiced, colourful and ~45 g protein.",
  "Recovery dinner 1-2 hours after training; leftovers are a great next-day lunch.",
  "halve the couscous", ["couscous"],
  "Couscous is ready in 5 minutes - the fastest carb in the pantry.", "recovery meal")

R("somax-sn-salmon-poke-bowl", "Somax Salmon & Edamame Poke Bowl", "lunch", "intermediate",
  ["muscle", "general-fitness"], 25, 1,
  [I("salmon_sash", 110), I("rice_sushi", 80), I("edamame", 60), I("cucumber", 60), I("carrot", 40),
   I("tamari", 10), I("lime", 10), I("nori", 2, "nori (shredded)")],
  ["Cook and cool the sushi rice; season with a little rice vinegar if you like.", "Cube salmon and toss with tamari and lime.",
   "Arrange rice, salmon, edamame, cucumber and carrot in a bowl; top with nori."],
  "Fresh, gluten-free and full of omega-3s.",
  "A recovery lunch 1-2 hours after training, or 3+ hours before an afternoon session.",
  "halve the rice", ["rice_sushi"],
  "Use cooked salmon or canned salmon if you can't get sashimi-grade.", "recovery meal")

R("somax-sn-lamb-souvlaki-plate", "Somax Lamb Souvlaki Plate with Tzatziki", "dinner", "intermediate",
  ["muscle", "strength"], 25, 1,
  [I("lamb", 130), I("pita", 80, "pita bread (1 round)"), I("greek0", 70), I("cucumber", 50), I("tomato", 80),
   I("cos", 30), I("red_onion", 20), I("lemon", 10), I("herbs", 5, "oregano & mint"), I("garlic", 3)],
  ["Cube lamb, toss with lemon, oregano and garlic; thread onto skewers.", "Grill 8-10 minutes, turning.",
   "Grate cucumber into the yoghurt with mint for a quick tzatziki.", "Serve with warm pita, tomato, lettuce and onion."],
  "Greek takeaway done lean: ~41 g protein and lots of flavour.",
  "Recovery dinner 1-2 hours after training.",
  "use half a pita", ["pita"],
  "Soak wooden skewers 10 minutes so they don't burn.", "recovery meal")

R("somax-sn-chicken-larb-rice-bowl", "Somax Chicken Larb Rice Bowl", "dinner", "intermediate",
  ["fat-loss", "muscle"], 20, 1,
  [I("chicken_mince", 150), I("rice_white", 70), I("cos", 60), I("cucumber", 60), I("red_onion", 20),
   I("herbs", 15, "mint & coriander"), I("lime", 20), I("fish_sauce", 10), I("chilli", 5)],
  ["Cook the rice.", "Cook chicken mince in a dry non-stick pan, breaking it up, 6-7 minutes.",
   "Off the heat stir in lime, fish sauce, chilli, red onion and herbs.", "Serve over rice with lettuce and cucumber."],
  "Hot-sour-fresh Thai flavours with ~38 g protein and almost no added fat.",
  "Recovery dinner 1-2 hours after training; easily scaled down for fat-loss days.",
  "halve the rice", ["rice_white"],
  "Spoon the larb into lettuce cups for a lower-carb serve.", "recovery meal")

R("somax-sn-pork-apple-slaw-potatoes", "Somax Pork Fillet, Apple Slaw & Crushed Potatoes", "dinner", "intermediate",
  ["muscle", "general-fitness"], 30, 1,
  [I("pork", 150), I("potato", 250), I("slaw", 100), I("apple", 80), I("greek0", 40), I("lemon", 10), I("olive_oil", 5), I("herbs", 5, "sage or thyme")],
  ["Boil potatoes 15 minutes, drain and lightly crush.", "Season pork with herbs; sear in the oil then roast at 200C for 12-15 minutes. Rest 5 minutes.",
   "Toss slaw and matchstick apple with yoghurt and lemon.", "Slice pork and serve with potatoes and slaw."],
  "Pork and apple, lightened up - ~40 g protein, gluten-free.",
  "Recovery dinner 1-2 hours after training.",
  "halve the potatoes", ["potato"],
  "Pork fillet is one of the leanest cuts - cook to just blush pink.", "recovery meal")

R("somax-sn-barra-mango-tacos", "Somax Barramundi Tacos with Mango Salsa", "dinner", "intermediate",
  ["fat-loss", "general-fitness"], 20, 1,
  [I("white_fish", 150), I("corn_tort", 75, "corn tortillas (3 small)"), I("mango", 80), I("cabbage", 60), I("greek0", 40),
   I("lime", 15), I("herbs", 5, "coriander"), I("chilli", 3), I("spices", 1, "smoked paprika")],
  ["Dust fish with paprika and cook in a sprayed pan 3 minutes each side.", "Dice mango with chilli, coriander and half the lime.",
   "Mix yoghurt with remaining lime.", "Warm tortillas and fill with cabbage, flaked fish, salsa and lime yoghurt."],
  "Taco night that's gluten-free and around 400 kcal.",
  "Recovery dinner 1-2 hours after training - light enough for fat-loss phases.",
  "use 2 tortillas", ["corn_tort"],
  "Check the tortilla label says 100% corn for gluten-free.", "lighter fat-loss meal")

R("somax-sn-tempeh-satay-bowl", "Somax Tempeh Satay Brown Rice Bowl", "dinner", "intermediate",
  ["muscle", "general-fitness"], 30, 1,
  [I("tempeh", 100), I("rice_brown", 75), I("broccoli", 100), I("carrot", 60), I("pb", 12),
   I("soy_sauce", 10), I("lime", 10), I("maple", 5), I("water", 30)],
  ["Cook the brown rice.", "Slice tempeh and pan-fry in a sprayed pan until golden.",
   "Whisk peanut butter, soy, lime, maple and warm water into a satay sauce.", "Steam broccoli and carrot; assemble and pour over the sauce."],
  "Nutty plant-protein bowl with a 2-minute satay.",
  "Vegan recovery dinner 1-2 hours after training.",
  "halve the rice", ["rice_brown"],
  "Steam tempeh for 5 minutes first to soften its bitterness.", "recovery meal")

R("somax-sn-miso-salmon-udon", "Somax Miso Salmon & Udon Broth Bowl", "dinner", "intermediate",
  ["endurance", "muscle"], 20, 1,
  [I("salmon", 120), I("udon", 200), I("bok_choy", 100), I("miso", 15), I("spring_onion", 10), I("ginger", 5), I("water", 400)],
  ["Bake or pan-cook salmon 8-10 minutes.", "Simmer water with ginger; whisk in miso off the boil.",
   "Add udon and bok choy for 2 minutes.", "Ladle into a bowl, top with flaked salmon and spring onion."],
  "A warming broth bowl - fluid, sodium, carbs and protein in one.",
  "Recovery dinner after cold or wet sessions; the broth helps you rehydrate.",
  "halve the udon", ["udon"],
  "Never boil miso - it dulls the flavour.", "recovery meal")

R("somax-sn-roo-bean-chilli", "Somax Kangaroo & Three-Bean Chilli (batch)", "dinner", "intermediate",
  ["muscle", "fat-loss"], 45, 4,
  [I("roo_mince", 500), I("kidney", 240), I("black_beans", 240), I("cannellini", 160), I("tin_tom", 800, "canned diced tomatoes (2 cans)"),
   I("onion", 150), I("capsicum", 150), I("olive_oil", 10), I("spices", 10, "cumin, smoked paprika, chilli & oregano"), I("rice_white", 280)],
  ["Soften onion and capsicum in the oil; add spices for 1 minute.", "Brown kangaroo mince.",
   "Add tomatoes and beans; simmer 25 minutes until thick.", "Cook rice and serve 1 cup chilli over each portion."],
  "Lean, fibre-rich chilli that freezes brilliantly - ~46 g protein a serve.",
  "Recovery dinner 1-2 hours after training; freeze portions for the week.",
  "halve the rice (or skip it)", ["rice_white"],
  "Freezes for 3 months - label with date and portion.", "overnight/batch-prep", ["batch", "budget"])

R("somax-sn-gochujang-beef-rice-bowls", "Somax Gochujang Beef Mince Rice Bowls (batch)", "dinner", "intermediate",
  ["muscle", "strength"], 30, 4,
  [I("beef_mince", 500), I("rice_white", 320), I("carrot", 200), I("zucchini", 200), I("spinach", 120),
   I("gochujang", 40), I("soy_sauce", 20), I("honey", 15), I("sesame_oil", 5), I("garlic", 10), I("egg", 200, "eggs (4, to top)")],
  ["Cook the rice.", "Brown the mince with garlic; stir in gochujang, soy and honey and cook until sticky.",
   "Stir-fry or steam julienned carrot and zucchini; wilt spinach.", "Divide rice, veg and beef into 4 containers; top each with a fried or boiled egg."],
  "Bibimbap-inspired meal prep - ~43 g protein and big flavour.",
  "Recovery dinner or lunch 1-2 hours after training; 4 meals in 30 minutes.",
  "halve the rice", ["rice_white"],
  "Keeps 3 days in the fridge; add the egg fresh if you can.", "overnight/batch-prep", ["batch"])

R("somax-sn-smoky-chicken-one-pan-rice", "Somax Smoky Chicken One-Pan Rice (batch)", "dinner", "beginner",
  ["endurance", "muscle"], 40, 4,
  [I("chicken_thigh", 500), I("rice_white", 300), I("mixed_veg", 400), I("stock_chicken", 750), I("onion", 150),
   I("tin_tom", 200), I("olive_oil", 10), I("spices", 6, "smoked paprika & garlic powder")],
  ["Brown chicken pieces in the oil with paprika; remove.", "Soften onion, stir in rice to coat.",
   "Add stock and tomatoes, nestle chicken back in, cover and simmer 18 minutes.", "Stir through frozen veg, cover 5 minutes more."],
  "One pan, four dinners, under $5 a serve.",
  "Recovery dinner 1-2 hours after training; also great the night before a long session.",
  "halve the rice", ["rice_white"],
  "Thigh is cheaper and stays juicy on reheating.", "recovery meal", ["batch", "budget"])

R("somax-sn-aussie-recovery-burger", "Somax Post-Game Aussie Beetroot Burger & Wedges", "dinner", "beginner",
  ["muscle", "strength"], 20, 1,
  [I("beef_mince", 140), I("bun_white", 70, "burger bun (1)"), I("beetroot", 40), I("cheese_light", 15),
   I("cos", 20), I("tomato", 50), I("red_onion", 15), I("bbq_sauce", 15), I("potato", 150, "potato wedges (oven-baked)"), I("olive_oil", 3)],
  ["Toss potato wedges with oil and bake at 220C for 25 minutes.", "Shape mince into a thin patty; grill 3-4 minutes each side, add cheese at the end.",
   "Toast bun and stack lettuce, tomato, beetroot, onion, patty and BBQ sauce."],
  "Proper burger and wedges after a game - ~40 g protein, reasonable fat.",
  "Post-game dinner 1-2 hours after the final siren.",
  "skip the wedges", ["potato:0", "olive_oil:0"],
  "Beetroot makes it Aussie - and adds carbs and colour.", "game/race-day")

# ============================================================ ENDURANCE CARB MEALS
R("somax-sn-creamy-tomato-chicken-rigatoni", "Somax Creamy Tomato Chicken Rigatoni", "dinner", "beginner",
  ["endurance"], 20, 1,
  [I("pasta", 150), I("chicken", 110), I("passata", 200), I("ricotta", 50), I("spinach", 40), I("garlic", 5), I("herbs", 5, "basil")],
  ["Cook pasta.", "Cook diced chicken in a sprayed pan, add garlic then passata; simmer 5 minutes.",
   "Stir ricotta through for creaminess; add spinach to wilt.", "Toss with pasta and basil."],
  "~125 g carbs with only ~10 g fat - built for carb loading.",
  "The night before a race or long session, or 3-4 hours before a game.",
  "halve the pasta", ["pasta"],
  "For carb loading eat this alongside extra carb snacks - not extra fat.", "endurance carb meal")

R("somax-sn-chicken-udon-soup", "Somax Race-Eve Chicken Udon Soup", "dinner", "beginner",
  ["endurance"], 20, 1,
  [I("chicken", 120), I("udon", 300), I("carrot", 60), I("bok_choy", 80), I("stock_chicken", 400), I("ginger", 5), I("soy_sauce", 10)],
  ["Simmer stock with ginger; poach chicken in it for 12 minutes, then shred.", "Add carrot ribbons and udon for 3 minutes, then bok choy for 1.",
   "Return chicken, season with soy."],
  "Brothy, salty and gentle on the gut - easy carbs the night before.",
  "Race eve dinner or 3 hours before an evening event.",
  "use half the udon", ["udon"],
  "The salty broth helps top up sodium before a hot race.", "endurance carb meal")

R("somax-sn-honey-garlic-chicken-double-rice", "Somax Honey-Garlic Chicken & Double Rice", "dinner", "beginner",
  ["endurance"], 25, 1,
  [I("chicken", 120), I("rice_white", 150), I("soy_sauce", 15), I("honey", 25), I("garlic", 6), I("ginger", 4), I("green_beans", 80)],
  ["Cook the rice.", "Pan-cook sliced chicken until golden.", "Add garlic, ginger, soy and honey; bubble until glossy.",
   "Steam green beans and serve everything over a big bed of rice."],
  "A deliberate carb-load plate: ~145 g carbs and only ~4 g fat.",
  "Carb-loading days 1-2 days before a marathon, triathlon or long race.",
  "halve the rice and honey (an everyday serve)", ["rice_white", "honey"],
  "Low fat and low fibre on purpose - stick to familiar food before race day.", "endurance carb meal")

R("somax-sn-gf-beef-pho-bowl", "Somax Gluten-Free Beef Pho-Style Noodle Bowl", "dinner", "advanced",
  ["endurance", "general-fitness"], 25, 1,
  [I("beef_rump", 120), I("rice_noodle", 100), I("stock_beef_gf", 500), I("sprouts", 50), I("bok_choy", 60),
   I("tamari", 10), I("lime", 10), I("herbs", 10, "Thai basil & coriander"), I("ginger", 5), I("spices", 1, "star anise & cinnamon stick")],
  ["Simmer stock with ginger, star anise and cinnamon for 15 minutes; season with tamari.", "Cook noodles and place in a deep bowl.",
   "Slice beef paper-thin and lay raw over noodles with bok choy and sprouts.", "Pour boiling broth over to cook the beef; finish with herbs and lime."],
  "Aromatic, hydrating and gluten-free with ~110 g carbs.",
  "Endurance athletes: dinner the night before a long session, or a recovery meal after one.",
  "halve the noodles", ["rice_noodle"],
  "The broth cooks the beef - slice it as thin as you can.", "endurance carb meal")

R("somax-sn-jacket-potato-chilli-beans", "Somax Jacket Potato with Chilli Beans", "lunch", "beginner",
  ["general-fitness", "muscle"], 15, 1,
  [I("potato", 350, "large potato (1)"), I("kidney", 120), I("salsa", 60), I("greek0", 80), I("cheese_light", 15), I("spring_onion", 10)],
  ["Prick potato and microwave 8-10 minutes until soft (or bake 1 hour).", "Warm beans with the salsa.",
   "Split the potato, pile on beans, yoghurt, cheese and spring onion."],
  "Filling vegetarian comfort food for a few dollars.",
  "Lunch or dinner 3-4 hours before training, or recovery 1-2 hours after.",
  "use a medium potato (half)", ["potato"],
  "Greek yoghurt is a high-protein stand-in for sour cream.", "pre-training meal", ["budget"])

R("somax-sn-penne-pesto-chicken-salad", "Somax Pesto Chicken Pasta Salad", "lunch", "beginner",
  ["muscle", "endurance"], 15, 1,
  [I("pasta", 100), I("chicken_ckd", 120), I("pesto", 20), I("cherry_tom", 100), I("spinach", 30), I("lemon", 10)],
  ["Cook pasta and rinse under cold water.", "Toss with pesto and lemon juice.",
   "Fold through chicken, halved tomatoes and spinach."],
  "A lunchbox pasta salad with ~50 g protein.",
  "Lunch 3-4 hours before afternoon training, or a muscle-gain lunch on any day.",
  "halve the pasta", ["pasta"],
  "Make 3 for the week - keeps 3 days.", "pre-training meal", ["batch"])

# ============================================================ LIGHTER / FAT-LOSS-FRIENDLY ATHLETE MEALS
R("somax-sn-chicken-rice-paper-rolls", "Somax Chicken Rice Paper Rolls with Lime Dip", "lunch", "intermediate",
  ["fat-loss", "general-fitness"], 20, 1,
  [I("rice_paper", 36, "rice paper sheets (4)"), I("chicken_ckd", 100), I("vermicelli", 25), I("cucumber", 50), I("carrot", 50),
   I("cos", 30), I("herbs", 10, "mint"), I("tamari", 10), I("lime", 15)],
  ["Soak vermicelli in boiling water 4 minutes; drain.", "Dip one rice paper sheet in warm water for a few seconds.",
   "Fill with lettuce, noodles, chicken, cucumber, carrot and mint; fold and roll tightly.", "Mix tamari and lime for dipping."],
  "Fresh, crunchy and gluten-free - ~37 g protein for under 400 kcal.",
  "A light lunch 2-3 hours before training, or a fat-loss-day recovery meal.",
  "skip the vermicelli", ["vermicelli:0"],
  "Cover rolls with a damp paper towel so they don't dry out.", "lighter fat-loss meal")

R("somax-sn-prawn-mango-salad-cups", "Somax Chilli-Lime Prawn & Mango Lettuce Cups", "lunch", "intermediate",
  ["fat-loss"], 15, 1,
  [I("prawns", 180), I("mango", 100), I("cos", 80), I("cucumber", 60), I("avocado", 30), I("lime", 15), I("chilli", 5), I("herbs", 5, "coriander")],
  ["Cook prawns in a hot sprayed pan 2 minutes each side.", "Dice mango, cucumber and avocado; toss with lime, chilli and coriander.",
   "Spoon prawns and salsa into lettuce cups."],
  "Bright and summery, ~35 g protein for ~300 kcal.",
  "Fat-loss phases: lunch on rest or skill days, or 1-2 hours after light training.",
  "skip the mango", ["mango:0"],
  "On a hard training day add 1 cup cooked rice.", "lighter fat-loss meal")

R("somax-sn-greens-feta-egg-bake", "Somax Greens & Feta Egg Bake (batch)", "breakfast", "beginner",
  ["fat-loss", "muscle"], 35, 4,
  [I("egg", 400, "eggs (8 large)"), I("egg_white", 300), I("spinach", 120), I("zucchini", 200), I("cherry_tom", 200),
   I("feta", 80), I("spring_onion", 20)],
  ["Heat oven to 180C and line a baking dish.", "Grate zucchini and squeeze out the moisture.",
   "Whisk eggs and whites; stir in zucchini, spinach, spring onion and crumbled feta.", "Pour into dish, dot with halved tomatoes and bake 25 minutes. Cut into 4."],
  "Grab-and-go egg slices: ~25 g protein and ~4 g carbs each.",
  "Fat-loss and rest days: breakfast or lunch, or add toast 2-3 hours before training.",
  "already light - pair with 1 slice of toast on training days", [],
  "Keeps 4 days; reheat 40 seconds or eat cold.", "overnight/batch-prep", ["batch"])

R("somax-sn-lemony-fish-greens-potatoes", "Somax Lemony Fish, Greens & Baby Potatoes", "dinner", "beginner",
  ["fat-loss", "general-fitness"], 25, 1,
  [I("white_fish", 170), I("potato", 200, "baby potatoes"), I("green_beans", 100), I("broccoli", 100),
   I("lemon", 15), I("olive_oil", 5), I("capers", 10), I("herbs", 5, "dill or parsley")],
  ["Boil potatoes 15 minutes; add beans and broccoli for the last 3.", "Pan-cook fish in the oil 3 minutes each side.",
   "Finish with lemon, capers and herbs."],
  "A clean, simple plate: ~40 g protein, under 400 kcal.",
  "A fat-loss-friendly dinner 1-2 hours after training, or on rest days.",
  "halve the potatoes", ["potato"],
  "Frozen fish fillets are cheaper and cook from frozen in 8-10 minutes.", "lighter fat-loss meal")

R("somax-sn-turkey-lettuce-cups", "Somax Ginger Turkey Lettuce Cups", "dinner", "beginner",
  ["fat-loss", "muscle"], 20, 1,
  [I("turkey_mince", 140), I("rice_brown", 40), I("carrot", 50), I("capsicum", 60), I("cos", 80),
   I("tamari", 12), I("ginger", 5), I("garlic", 5), I("spring_onion", 10)],
  ["Cook the brown rice.", "Cook mince with ginger and garlic in a non-stick pan, breaking it up.",
   "Add diced carrot and capsicum for 3 minutes; season with tamari.", "Spoon rice and mince into lettuce cups; top with spring onion."],
  "Crunchy, savoury and gluten-free - ~34 g protein.",
  "Fat-loss phases: dinner on lighter training days, 1-2 hours after the session.",
  "skip the rice", ["rice_brown:0"],
  "Double the mince and freeze half for another night.", "lighter fat-loss meal")

R("somax-sn-greek-chicken-salad-bowl", "Somax Greek Chicken & Chickpea Salad Bowl", "lunch", "beginner",
  ["fat-loss", "muscle"], 15, 1,
  [I("chicken_ckd", 110), I("chickpeas", 100), I("cucumber", 80), I("cherry_tom", 100), I("red_onion", 20),
   I("feta", 25), I("cos", 50), I("lemon", 15), I("olive_oil", 5), I("herbs", 3, "oregano")],
  ["Chop the salad veg.", "Toss with chickpeas, lemon, oil and oregano.", "Top with sliced chicken and crumbled feta."],
  "A big crunchy bowl with ~48 g protein and fibre that keeps you full.",
  "Fat-loss lunch on rest days or 3+ hours before training.",
  "halve the chickpeas", ["chickpeas"],
  "Pack dressing separately to keep it crisp until lunch.", "lighter fat-loss meal")

R("somax-sn-steak-rocket-pumpkin-salad", "Somax Steak, Roast Pumpkin & Rocket Salad", "dinner", "beginner",
  ["fat-loss", "strength"], 30, 1,
  [I("beef_rump", 150), I("pumpkin", 200), I("rocket", 50), I("cherry_tom", 80), I("parmesan", 10), I("balsamic", 10), I("olive_oil", 5)],
  ["Roast pumpkin wedges at 200C for 25 minutes.", "Sear steak 3 minutes each side; rest 5 minutes and slice.",
   "Toss rocket and tomatoes with balsamic; top with pumpkin, steak and shaved parmesan."],
  "Pub-salad flavour with ~39 g protein and ~25 g carbs.",
  "Fat-loss dinners on rest or skill days.",
  "halve the pumpkin", ["pumpkin"],
  "Add a small potato on heavy training days.", "lighter fat-loss meal")

R("somax-sn-lemongrass-tofu-noodle-soup", "Somax Lemongrass Tofu & Rice Noodle Soup", "dinner", "intermediate",
  ["fat-loss", "general-fitness"], 25, 1,
  [I("tofu", 150), I("rice_noodle", 50), I("stock_veg_gf", 500), I("bok_choy", 100), I("mushrooms", 80), I("snow_peas", 50),
   I("tamari", 10), I("lime", 10), I("ginger", 5), I("herbs", 10, "lemongrass, coriander & chilli")],
  ["Simmer stock with bruised lemongrass and ginger for 10 minutes.", "Add mushrooms and cubed tofu for 5 minutes.",
   "Add noodles, bok choy and snow peas for 3 minutes.", "Season with tamari and lime; top with coriander."],
  "A light, fragrant, fully vegan and gluten-free soup.",
  "Lighter dinners on rest days or fat-loss phases; good 1-2 hours after evening training.",
  "skip the noodles", ["rice_noodle:0"],
  "Check the stock label says gluten-free and vegan.", "lighter fat-loss meal")

R("somax-sn-roo-zucchini-noodle-bolognese", "Somax Kangaroo Bolognese with Zucchini & Spaghetti", "dinner", "intermediate",
  ["fat-loss", "muscle"], 30, 1,
  [I("roo_mince", 150), I("pasta", 50), I("zucchini", 150, "zucchini (spiralised)"), I("passata", 200), I("onion", 50),
   I("carrot", 50), I("mushrooms", 60), I("olive_oil", 4), I("garlic", 5), I("herbs", 3, "basil & oregano")],
  ["Soften onion, carrot and mushrooms in the oil; add garlic.", "Brown the mince, add passata and herbs; simmer 15 minutes.",
   "Cook spaghetti; add zucchini noodles to the pot for the last 30 seconds.", "Drain and top with the bolognese."],
  "Half pasta, half zucchini: a full bowl at ~440 kcal and ~40 g protein.",
  "Fat-loss dinner 1-2 hours after training.",
  "skip the spaghetti (all zucchini)", ["pasta:0"],
  "Kangaroo is ~2% fat - the leanest red mince you can buy.", "lighter fat-loss meal")

# ============================================================ BUDGET / VEGAN / VEGETARIAN
R("somax-sn-chickpea-spinach-curry", "Somax Chickpea & Spinach Tomato Curry", "dinner", "beginner",
  ["general-fitness", "endurance"], 25, 2,
  [I("chickpeas", 400, "canned chickpeas (2 cans, drained)"), I("tin_tom", 400), I("spinach", 120), I("onion", 100),
   I("coconut_milk", 100), I("curry_powder", 10), I("garlic", 10), I("ginger", 10), I("rice_white", 140)],
  ["Cook the rice.", "Soften onion in a splash of water, add garlic, ginger and curry powder for 1 minute.",
   "Add tomatoes, chickpeas and coconut milk; simmer 15 minutes.", "Stir through spinach and serve over rice."],
  "A cheap, vegan and gluten-free curry that's ready in 25 minutes.",
  "Dinner 3-4 hours before training, or a recovery dinner 1-2 hours after (pair with a glass of soy milk to boost protein).",
  "halve the rice", ["rice_white"],
  "Doubles easily and freezes well.", "recovery meal", ["budget", "batch"])

R("somax-sn-black-bean-sweet-potato-tacos", "Somax Black Bean & Sweet Potato Tacos", "dinner", "beginner",
  ["general-fitness", "endurance"], 30, 1,
  [I("corn_tort", 75, "corn tortillas (3 small)"), I("black_beans", 130), I("sweet_potato", 150), I("avocado", 40),
   I("cabbage", 50), I("cherry_tom", 60), I("lime", 15), I("spices", 2, "cumin & smoked paprika"), I("olive_oil", 3)],
  ["Toss diced sweet potato with oil and spices; roast at 210C for 20 minutes.", "Warm and lightly mash the beans with lime.",
   "Fill tortillas with beans, sweet potato, cabbage, tomato and avocado."],
  "Colourful vegan, gluten-free tacos.",
  "Dinner 3-4 hours before training or recovery 1-2 hours after; add a soy milk smoothie for extra protein.",
  "use 2 tortillas and half the sweet potato", ["corn_tort", "sweet_potato"],
  "Swap black beans for kidney beans - whatever's in the cupboard.", "recovery meal", ["budget"])

R("somax-sn-chickpea-smash-sandwich", "Somax Lemon-Tahini Chickpea Smash Sandwich", "lunch", "beginner",
  ["general-fitness"], 10, 1,
  [I("bread_wm", 80, "wholemeal bread (2 thick slices)"), I("chickpeas", 120), I("tahini", 10), I("lemon", 10),
   I("cucumber", 40), I("rocket", 20), I("spring_onion", 10)],
  ["Mash chickpeas with tahini, lemon, spring onion, salt and pepper.", "Spread thickly on bread; top with cucumber and rocket."],
  "A vegan lunch that's cheaper than a café sandwich.",
  "Lunch 3-4 hours before training.",
  "make it open-face on one slice", ["bread_wm"],
  "The mash keeps 3 days in the fridge.", "pre-training meal", ["budget"])

R("somax-sn-peanut-lime-noodles-edamame", "Somax Peanut-Lime Noodles with Edamame", "dinner", "beginner",
  ["general-fitness", "endurance"], 15, 1,
  [I("wheat_noodle", 80), I("edamame", 100), I("carrot", 60), I("cabbage", 80), I("pb", 20), I("soy_sauce", 10),
   I("lime", 15), I("maple", 5), I("water", 30)],
  ["Cook noodles; add edamame for the last 2 minutes.", "Whisk peanut butter, soy, lime, maple and hot water.",
   "Toss noodles and edamame with shredded carrot and cabbage and the sauce."],
  "Slurpy vegan noodles with ~28 g plant protein.",
  "Dinner 3-4 hours before training, or recovery 1-2 hours after.",
  "halve the noodles", ["wheat_noodle"],
  "Eat warm or cold - it's a great lunchbox too.", "recovery meal")

R("somax-sn-lentil-sweet-potato-tagine", "Somax Lentil & Sweet Potato Tagine with Couscous (batch)", "dinner", "intermediate",
  ["general-fitness", "endurance"], 45, 4,
  [I("lentils", 800, "canned brown lentils (2 x 400 g cans, drained)"), I("sweet_potato", 600), I("tin_tom", 400), I("onion", 150),
   I("carrot", 150), I("stock_veg", 400), I("apricot_dry", 60), I("olive_oil", 10), I("spices", 8, "cumin, coriander, cinnamon & paprika"), I("couscous", 240)],
  ["Soften onion and carrot in the oil; add spices.", "Add sweet potato, tomatoes, stock and chopped apricots; simmer 20 minutes.",
   "Stir in lentils for 5 minutes.", "Serve each portion with couscous (made with boiling water)."],
  "Sweet-spiced vegan stew that feeds four for very little.",
  "Dinner 3-4 hours before training, or the night before a long session; freeze extras.",
  "halve the couscous", ["couscous"],
  "Add a dollop of Greek yoghurt if you're not vegan.", "overnight/batch-prep", ["batch", "budget"])

R("somax-sn-red-lentil-mushroom-ragu", "Somax Red Lentil & Mushroom Ragu (batch)", "dinner", "beginner",
  ["general-fitness", "endurance"], 40, 4,
  [I("red_lentils", 200), I("mushrooms", 300), I("tin_tom", 800), I("onion", 150), I("carrot", 150), I("zucchini", 150),
   I("olive_oil", 10), I("garlic", 10), I("herbs", 5, "oregano & basil"), I("pasta", 360)],
  ["Soften onion, carrot and garlic in the oil; add finely chopped mushrooms and cook down 8 minutes.", "Add rinsed lentils, tomatoes, grated zucchini and 300 ml water; simmer 20 minutes.",
   "Cook pasta and serve topped with the ragu."],
  "Meaty-tasting plant ragu - ~30 g protein a serve.",
  "Dinner the night before a long session or 3-4 hours before an evening game.",
  "halve the pasta", ["pasta"],
  "Vegan as written - add parmesan or a vegetarian-rennet hard cheese if you eat dairy.", "endurance carb meal", ["batch", "budget"])

# ============================================================ GAME-DAY
R("somax-sn-tournament-fuel-box", "Somax Tournament-Day Fuel Box", "snack", "beginner",
  ["endurance", "general-fitness"], 5, 1,
  [I("rice_cracker", 25), I("banana", 120), I("cheese_light", 20, "light cheese stick"), I("sultanas", 20), I("greek0", 100, "Greek yoghurt pouch")],
  ["Pack everything into a container (keep the yoghurt pouch cold).", "Graze across the day between games."],
  "A grazing box that keeps carbs and protein ticking over across a long day.",
  "Tournament or carnival days: eat across the gaps between games, starting 1 hour before your first.",
  "skip the sultanas and eat half the banana", ["sultanas:0", "banana"],
  "Freeze the yoghurt pouch - it doubles as an ice brick.", "game/race-day")

R("somax-sn-between-heats-sushi", "Somax Between-Heats Tuna Sushi Rolls", "snack", "advanced",
  ["endurance", "general-fitness"], 30, 1,
  [I("rice_sushi", 80), I("tuna", 95, "canned tuna (1 can, drained)"), I("nori", 6, "nori sheets (2)"), I("cucumber", 40),
   I("avocado", 20), I("tamari", 10)],
  ["Cook sushi rice and cool to warm.", "Spread rice over nori, leaving a strip at the top.",
   "Lay tuna, cucumber and avocado along the bottom and roll tightly; slice.", "Pack with tamari to dip."],
  "Homemade sushi - low fat, easy carbs, ~33 g protein.",
  "Competition days: eat 1-2 hours before or between events; also a great school/work lunch.",
  "make one roll instead of two", ["rice_sushi"],
  "Use a bamboo mat or baking paper to roll.", "game/race-day")

R("somax-sn-pre-game-chicken-wrap", "Somax Pre-Game Chicken & Rice Wrap", "lunch", "beginner",
  ["endurance", "general-fitness"], 10, 1,
  [I("wrap_wm", 65, "wholemeal wrap (1 large)"), I("chicken_ckd", 90), I("rice_cooked", 100), I("cos", 30), I("carrot", 40), I("sweet_chilli", 15)],
  ["Warm the rice.", "Lay lettuce, rice, chicken and grated carrot along the wrap.", "Drizzle with sweet chilli and roll."],
  "Carbs from the wrap AND the rice, with little fat - pre-game friendly.",
  "Game days: eat 2-3 hours before warm-up.",
  "skip the rice", ["rice_cooked:0"],
  "Wrap in foil - it's fine in a kit bag for a few hours if kept cool.", "game/race-day")

# ============================================================ MUSCLE GAIN / BEFORE BED
R("somax-sn-cottage-berry-night-bowl", "Somax Cottage Cheese & Berry Night Bowl", "snack", "beginner",
  ["muscle", "strength"], 3, 1,
  [I("cottage", 200), I("greek0", 100), I("blueberries", 80), I("walnuts", 10), I("spices", 0.5, "cinnamon")],
  ["Stir cottage cheese and yoghurt together.", "Top with blueberries, walnuts and cinnamon."],
  "~37 g slow-digesting dairy protein before bed.",
  "Muscle-gain phases: 30-60 minutes before bed, especially after evening training.",
  "already light - skip the walnuts to trim further", [],
  "Blitz the cottage cheese if you don't like the texture.", "before bed")

R("somax-sn-homemade-mass-shake", "Somax Homemade Mass-Gainer Shake", "snack", "beginner",
  ["muscle", "strength"], 3, 1,
  [I("milk_full", 400), I("oats", 50), I("banana", 120), I("pb", 20), I("whey", 30), I("honey", 15)],
  ["Blitz oats to a powder first.", "Add everything else and blend until smooth."],
  "~900 kcal in a glass - easier than another meal when you're struggling to eat enough.",
  "Muscle-gain phases: between meals, or within 30 minutes after training.",
  "halve the oats and skip the honey", ["oats", "honey:0"],
  "Drink half after training and half before bed if it's too much at once.", "recovery snack/drink")

R("somax-sn-salmon-herb-ricotta-potatoes", "Somax Baked Salmon, Herb Ricotta & Baby Potatoes", "dinner", "intermediate",
  ["muscle", "general-fitness"], 30, 1,
  [I("salmon", 140), I("potato", 250, "baby potatoes"), I("ricotta", 50), I("lemon", 10), I("herbs", 5, "dill & chives"),
   I("green_beans", 100), I("spinach", 40)],
  ["Roast or boil potatoes until tender.", "Bake salmon at 200C for 10-12 minutes.",
   "Mix ricotta with lemon and herbs.", "Serve salmon over potatoes and greens with a spoon of herb ricotta."],
  "Omega-3-rich dinner with ~40 g protein.",
  "Dinner 1-2 hours after evening training - leaves room for a pre-bed snack in a gain phase.",
  "halve the potatoes", ["potato"],
  "Salmon is higher in fat - pair it with lower-fat breakfasts and snacks.", "recovery meal")

R("somax-sn-pb-yoghurt-apple-dip", "Somax PB Yoghurt Dip with Apple & Crackers", "snack", "beginner",
  ["muscle", "general-fitness"], 5, 1,
  [I("greek0", 150), I("pb", 15), I("honey", 5), I("apple", 150, "apple (1)"), I("rice_cracker", 20)],
  ["Swirl peanut butter and honey through the yoghurt.", "Slice apple and serve with crackers for dipping."],
  "Sweet-salty dip with ~22 g protein and ~45 g carbs.",
  "An afternoon snack 60-90 minutes before training, or a recovery snack after.",
  "skip the crackers", ["rice_cracker:0"],
  "Squeeze lemon on apple slices to stop browning in a lunchbox.", "pre-training snack")

R("somax-sn-roo-taco-sweet-potato-boats", "Somax Taco Kangaroo Sweet Potato Boats", "dinner", "intermediate",
  ["muscle", "fat-loss"], 35, 1,
  [I("sweet_potato", 300, "sweet potato (1 medium)"), I("roo_mince", 140), I("black_beans", 60), I("tin_tom", 100),
   I("greek0", 50), I("cheese_light", 15), I("spices", 3, "cumin, paprika & chilli")],
  ["Halve sweet potato and microwave 8 minutes (or roast 40 minutes) until soft.", "Brown mince with spices; add beans and tomatoes and simmer 8 minutes.",
   "Scoop a little flesh from each half, fill with mince, top with cheese and grill 3 minutes.", "Finish with yoghurt."],
  "Taco flavours in a sweet potato - gluten-free, ~45 g protein.",
  "Dinner 1-2 hours after training.",
  "use half the sweet potato", ["sweet_potato"],
  "Swap kangaroo for lean beef mince if it's easier to find.", "recovery meal")

R("somax-sn-overnight-bircher-protein-muesli", "Somax Overnight Apple & Sultana Protein Muesli", "breakfast", "beginner",
  ["endurance", "muscle"], 5, 1,
  [I("muesli", 60), I("milk_skim", 150), I("greek0", 120), I("apple", 100, "apple (grated)"), I("sultanas", 15), I("spices", 0.5, "cinnamon")],
  ["Grate the apple into a jar.", "Stir in muesli, milk, yoghurt, sultanas and cinnamon.", "Refrigerate overnight and stir before eating."],
  "Soaked muesli that's ready when you wake: ~25 g protein, ~70 g carbs.",
  "Early starters: 1-2 hours before a morning session, or after it on the go.",
  "halve the muesli and skip the sultanas", ["muesli", "sultanas:0"],
  "Grated apple keeps it fresh and sweet without added sugar.", "overnight/batch-prep", ["batch", "budget"])

R("somax-sn-chicken-pumpkin-quinoa-traybake", "Somax Harissa-Style Chicken & Pumpkin Quinoa Tray (batch)", "dinner", "advanced",
  ["muscle", "endurance"], 45, 4,
  [I("chicken", 600), I("pumpkin", 600), I("quinoa", 200), I("red_onion", 150), I("capsicum", 200), I("spinach", 120),
   I("olive_oil", 15), I("spices", 10, "smoked paprika, cumin, chilli & caraway"), I("lemon", 30), I("greek0", 120)],
  ["Toss pumpkin, onion and capsicum with half the oil and spices; roast at 210C for 15 minutes.", "Add chicken rubbed with remaining oil and spices; roast 20 minutes more.",
   "Simmer quinoa 15 minutes; stir through spinach and lemon.", "Divide into 4 containers with a spoon of yoghurt."],
  "A spice-roasted tray that makes 4 gluten-free recovery dinners.",
  "Recovery dinner 1-2 hours after training; meal-prep for the week.",
  "halve the quinoa", ["quinoa"],
  "Keeps 4 days in the fridge.", "overnight/batch-prep", ["batch"])

R("somax-sn-salmon-patties-greens", "Somax Salmon & Potato Patties with Lemon Yoghurt", "dinner", "intermediate",
  ["general-fitness", "muscle"], 35, 4,
  [I("potato", 600), I("spring_onion", 30), I("egg", 100, "eggs (2 large)"), I("herbs", 10, "dill & parsley"), I("lemon", 20),
   I("olive_oil", 15), I("greek0", 200), I("spinach", 120), I("cherry_tom", 200), I("salmon_can_f", 420, "canned pink salmon (2 x 210 g, drained)")],
  ["Boil and mash the potatoes; cool slightly.", "Mix mash with flaked salmon, egg, spring onion, herbs and half the lemon; shape 8 patties.",
   "Pan-fry in the oil 3-4 minutes each side.", "Serve 2 patties each with spinach, tomatoes and lemon yoghurt."],
  "A budget fish dinner from the pantry - freezes well.",
  "Recovery dinner 1-2 hours after training, or a cold next-day lunch.",
  "make the patties with half the potato", ["potato"],
  "Keep the soft salmon bones - they're a great source of calcium.", "overnight/batch-prep", ["batch", "budget"])

R("somax-sn-ricotta-berry-crumpet-stack", "Somax Ricotta, Honey & Berry Crumpet Stack", "breakfast", "beginner",
  ["general-fitness", "endurance"], 5, 1,
  [I("crumpet", 110, "crumpets (2)"), I("ricotta", 70), I("strawberries", 80), I("honey", 10), I("milk_skim", 200, "skim milk (as a latte or glass)")],
  ["Toast the crumpets.", "Spread with ricotta, top with sliced strawberries and drizzle honey.", "Have the milk alongside."],
  "A sweet, quick breakfast that's light on the stomach.",
  "Morning sessions: 60-90 minutes before training.",
  "one crumpet", ["crumpet"],
  "Light ricotta is creamy enough that you won't miss butter.", "pre-training meal")

R("somax-sn-cinnamon-egg-tortilla-rollups", "Somax Cinnamon Egg-Tortilla Roll-Ups", "breakfast", "beginner",
  ["muscle", "general-fitness"], 10, 1,
  [I("wrap_wm", 65, "wholemeal wrap (1 large)"), I("egg", 50, "egg (1 large)"), I("egg_white", 100), I("milk_skim", 30), I("banana", 100),
   I("greek0", 60), I("maple", 8), I("spices", 0.5, "cinnamon")],
  ["Whisk egg, whites, milk and cinnamon in a wide dish.", "Soak the wrap on both sides, then cook in a sprayed pan 2 minutes each side.",
   "Spread with yoghurt, add banana, roll and drizzle maple."],
  "French-toast vibes in 10 minutes with ~31 g protein.",
  "Breakfast 1-2 hours before training or within an hour after.",
  "skip the banana", ["banana:0"],
  "Pour the leftover egg mix over the wrap in the pan so nothing's wasted.", "high-protein breakfast")

# ============================================================ extra recovery / snack variety
R("somax-sn-edamame-rice-cracker-salt", "Somax Salted Edamame & Rice Cracker Recovery Box", "snack", "beginner",
  ["endurance", "general-fitness"], 5, 1,
  [I("edamame", 120), I("rice_cracker", 30), I("orange", 150, "orange (1)"), I("salt", 0.5, "sea salt")],
  ["Microwave edamame 2 minutes and sprinkle with salt.", "Pack with rice crackers and a peeled orange."],
  "A plant-based salty recovery box - protein, carbs, sodium and vitamin C.",
  "Within 30 minutes after training for vegan athletes, or as a between-events snack.",
  "skip the crackers", ["rice_cracker:0"],
  "Salt helps replace sweat losses after hot sessions.", "recovery snack/drink")

R("somax-sn-tuna-avo-rice-cake-stack", "Somax Tuna & Avo Crunch Stack", "snack", "beginner",
  ["fat-loss", "muscle"], 5, 1,
  [I("rice_cake", 25, "plain rice cakes (3)"), I("tuna", 95, "canned tuna (1 can, drained)"), I("avocado", 25), I("tomato", 60), I("lemon", 5)],
  ["Mash avocado with lemon and spread on rice cakes.", "Top with tuna and sliced tomato; season with pepper."],
  "A crunchy, gluten-free, dairy-free protein snack under 300 kcal.",
  "An afternoon snack 1-2 hours before training, or recovery on fat-loss days.",
  "use 2 rice cakes", ["rice_cake"],
  "Chilli flakes or everything-bagel seasoning take it up a level.", "recovery snack/drink")

R("somax-sn-pre-bed-choc-protein-mousse", "Somax Pre-Bed Chocolate Protein Mousse", "snack", "beginner",
  ["muscle", "strength"], 5, 1,
  [I("greek0", 200), I("whey", 15), I("cocoa", 6), I("maple", 8), I("raspberries", 60)],
  ["Whisk yoghurt, whey, cocoa and maple until thick and mousse-like.", "Top with raspberries; chill 10 minutes if you can wait."],
  "~34 g protein that tastes like dessert.",
  "Muscle-gain or recovery phases: 30-60 minutes before bed.",
  "already light - skip the maple to trim further", [],
  "Add a pinch of salt to make the chocolate pop.", "before bed")

R("somax-sn-vegan-pre-bed-tofu-pudding", "Somax Vegan Silken Choc-Berry Pudding", "snack", "intermediate",
  ["muscle", "general-fitness"], 5, 1,
  [I("silken_tofu", 250), I("pea_protein", 15), I("cocoa", 8), I("maple", 15), I("berries", 80)],
  ["Blend silken tofu, pea protein, cocoa and maple until silky.", "Chill 30 minutes; top with berries."],
  "A plant-based pre-bed pudding with ~28 g protein.",
  "Vegan athletes: 30-60 minutes before bed, or as an after-dinner recovery snack.",
  "skip the maple", ["maple:0"],
  "Silken tofu is the secret - firm tofu will be grainy.", "before bed")

R("somax-sn-lemon-prawn-pea-baked-rice", "Somax Lemon Prawn & Pea Baked Rice", "dinner", "intermediate",
  ["endurance", "general-fitness"], 35, 2,
  [I("rice_white", 180, "arborio or medium-grain rice"), I("prawns", 300), I("peas", 160), I("stock_chicken_gf", 700), I("onion", 80),
   I("garlic", 6), I("lemon", 20), I("parmesan", 15), I("olive_oil", 8), I("spinach", 60)],
  ["Heat oven to 200C. Soften onion and garlic in the oil in an ovenproof pot; stir in rice.", "Pour in hot stock, cover and bake 20 minutes.",
   "Stir in prawns, peas and spinach; return to the oven 6 minutes.", "Finish with lemon and parmesan."],
  "No-stir oven-baked rice - creamy carbs plus ~45 g protein a serve.",
  "Dinner the night before a long session, or recovery 1-2 hours after one.",
  "halve the rice", ["rice_white"],
  "Use frozen prawns - add them straight from frozen with an extra 2 minutes.", "endurance carb meal")

R("somax-sn-chicken-corn-congee", "Somax Ginger Chicken & Corn Rice Porridge", "dinner", "beginner",
  ["endurance", "general-fitness"], 45, 2,
  [I("rice_white", 140), I("chicken", 240), I("corn", 150), I("stock_chicken_gf", 1200), I("ginger", 15), I("spring_onion", 20), I("tamari", 15), I("sesame_oil", 4)],
  ["Simmer rice, ginger and stock, partly covered, for 35 minutes, stirring often, until porridge-like.", "Add whole chicken breasts for the last 15 minutes; remove, shred and return.",
   "Stir in corn; finish with tamari, sesame oil and spring onion."],
  "Soothing, salty, easy-to-digest rice porridge - great for nervy stomachs.",
  "Race-eve or game-eve dinner, or a gentle recovery meal when appetite is low after a hard effort.",
  "halve the rice", ["rice_white"],
  "Makes great next-morning breakfast 3 hours before a race.", "game/race-day", ["budget", "batch"])

R("somax-sn-beef-veg-skewers-couscous", "Somax Beef & Veg Skewers with Herby Couscous", "dinner", "beginner",
  ["strength", "muscle"], 25, 1,
  [I("beef_rump", 150), I("couscous", 70), I("capsicum", 80), I("zucchini", 80), I("red_onion", 40), I("greek0", 50),
   I("lemon", 10), I("herbs", 10, "parsley & mint"), I("olive_oil", 4)],
  ["Cube beef and veg and thread onto skewers; brush with oil.", "Grill or barbecue 8-10 minutes, turning.",
   "Pour boiling water over couscous, rest 5 minutes and fluff with lemon and herbs.", "Serve with yoghurt."],
  "Barbecue-friendly, ~45 g protein.",
  "Recovery dinner 1-2 hours after training.",
  "halve the couscous", ["couscous"],
  "Great on the barbie for a team dinner - scale it up.", "recovery meal")

R("somax-sn-white-bean-tuna-smash-toast", "Somax White Bean & Tuna Smash on Sourdough", "lunch", "beginner",
  ["muscle", "general-fitness"], 8, 1,
  [I("sourdough", 80, "sourdough (2 slices)"), I("cannellini", 100), I("tuna", 95, "canned tuna (1 can, drained)"), I("lemon", 10),
   I("rocket", 20), I("olive_oil", 4), I("garlic", 2)],
  ["Mash cannellini beans with lemon, oil and garlic.", "Spread over toasted sourdough.", "Top with tuna, rocket and black pepper."],
  "A pantry lunch with ~41 g protein.",
  "Lunch 3-4 hours before training, or recovery 1-2 hours after.",
  "use one slice", ["sourdough"],
  "Swap tuna for a boiled egg or two for a vegetarian version.", "recovery meal", ["budget"])

R("somax-sn-cottage-pineapple-rice-cakes", "Somax Cottage Cheese & Pineapple Rice Cake Snack", "snack", "beginner",
  ["fat-loss", "muscle"], 3, 1,
  [I("rice_cake", 25, "plain rice cakes (3)"), I("cottage", 120), I("pineapple", 100), I("herbs", 2, "mint")],
  ["Spread cottage cheese over rice cakes.", "Top with diced pineapple and torn mint."],
  "Sweet, salty and ~17 g protein for ~250 kcal.",
  "Afternoon snack 60-90 minutes before training, or a light recovery snack.",
  "use 2 rice cakes", ["rice_cake"],
  "Canned pineapple in juice works fine - drain well.", "pre-training snack")


# ------------------------------------------------------------------ compute
NONVEG, ANIMAL, DAIRY, GLUTEN, LIQ = "n", "a", "d", "g", "l"

def light_factors(spec):
    """light_keys entries: 'key' (halve), 'key:factor' (e.g. 'honey:0' = skip), '*:0.5' (all)."""
    out = {}
    for e in spec:
        k, _, f = e.partition(":")
        out[k] = float(f) if f else 0.5
    return out

def macros(ings, servings, light=()):
    t = [0.0, 0.0, 0.0, 0.0]
    rows = []
    fac = light_factors(light)
    for key, g, _lab, _amt in ings:
        name, kcal, p, c, f, _fl = FOODS[key]
        m = fac.get(key, fac.get("*", 1.0))
        vals = [kcal * g / 100 * m, p * g / 100 * m, c * g / 100 * m, f * g / 100 * m]
        rows.append((key, g * m, vals))
        for i in range(4): t[i] += vals[i]
    return [v / servings for v in t], rows

def fmt_amount(key, g, amt):
    if amt: return amt
    fl = FOODS[key][5]
    g_s = (f"{g:g}")
    return f"{g_s}ml" if LIQ in fl else f"{g_s}g"

def diet_tags(ings, mealType, kcal, p, c):
    flags = "".join(FOODS[k][5] for k, g, _, _ in ings if g > 0)
    tags = []
    if NONVEG not in flags: tags.append("vegetarian")
    if not (set(flags) & {NONVEG, ANIMAL, DAIRY}): tags.append("vegan")
    pmin = 15 if mealType == "snack" else 25
    if p >= pmin and p * 4 / kcal >= 0.20: tags.append("high-protein")
    if c <= 25 and c * 4 / kcal < 0.26: tags.append("low-carb")
    if DAIRY not in flags: tags.append("dairy-free")
    if GLUTEN not in flags: tags.append("gluten-free")
    return tags

def build():
    out, audit = [], []
    for r in RECIPES:
        ings = [x for x in r["ings"] if x[1] > 0]
        (k, p, c, f), rows = macros(ings, r["servings"])
        (lk, lp, lc, lf), _ = macros(ings, r["servings"], r["light_keys"])
        if r["light_keys"]:
            tip1 = f"Light serve: {r['light_text']} - ~{round(lk)} kcal, {round(lp)}g protein, {round(lc)}g carbs."
        else:
            tip1 = f"Light serve: {r['light_text']} (as written ~{round(k)} kcal, {round(p)}g protein, {round(c)}g carbs)."
        m = {
            "id": r["id"], "name": r["name"], "mealType": r["mealType"], "level": r["level"],
            "goals": r["goals"], "diet": diet_tags(ings, r["mealType"], k, p, c),
            "prepMinutes": r["prep"], "servings": r["servings"],
            "kcal": round(k), "proteinG": round(p, 1), "carbsG": round(c, 1), "fatG": round(f, 1),
            "ingredients": [{"name": lab or FOODS[key][0], "amount": fmt_amount(key, g, amt)} for key, g, lab, amt in ings],
            "steps": r["steps"], "description": r["desc"], "whoItsFor": r["who"],
            "tips": [tip1, r["tip2"]], "credit": "Somax", "sourceUrl": "",
            "sourceNote": "Somax original recipe. Macros calculated per serving from AUSNUT 2011-13 / USDA FoodData Central values for the listed raw weights; treat as estimates.",
            "verified": False, "basedOn": [],
        }
        out.append(m)
        audit.append((r, m, rows))
    return out, audit

def validate(meals, audit):
    MT = {"breakfast", "lunch", "dinner", "snack"}; LV = {"beginner", "intermediate", "advanced"}
    GO = {"muscle", "fat-loss", "endurance", "general-fitness", "strength"}
    DI = {"vegetarian", "vegan", "high-protein", "low-carb", "dairy-free", "gluten-free"}
    ref = json.load(open(os.path.join(ROOT, "somax-meals.json")))
    keys = list(ref[0].keys())
    other_ids, other_names = set(), {m["name"].lower() for m in ref}
    for fn in ["sourced-meals.json", "somax-meals.json", "meals/public-health-meals.json"]:
        p = os.path.join(ROOT, fn)
        if os.path.exists(p):
            other_ids |= {m["id"] for m in json.load(open(p))}
    errs, ids, names = [], set(), set()
    for m in meals:
        i = m["id"]
        if list(m.keys()) != keys: errs.append(f"{i} key order/shape {list(m.keys())}")
        if not i.startswith("somax-sn-"): errs.append(f"{i} prefix")
        if i in ids or i in other_ids: errs.append(f"{i} duplicate id")
        ids.add(i)
        if m["name"].lower() in names or m["name"].lower() in other_names: errs.append(f"{i} duplicate name")
        names.add(m["name"].lower())
        if m["mealType"] not in MT: errs.append(f"{i} mealType")
        if m["level"] not in LV: errs.append(f"{i} level")
        if not m["goals"] or not set(m["goals"]) <= GO: errs.append(f"{i} goals")
        if not set(m["diet"]) <= DI: errs.append(f"{i} diet")
        if "vegan" in m["diet"] and "vegetarian" not in m["diet"]: errs.append(f"{i} vegan w/o veg")
        atw = 4 * m["proteinG"] + 4 * m["carbsG"] + 9 * m["fatG"]
        if abs(m["kcal"] - atw) / atw > 0.10: errs.append(f"{i} kcal {m['kcal']} vs atwater {atw:.0f}")
        if len(m["tips"]) != 2 or not m["tips"][0].startswith("Light serve"): errs.append(f"{i} tips")
        if not (2 <= len(m["steps"]) <= 6): errs.append(f"{i} steps")
        if not m["ingredients"]: errs.append(f"{i} ingredients")
        for k in ["prepMinutes", "servings", "kcal"]:
            if not isinstance(m[k], int): errs.append(f"{i} {k} not int")
        if m["credit"] != "Somax" or m["sourceUrl"] != "" or m["verified"] is not False or m["basedOn"] != []: errs.append(f"{i} somax fields")
    return errs

if __name__ == "__main__":
    meals, audit = build()
    errs = validate(meals, audit)
    if "--audit" in sys.argv:
        for r, m, rows in audit:
            print(f"\n{m['id']}  (per recipe, servings={r['servings']})")
            for key, g, (k, p, c, f) in rows:
                print(f"   {key:18s} {g:7.1f}g  {k:6.0f} kcal  P{p:5.1f} C{c:5.1f} F{f:5.1f}")
            print(f"   = per serve {m['kcal']} kcal P{m['proteinG']} C{m['carbsG']} F{m['fatG']}  diet={m['diet']}")
    for m in meals:
        print(f"{m['id'][9:45]:36s} {m['mealType']:9s} {m['kcal']:4d} P{m['proteinG']:5.1f} C{m['carbsG']:5.1f} F{m['fatG']:5.1f} {','.join(m['diet'])}")
    if errs:
        print("ERRORS:\n  " + "\n  ".join(errs)); sys.exit(1)
    with open(OUT, "w") as fh:
        json.dump(meals, fh, indent=1, ensure_ascii=False); fh.write("\n")
    C = collections.Counter
    print(f"\nOK: {len(meals)} meals -> {OUT}")
    print("mealType", dict(C(m["mealType"] for m in meals)))
    print("level", dict(C(m["level"] for m in meals)))
    print("goals", dict(C(g for m in meals for g in m["goals"])))
    print("diet", dict(C(d for m in meals for d in m["diet"])))
    print("timing", dict(C(r["timing"] for r in RECIPES)))
    print("tags", dict(C(t for r in RECIPES for t in r["tags"])))
