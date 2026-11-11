import json, sys

OUT_SRC, OUT_SOMAX = sys.argv[1], sys.argv[2]
NHS = "https://www.nhs.uk/healthier-families/recipes/"
NHS_NOTE = "NHS Healthier Families recipe (© Crown copyright). Ingredient list copied as facts; method rewritten in Somax's own words. Nutrition per serving as published on the page."

S = []


def src(id, slug, name, mealType, level, goals, diet, prep, servings, kcal, p, c, f, ings, steps, desc, who, tips, note=NHS_NOTE):
    S.append(dict(id=id, name=name, mealType=mealType, level=level, goals=goals, diet=diet, prepMinutes=prep, servings=servings,
                  kcal=kcal, proteinG=p, carbsG=c, fatG=f, ingredients=[{"name": n, "amount": a} for n, a in ings], steps=steps,
                  description=desc, whoItsFor=who, tips=tips, credit="NHS Healthier Families", sourceUrl=NHS + slug + "/",
                  sourceNote=note, verified=True))


src("nhs-egg-shakshuka", "shakshuka", "Egg Shakshuka", "breakfast", "beginner", ["general-fitness", "muscle"], ["vegetarian", "high-protein", "gluten-free"],
    45, 4, 417, 25, 32, 18,
    [("vegetable oil", "1 tbsp"), ("yellow onion, finely chopped", "1"), ("red pepper, deseeded and chopped", "½"), ("yellow pepper, deseeded and chopped", "½"),
     ("garlic cloves, chopped", "6"), ("aubergine, chopped", "1"), ("tinned chopped tomatoes", "800g"), ("tomato purée", "2 tbsp"), ("ground cumin", "2 tsp"),
     ("tinned chickpeas, drained", "400g"), ("salt (optional)", "½ tsp"), ("cayenne pepper", "½ tsp"), ("spinach, chopped", "200g"), ("medium eggs", "6"),
     ("fresh coriander (optional)", "15g")],
    ["Gently cook the onion, peppers and garlic in the oil until soft.", "Add the aubergine and brown it, then stir in tomatoes, purée, spices and salt and simmer until thick.",
     "Add the chickpeas, then wilt in the spinach.", "Make six hollows, crack in the eggs, cover and cook on low until the whites set.", "Rest a minute, scatter with coriander and serve."],
    "Eggs poached in a spiced tomato, aubergine and chickpea sauce - a big, veg-packed brunch.",
    "Vegetarians and anyone wanting a filling weekend brunch with plant and egg protein.",
    ["Make the sauce ahead and reheat portions with fresh eggs on busy mornings.", "Add a slice of wholemeal toast for extra carbs before a long session."])
src("nhs-turkey-koftas", "turkey-koftas", "Turkey Koftas with Minty Yoghurt", "dinner", "beginner", ["fat-loss", "muscle"], ["high-protein"],
    40, 4, 162, 18.4, 9.6, 5.1,
    [("wooden skewers, soaked", "8"), ("onion, finely chopped", "½"), ("small carrot, grated", "1"), ("turkey mince", "250g"), ("garlic clove, crushed", "1"),
     ("dried cumin", "1 tsp"), ("tomato purée", "1 tbsp"), ("wholemeal breadcrumbs", "1 slice"), ("egg yolk, beaten", "1"),
     ("zero-fat Greek-style yoghurt", "4 tbsp"), ("fresh mint, chopped", "2 tbsp"), ("medium tomatoes, sliced", "2"), ("red onion, sliced", "1"),
     ("olive oil", "2 tsp"), ("black pepper", "pinch")],
    ["Combine the turkey with the onion, carrot, garlic, cumin, purée, breadcrumbs and egg yolk.", "Shape into eight sausages around the skewers.",
     "Grill for 15-20 minutes, turning now and then, until cooked through.", "Stir the mint into the yoghurt and dress the sliced tomato and red onion with oil and pepper."],
    "Lean spiced turkey skewers with a cool mint yoghurt dip and tomato salad.",
    "People cutting calories who still want a satisfying, high-protein dinner.",
    ["Serve with pitta or rice on training days for more carbs.", "Double the batch - cooked koftas keep 3 days in the fridge."])
src("nhs-pesto-parmesan-salmon", "pesto-and-parmesan-salmon", "Pesto & Parmesan Salmon Traybake", "dinner", "beginner", ["muscle", "general-fitness", "endurance"], ["high-protein"],
    40, 4, 501, 30, 52, 20.9,
    [("vegetable oil", "1 tbsp"), ("boneless salmon fillets", "4"), ("breadcrumbs", "75g"), ("green pesto", "2 tsp"), ("parmesan, grated", "2 tsp"),
     ("lower-fat spread", "1 tsp"), ("medium courgettes, sliced", "3"), ("medium red onions, chopped", "2"), ("medium carrots, chopped", "3"), ("new potatoes", "600g")],
    ["Roast the courgettes, onions and carrots with the oil and pepper at 200°C for about 30 minutes, stirring halfway.",
     "Mix breadcrumbs, pesto, cheese and spread and press onto the salmon on a lined tray.", "Bake the salmon with the veg for 15-20 minutes until the fish flakes.",
     "Boil the potatoes for about 15 minutes and serve alongside."],
    "Crumb-topped salmon roasted with vegetables and new potatoes - omega-3s and carbs in one tray.",
    "Endurance athletes and anyone wanting an easy, balanced post-training dinner.",
    ["Great the evening after a long run or ride.", "Swap new potatoes for sweet potato for variety."],
    note=NHS_NOTE + " The page lists kcal and fat only; protein and carbs are Somax estimates from the ingredients.")
src("nhs-turkey-stir-fry", "turkey-stir-fry", "Turkey & Orange Stir-fry", "dinner", "beginner", ["muscle", "fat-loss", "general-fitness"], ["high-protein", "dairy-free"],
    25, 4, 301, 25, 35, 7,
    [("dried egg noodles", "125g"), ("small orange, juiced", "1"), ("reduced-salt soy sauce", "1 tbsp"), ("cornflour", "1 tbsp"), ("vegetable oil", "1 tbsp"),
     ("skinless turkey breast, in strips", "350g"), ("spring onions, sliced", "5"), ("pepper, sliced", "1"), ("carrot, in thin strips", "1"),
     ("celery sticks, sliced", "2"), ("mushrooms, sliced", "1 handful"), ("black pepper", "pinch")],
    ["Soak the noodles in boiling water for about 6 minutes.", "Whisk orange juice, soy sauce and cornflour; heat the oil in a wok.",
     "Stir-fry the turkey for 3-4 minutes, add the veg and cook on high for another 3-4 minutes.", "Add the sauce until it thickens, toss in the drained noodles and serve."],
    "A fast, lean noodle stir-fry with a sticky orange-soy glaze.",
    "Busy people who need a 25-minute high-protein dinner.",
    ["Use firm tofu for a vegetarian version.", "Swap noodles for rice and pack leftovers for lunch."])
src("nhs-panjabi-dhal", "panjabi-dhal", "Panjabi Dhal", "dinner", "beginner", ["general-fitness", "endurance"], ["vegan", "vegetarian", "dairy-free", "gluten-free"],
    30, 4, 245, 15, 28.4, 8.2,
    [("red split lentils", "50g"), ("split mung dhal", "170g"), ("water", "1.5 litres"), ("large onion, chopped", "1"), ("garlic cloves, chopped", "4"),
     ("green chillies, chopped", "4"), ("rapeseed oil", "30ml"), ("salt (optional)", "1 tsp"), ("turmeric", "1½ tsp"), ("cumin seeds", "1 tsp"),
     ("fresh coriander", "to serve")],
    ["Simmer the lentils in the water with turmeric and salt, part-covered, for about 15 minutes.", "Fry the cumin seeds in the oil, then soften and brown the onion and garlic; add the chillies.",
     "Stir the spiced onions into the lentils, bring to the boil, then take off the heat.", "Top with coriander and serve with rice or chapatis."],
    "A comforting, budget-friendly lentil dhal packed with plant protein and fibre.",
    "Vegans, vegetarians and anyone on a budget wanting a filling plant-based meal.",
    ["Soak the lentils for a few hours to cut cooking time.", "Serve with rice and yoghurt (or soya yoghurt) to boost protein."])
src("nhs-tuna-bean-salad", "tuna-and-bean-salad", "Tuna & Bean Lunchbox Salad", "lunch", "beginner", ["fat-loss", "muscle"], ["high-protein", "dairy-free"],
    10, 1, 325, 22.5, 23.2, 14.4,
    [("olive oil", "3 tsp"), ("lemon juice", "½ lemon"), ("dried mixed herbs", "large pinch"), ("mustard powder", "large pinch"), ("black pepper", "large pinch"),
     ("pepper, chopped", "1 slice"), ("spring onions, sliced", "2"), ("cucumber, chopped", "3cm piece"), ("canned mixed beans, drained", "1 heaped tbsp"),
     ("tuna in spring water, drained", "½ of a 160g can"), ("wholemeal bread with lower-fat spread", "1 thick slice")],
    ["Whisk the oil, lemon, herbs, mustard and pepper.", "Fold in the chopped veg, beans and tuna.", "Pack with the bread, or swap the bread for cold pasta."],
    "A no-cook lunchbox salad of tuna, beans and crunchy veg in a lemony dressing.",
    "Office workers wanting a quick, portable, high-protein lunch.",
    ["Make it the night before - it holds up well.", "Add a full can of tuna for a 35g+ protein lunch."])
src("nhs-porridge-yoghurt-berries", "porridge-with-yoghurt-and-berries", "Porridge with Yoghurt & Berries", "breakfast", "beginner", ["endurance", "general-fitness"], ["vegetarian"],
    15, 4, 207, 8.4, 33.8, 3.9,
    [("porridge oats", "150g"), ("low-fat natural yoghurt", "8 tbsp"), ("frozen summer berries, defrosted", "100g"), ("water", "as needed")],
    ["Bring the oats and water to the boil in a non-stick pan, stirring.", "Simmer gently for about 5 minutes.", "Spoon into bowls and top each with yoghurt and berries."],
    "Simple oat porridge topped with yoghurt and berries - slow-release carbs to start the day.",
    "Runners, cyclists and anyone training in the morning who needs steady energy.",
    ["Eat 1-2 hours before an endurance session.", "Stir in a scoop of protein powder or use Greek yoghurt to boost protein."])
src("nhs-chicken-jalfrezi", "chicken-jalfrezi", "Chicken Jalfrezi", "dinner", "intermediate", ["muscle", "fat-loss", "strength"], ["high-protein", "gluten-free"],
    40, 4, 334, 41, 7.7, 11,
    [("rapeseed oil", "30ml"), ("boneless chicken, cubed", "700g"), ("medium onions, chopped", "3"), ("bell peppers, chopped", "2"), ("green chillies, sliced", "4"),
     ("garlic cloves, chopped", "4"), ("fresh ginger, sliced", "20g"), ("tin chopped tomatoes", "400g"), ("salt (optional)", "1 tsp"), ("turmeric", "1 tsp"),
     ("cumin seeds", "1 heaped tsp"), ("red chilli powder", "1 tsp"), ("garam masala", "1 tsp"), ("coriander powder", "1½ tsp"), ("water", "250ml"),
     ("fresh coriander (optional)", "to serve")],
    ["Brown the chicken in the oil with cumin, turmeric, chilli and half the salt; set aside.", "Soften the onions until golden; blend or mash the tomatoes.",
     "Add ginger, garlic and peppers, then the tomatoes and remaining spices.", "Return the chicken with the chillies and water and simmer, covered, for 10-15 minutes.",
     "Finish with coriander."],
    "A punchy, high-protein chicken curry with peppers and chillies - lighter than a takeaway.",
    "Lifters wanting 40g of protein in a flavourful dinner; good for batch-cooking.",
    ["Batch-cook and freeze in portions.", "Serve with rice on heavy training days, extra veg on rest days."],
    note=NHS_NOTE + " The page's fat figure reads '79g', an apparent typo; 11g is a Somax estimate from the ingredients.")
src("nhs-potato-poached-egg-hash", "potato-and-poached-egg-hash", "Potato & Poached Egg Hash", "breakfast", "beginner", ["general-fitness", "endurance"], ["gluten-free", "dairy-free"],
    30, 4, 209, 12.3, 19.4, 8.6,
    [("vegetable oil", "2 tsp"), ("lean back bacon, chopped", "2 rashers"), ("cooked potatoes, in chunks", "400g"), ("spring onions, chopped", "4"),
     ("tomatoes, chopped", "4"), ("eggs", "4"), ("black pepper", "pinch")],
    ["Fry the bacon in the oil, add the potatoes and brown them.", "Stir in the spring onions and tomatoes and keep warm on a low heat.",
     "Poach the eggs in simmering water with a dash of vinegar.", "Share the hash between plates, top with an egg and season."],
    "Crispy potato and bacon hash topped with a runny poached egg.",
    "Anyone wanting a hearty weekend breakfast that uses up leftover potatoes.",
    ["Cook extra potatoes at dinner to make this quick.", "Add a second egg for more protein."])
src("nhs-spicy-turkey-stuffed-peppers", "spicy-turkey-stuffed-peppers", "Peppers with Spicy Turkey Stuffing", "dinner", "beginner", ["muscle", "fat-loss"], ["high-protein", "gluten-free", "dairy-free"],
    55, 4, 302, 24, 48, 3,
    [("peppers, halved and deseeded", "4"), ("easy-cook long grain rice", "150g"), ("vegetable oil", "1 tsp"), ("small onion, chopped", "1"), ("garlic clove, crushed", "1"),
     ("skinless turkey breast, in chunks", "300g"), ("tomatoes, chopped", "2"), ("frozen peas, thawed", "75g"), ("mild paprika", "1 tsp"),
     ("dried mixed herbs", "1 tsp"), ("black pepper", "pinch")],
    ["Heat the oven to 190°C and sit the pepper halves in a roasting tin.", "Cook the rice for 12-15 minutes and drain.",
     "Soften onion and garlic, stir-fry the turkey, then add tomatoes, peas, paprika and herbs.", "Mix in the rice, fill the peppers, cover with foil and bake for 20-25 minutes."],
    "Roasted peppers stuffed with paprika turkey and rice - very low in fat.",
    "People in a fat-loss phase who want big portions for few calories.",
    ["Fill and refrigerate in the morning, bake in the evening.", "Use brown rice for extra fibre."])
src("nhs-haddock-florentine", "haddock-florentine", "Haddock Florentine", "dinner", "beginner", ["muscle", "fat-loss", "strength"], ["high-protein"],
    15, 4, 322, 37, 18.8, 10.2,
    [("skinless haddock fillets", "4"), ("tomatoes, halved", "4"), ("eggs", "4"), ("wholemeal bread", "4 slices"), ("reduced-fat spread", "4 tsp"),
     ("spinach", "300g"), ("black pepper", "pinch")],
    ["Grill the haddock with the tomatoes for 5-6 minutes until the fish flakes.", "Poach the eggs for 4-5 minutes and toast the bread.",
     "Wilt the spinach by pouring boiling water over it in a colander, then drain.", "Plate spinach, fish and egg; serve with the tomatoes and toast."],
    "Grilled haddock on wilted spinach topped with a poached egg - 37g protein in 15 minutes.",
    "Anyone wanting a very fast, lean, high-protein meal.",
    ["Works as a big post-workout brunch too.", "Swap haddock for any white fish or salmon."])
src("nhs-rajma-curry", "kidney-bean-rajma-curry", "Simple Rajma (Kidney Bean) Curry", "dinner", "beginner", ["endurance", "general-fitness"], ["vegetarian", "gluten-free"],
    30, 4, 446, 20, 63, 10,
    [("rapeseed or vegetable oil", "2 tbsp"), ("dried curry leaves", "1 handful"), ("mustard seeds", "2 tsp"), ("cumin seeds", "2 tsp"), ("dried red chilli, halved", "1"),
     ("hing/asafoetida (optional)", "¼ tsp"), ("tin chopped tomatoes", "1"), ("green chillies, chopped", "3"), ("garlic cloves, crushed", "3"),
     ("ginger, grated", "thumb-sized piece"), ("turmeric", "½ tsp"), ("dhana jeera (ground cumin & coriander)", "2 heaped tsp"), ("salt (optional)", "1 tsp"),
     ("tins red kidney beans, drained", "2"), ("hot water", "200ml"), ("fresh coriander", "1 handful"), ("basmati rice, cooked", "200g"),
     ("cucumber, in wedges", "½ large"), ("low-fat plain yoghurt", "4 tbsp")],
    ["Fry the curry leaves, seeds, dried chilli and hing in hot oil until the seeds pop.", "Add garlic, then tomatoes and the remaining spices; cook hard for 10 minutes.",
     "Add the beans and hot water, cover and simmer for 15-20 minutes.", "Stir in coriander and serve with rice, yoghurt and cucumber."],
    "A fragrant North-Indian-style kidney bean curry served with rice - big on carbs and fibre.",
    "Vegetarians and endurance athletes needing a carb-rich, budget meal.",
    ["Great the night before a long run or match.", "Use soya yoghurt to make it vegan."])
src("nhs-salmon-broccoli-pasta", "salmon-and-broccoli-pasta", "Salmon & Broccoli Pasta", "dinner", "beginner", ["muscle", "endurance"], ["high-protein"],
    30, 4, 465, 34.2, 45.9, 13.8,
    [("salmon fillets", "2"), ("wholemeal pasta", "250g"), ("spring onions, chopped", "5"), ("broccoli florets", "400g"), ("peas", "100g"),
     ("lower-fat soft cheese", "150g"), ("skimmed milk", "150ml"), ("lemon zest", "1 lemon"), ("parsley or chives, chopped", "2 tbsp"),
     ("black pepper", "pinch"), ("reduced-fat hard cheese, grated", "4 tsp")],
    ["Grill the salmon for 5-6 minutes and rest it.", "Boil the pasta for 8 minutes, then add spring onions and broccoli for 3-4 more.",
     "Drain over the peas, keeping 2 tbsp of the water.", "Melt soft cheese and milk with the reserved water into a sauce; add lemon zest and herbs.",
     "Return pasta and veg, flake in the salmon, season and top with cheese."],
    "Creamy lemon-herb wholemeal pasta with flaked salmon, broccoli and peas.",
    "Active people who want a balanced carb-and-protein dinner in 30 minutes.",
    ["Ideal after evening training.", "Portion leftovers for next-day lunch - eat cold or reheat thoroughly."])
src("nhs-greek-yoghurt-raspberry-chill", "greek-yoghurt-and-raspberry-chill", "Greek Yoghurt & Raspberry Chill", "snack", "beginner", ["fat-loss", "general-fitness"], ["vegetarian"],
    8, 4, 129, 6.6, 17, 3.2,
    [("porridge oats", "50g"), ("raspberries", "250g"), ("low-fat Greek-style natural yoghurt", "300g")],
    ["Toast the oats under the grill until golden and leave to cool.", "Lightly mash half the raspberries.",
     "Stir the yoghurt and oats through the mashed fruit.", "Spoon into glasses, top with whole raspberries and chill."],
    "A light, fruity yoghurt pot with toasted oats.",
    "Anyone wanting a sweet, low-calorie snack or dessert.",
    ["Use 0% Greek yoghurt or skyr to double the protein.", "Make 4 pots on Sunday for the week's snacks."])
src("nhs-quick-chicken-couscous", "quick-chicken-couscous", "Quick Chicken Couscous", "lunch", "beginner", ["muscle", "endurance", "general-fitness"], ["high-protein", "dairy-free"],
    20, 4, 322, 26.8, 42.8, 4.2,
    [("couscous", "200g"), ("reduced-salt chicken or vegetable stock", "450ml"), ("skinless roast chicken breast, chopped", "250g"), ("sweetcorn", "100g"),
     ("tomatoes, chopped", "2"), ("cucumber, chopped", "¼"), ("lemon juice", "1 tbsp"), ("black pepper", "pinch")],
    ["Pour the hot stock over the couscous and leave for 10-15 minutes.", "Fluff with a fork.", "Stir through the chicken, sweetcorn, tomato, cucumber, lemon and pepper."],
    "A no-cook-really couscous salad with leftover roast chicken.",
    "Busy people wanting a fast lunchbox with protein and carbs for afternoon training.",
    ["Use leftover roast chicken.", "Keeps 2 days in the fridge - good meal-prep lunch."])
src("nhs-turkey-burgers", "turkey-burgers", "Turkey Burgers", "dinner", "beginner", ["muscle", "fat-loss", "strength"], ["high-protein", "dairy-free"],
    30, 4, 354, 38, 28.5, 8.9,
    [("minced turkey", "450g"), ("small onion, very finely chopped", "1"), ("carrot, grated", "1"), ("sweetcorn", "50g"), ("dried mixed herbs", "2 tsp"),
     ("black pepper", "pinch"), ("burger buns, halved", "4"), ("lettuce leaves", "2 handfuls"), ("tomato slices", "8")],
    ["Mix the turkey, onion, carrot, sweetcorn, herbs and pepper and shape four burgers.", "Grill for 12-15 minutes, turning once, until cooked through; rest briefly.",
     "Toast the buns and build with lettuce, burger and tomato."],
    "Juicy homemade turkey burgers with hidden veg - 38g protein each.",
    "Families and lifters wanting a fakeaway that fits their goals.",
    ["Freeze uncooked patties between baking paper.", "Use a lettuce wrap instead of a bun for fewer carbs."])
src("nhs-tuna-bean-jackets", "tuna-and-bean-jacket-potatoes", "Tuna & Bean Jacket Potatoes", "lunch", "beginner", ["endurance", "fat-loss", "general-fitness"], ["high-protein", "gluten-free", "dairy-free"],
    80, 4, 281, 20, 49, 1.5,
    [("baking potatoes", "4"), ("can cannellini beans, drained", "1"), ("tuna in water, drained", "200g"), ("tomato purée", "2 tsp"),
     ("pepper, chopped (optional)", "1"), ("tomatoes, chopped (optional)", "2"), ("spring onions (optional)", "4"), ("wine vinegar (optional)", "2 tsp"),
     ("black pepper", "pinch")],
    ["Bake the pricked potatoes at 200°C for about an hour.", "Mix the beans, tuna, veg, vinegar and purée and season.", "Split the hot potatoes and pile in the filling."],
    "Fluffy jacket potatoes with a zingy tuna and bean filling - almost no fat.",
    "Anyone wanting a cheap, filling, low-fat meal.",
    ["Microwave the potatoes for 8-10 minutes then crisp in the oven to save time.", "Use tofu for a vegetarian version."])
src("nhs-scrambled-eggs-mushrooms-peppers", "scrambled-eggs-on-mushrooms-with-grilled-peppers", "Scrambled Eggs on Mega-Mushrooms", "breakfast", "beginner", ["general-fitness", "muscle"], ["vegetarian", "high-protein"],
    20, 4, 369, 21.3, 44.3, 9.8,
    [("red peppers, sliced", "2"), ("very large mushrooms (stalks chopped)", "4"), ("eggs", "6"), ("skimmed milk", "4 tbsp"), ("lower-fat spread", "2 tsp"),
     ("cherry tomatoes, halved", "12"), ("wholemeal pittas", "4"), ("black pepper", "to taste")],
    ["Grill the peppers and mushroom caps for 4-5 minutes, turning once.", "Whisk the eggs with the milk.",
     "Scramble the eggs with the chopped stalks in the melted spread, then fold in the peppers and tomatoes.", "Serve on the mushroom caps with toasted pitta."],
    "Fluffy scrambled eggs piled on grilled mushrooms with peppers and pitta.",
    "Vegetarians and anyone wanting a veg-heavy cooked breakfast.",
    ["Add egg whites to bump protein without many calories.", "Skip the pitta on rest days for a lower-carb plate."])

# =================================================================== SOMAX MEALS
# per 100g: kcal, protein, carbs, fat (approx. USDA/UK composition values)
F = {
    "oats": (379, 13, 68, 6.5), "greek yogurt 0%": (59, 10.3, 3.6, 0.4), "skyr": (63, 11, 4, 0.2), "semi-skimmed milk": (50, 3.5, 4.8, 1.7),
    "whey protein": (400, 78, 8, 6), "banana": (89, 1.1, 23, 0.3), "mixed berries": (50, 0.8, 12, 0.3), "egg": (143, 12.6, 0.7, 9.5),
    "egg white": (52, 11, 0.7, 0.2), "wholemeal bread": (247, 13, 41, 3.4), "spinach": (23, 2.9, 3.6, 0.4), "chicken breast": (120, 22.5, 0, 2.6),
    "turkey mince 5%": (130, 21, 0, 5), "beef mince 5%": (137, 21, 0, 5), "salmon": (208, 20, 0, 13), "cod": (82, 18, 0, 0.7),
    "tuna (canned, drained)": (116, 26, 0, 1), "prawns": (85, 20, 0, 0.5), "firm tofu": (144, 15.5, 2.8, 8.7), "tempeh": (192, 20, 7.6, 10.8),
    "chickpeas (canned, drained)": (139, 7, 22, 2.6), "black beans (canned, drained)": (110, 7, 19, 0.6), "red lentils (dry)": (358, 24, 60, 2),
    "quinoa (dry)": (368, 14, 64, 6), "brown rice (dry)": (370, 7.9, 77, 2.9), "basmati rice (dry)": (350, 8, 78, 0.6),
    "wholewheat pasta (dry)": (348, 13, 67, 2.5), "sweet potato": (86, 1.6, 20, 0.1), "potato": (77, 2, 17, 0.1), "broccoli": (34, 2.8, 7, 0.4),
    "mixed peppers": (31, 1, 6, 0.3), "onion": (40, 1.1, 9, 0.1), "tomato": (18, 0.9, 3.9, 0.2), "chopped tomatoes (tin)": (24, 1.2, 4, 0.2),
    "avocado": (160, 2, 8.5, 14.7), "olive oil": (884, 0, 0, 100), "peanut butter": (588, 25, 20, 50), "almonds": (579, 21, 22, 50),
    "cottage cheese": (98, 11, 3.4, 4.3), "feta": (264, 14, 4, 21), "wholemeal wrap": (300, 9, 48, 7), "rice cakes": (387, 8, 81, 3),
    "honey": (304, 0.3, 82, 0), "frozen peas": (81, 5.4, 14, 0.4), "salad leaves": (20, 1.5, 3, 0.3), "cucumber": (15, 0.7, 3.6, 0.1),
    "chia seeds": (486, 17, 42, 31), "edamame (shelled)": (121, 12, 9, 5), "mushrooms": (22, 3.1, 3.3, 0.3), "courgette": (17, 1.2, 3.1, 0.3),
    "carrot": (41, 0.9, 10, 0.2), "salsa": (36, 1.5, 7, 0.2), "hummus": (166, 8, 14, 10), "apple": (52, 0.3, 14, 0.2), "frozen mango": (60, 0.8, 15, 0.4),
    "soy sauce (reduced salt)": (53, 8, 5, 0.1), "lean sirloin steak": (160, 23, 0, 7.5), "light mozzarella": (165, 18, 2, 10),
    "cocoa powder": (228, 20, 58, 14), "unsweetened soya milk": (33, 3.3, 0.5, 1.8), "frozen mixed stir-fry veg": (35, 2, 6, 0.3),
    "light coconut milk": (70, 0.6, 2, 7), "lime juice": (25, 0.4, 8, 0.1), "cajun or fajita spice": (0, 0, 0, 0), "garlic": (0, 0, 0, 0),
    "spices & herbs": (0, 0, 0, 0), "egg noodles (dry)": (384, 14, 71, 4.4), "pumpkin seeds": (559, 30, 11, 49), "dark chocolate 70%": (598, 7.8, 46, 43),
    "smoked salmon": (117, 18, 0, 4.3), "rye crispbread": (334, 9, 65, 1.5), "cherry tomatoes": (18, 0.9, 3.9, 0.2), "lemon juice": (22, 0.4, 7, 0.2),
    "red curry paste": (100, 2, 8, 6), "parmesan": (392, 36, 3, 26), "pesto": (450, 5, 6, 45),
}

M = []


def meal(id, name, mealType, level, goals, diet, prep, servings, items, steps, desc, who, tips, basedOn):
    k = p = c = f = 0.0
    ings = []
    for food, grams, label in items:
        v = F[food]
        k += v[0] * grams / 100; p += v[1] * grams / 100; c += v[2] * grams / 100; f += v[3] * grams / 100
        ings.append({"name": label or food, "amount": f"{grams}g" if grams else "to taste"})
    s = servings
    M.append(dict(id=id, name=name, mealType=mealType, level=level, goals=goals, diet=diet, prepMinutes=prep, servings=s,
                  kcal=round(k / s), proteinG=round(p / s, 1), carbsG=round(c / s, 1), fatG=round(f / s, 1), ingredients=ings, steps=steps,
                  description=desc, whoItsFor=who, tips=tips, credit="Somax", sourceUrl="",
                  sourceNote="Original Somax recipe. Macros calculated from standard food-composition values for the listed raw weights; treat as estimates.",
                  verified=False, basedOn=basedOn))


meal("somax-protein-overnight-oats", "Somax Protein Overnight Oats", "breakfast", "beginner", ["muscle", "endurance"], ["vegetarian", "high-protein"], 5, 1,
     [("oats", 60, "rolled oats"), ("greek yogurt 0%", 150, "0% Greek yoghurt"), ("semi-skimmed milk", 100, None), ("whey protein", 15, "vanilla whey (½ scoop)"),
      ("chia seeds", 10, None), ("mixed berries", 80, None)],
     ["Stir oats, yoghurt, milk, whey and chia together in a jar.", "Refrigerate overnight (or at least 4 hours).", "Top with berries in the morning."],
     "Creamy no-cook oats with 40g+ protein, ready when you wake up.", "Early trainers and busy commuters who want breakfast with zero morning effort.",
     ["Make 3 jars at once - they keep 3 days.", "Eat 60-90 min before a morning session or straight after."], ["nhs-porridge-yoghurt-berries"])
meal("somax-veggie-egg-white-scramble", "Somax Veggie Egg-White Scramble", "breakfast", "beginner", ["fat-loss", "muscle"], ["vegetarian", "high-protein", "gluten-free", "low-carb"], 10, 1,
     [("egg", 100, "eggs (2 large)"), ("egg white", 150, "liquid egg whites"), ("spinach", 60, None), ("mushrooms", 60, None), ("cherry tomatoes", 80, None), ("feta", 20, None),
      ("olive oil", 3, "olive oil (spray)")],
     ["Sauté mushrooms in a sprayed pan for 3 minutes.", "Add spinach to wilt, then pour in whisked eggs and whites.", "Stir gently until just set; top with tomatoes and crumbled feta."],
     "A big, fluffy, low-calorie scramble with 35g+ protein.", "Anyone in a fat-loss phase who wants a filling breakfast under 350 kcal.",
     ["Add a slice of wholemeal toast on training days.", "Swap feta for cottage cheese to cut fat further."], ["nhs-scrambled-eggs-mushrooms-peppers", "nhs-egg-shakshuka"])
meal("somax-pb-banana-protein-toast", "Somax PB Banana Power Toast", "breakfast", "beginner", ["muscle", "endurance", "strength"], ["vegetarian", "high-protein"], 5, 1,
     [("wholemeal bread", 80, "wholemeal bread (2 slices)"), ("peanut butter", 20, None), ("banana", 100, None), ("skyr", 150, "skyr / Icelandic yoghurt (on the side)"), ("honey", 5, None)],
     ["Toast the bread and spread with peanut butter.", "Top with sliced banana and a drizzle of honey.", "Serve with a pot of skyr."],
     "Fast carbs, healthy fats and protein for heavy training mornings.", "Lifters and runners who need a quick, calorie-dense breakfast.",
     ["Good 1-2 hours before lifting.", "Use almond butter or a nut-free spread to swap allergens."], ["nhs-porridge-yoghurt-berries"])
meal("somax-tofu-breakfast-burrito", "Somax Tofu Breakfast Burrito", "breakfast", "intermediate", ["muscle", "general-fitness"], ["vegan", "high-protein", "dairy-free"], 15, 1,
     [("firm tofu", 150, "firm tofu, crumbled"), ("black beans (canned, drained)", 60, None), ("mixed peppers", 60, None), ("spinach", 30, None),
      ("wholemeal wrap", 60, "wholemeal tortilla (1 large)"), ("salsa", 40, None), ("olive oil", 5, None), ("spices & herbs", 0, "turmeric, cumin, smoked paprika")],
     ["Fry peppers in the oil, then add crumbled tofu and spices and cook for 5 minutes.", "Stir in beans and spinach until warm.", "Wrap in the tortilla with salsa and toast seam-side down."],
     "A spicy plant-protein breakfast wrap that travels well.", "Vegans and anyone wanting a grab-and-go hot breakfast.",
     ["Make 4, wrap in foil and freeze; reheat from frozen.", "Add avocado for extra calories when bulking."], ["nhs-egg-shakshuka"])
meal("somax-recovery-smoothie", "Somax Recovery Smoothie", "snack", "beginner", ["muscle", "endurance"], ["vegetarian", "high-protein", "gluten-free"], 5, 1,
     [("semi-skimmed milk", 300, None), ("whey protein", 30, "whey protein (1 scoop)"), ("banana", 100, None), ("frozen mango", 80, None), ("oats", 20, None)],
     ["Blend everything until smooth.", "Drink within an hour of training."],
     "A carb-plus-protein shake to refuel after hard sessions.", "Endurance athletes and lifters training twice a day or with a long gap until the next meal.",
     ["Use soya milk and pea protein for a dairy-free version.", "Freeze the banana for a thicker shake."], ["nhs-greek-yoghurt-raspberry-chill"])

meal("somax-chicken-quinoa-power-bowl", "Somax Chicken Quinoa Power Bowl", "lunch", "beginner", ["muscle", "general-fitness"], ["high-protein", "gluten-free", "dairy-free"], 25, 2,
     [("chicken breast", 300, None), ("quinoa (dry)", 120, None), ("broccoli", 150, None), ("edamame (shelled)", 80, None), ("cucumber", 100, None),
      ("avocado", 80, None), ("olive oil", 10, None), ("lemon juice", 20, None), ("spices & herbs", 0, "garlic, paprika, salt & pepper")],
     ["Cook the quinoa (about 15 minutes) and steam the broccoli and edamame.", "Season the chicken and pan-fry in half the oil for 6-7 minutes a side.",
      "Slice and build bowls with quinoa, veg, cucumber and avocado.", "Dress with the remaining oil and lemon."],
     "A colourful meal-prep bowl with over 45g protein per portion.", "Gym-goers who meal-prep lunches for the week.",
     ["Keep avocado separate until eating.", "Swap chicken for tofu to make it vegan."], ["nhs-quick-chicken-couscous"])
meal("somax-tuna-chickpea-crunch-salad", "Somax Tuna Chickpea Crunch Salad", "lunch", "beginner", ["fat-loss", "muscle"], ["high-protein", "dairy-free", "gluten-free"], 10, 1,
     [("tuna (canned, drained)", 120, None), ("chickpeas (canned, drained)", 80, None), ("salad leaves", 60, None), ("cucumber", 80, None), ("cherry tomatoes", 80, None),
      ("mixed peppers", 50, "red pepper"), ("olive oil", 7, None), ("lemon juice", 15, None)],
     ["Chop the veg.", "Toss everything with the oil and lemon; season well."],
     "A no-cook, high-protein lunch that keeps you full all afternoon.", "Office workers and anyone cutting who wants a quick, cheap lunch.",
     ["Pack dressing separately.", "Add a rye crispbread or two if you train in the afternoon."], ["nhs-tuna-bean-salad"])
meal("somax-turkey-hummus-wrap", "Somax Turkey & Hummus Wrap", "lunch", "beginner", ["muscle", "general-fitness"], ["high-protein", "dairy-free"], 10, 1,
     [("wholemeal wrap", 60, "wholemeal tortilla"), ("turkey mince 5%", 120, "cooked turkey breast slices"), ("hummus", 40, None), ("salad leaves", 30, None),
      ("carrot", 50, "grated carrot"), ("cucumber", 50, None)],
     ["Spread hummus over the wrap.", "Layer turkey, leaves, carrot and cucumber.", "Roll tightly and halve."],
     "A five-minute protein wrap for desk lunches.", "Busy people who need lunch that can be made the night before.",
     ["Wrap in foil to stop it going soggy.", "Use chicken or tofu as a swap."], ["nhs-quick-chicken-couscous"])
meal("somax-lentil-veg-soup", "Somax Red Lentil & Veg Soup", "lunch", "beginner", ["fat-loss", "general-fitness", "endurance"], ["vegan", "dairy-free", "gluten-free"], 35, 4,
     [("red lentils (dry)", 200, None), ("onion", 150, None), ("carrot", 200, None), ("chopped tomatoes (tin)", 400, None), ("spinach", 100, None),
      ("olive oil", 10, None), ("spices & herbs", 0, "cumin, smoked paprika, garlic, low-salt stock")],
     ["Soften onion and carrot in the oil for 5 minutes with the spices.", "Add lentils, tomatoes and 1 litre stock; simmer 20 minutes.", "Stir in spinach, then blend partly or fully."],
     "A thick, warming soup that freezes perfectly - cheap, filling and plant-based.", "Budget-conscious people and anyone wanting a high-fibre, low-calorie lunch.",
     ["Freeze in single portions.", "Top with Greek yoghurt or pumpkin seeds for extra protein."], ["nhs-panjabi-dhal"])
meal("somax-salmon-sweet-potato-tray", "Somax Salmon & Sweet Potato Traybake", "dinner", "beginner", ["muscle", "endurance", "general-fitness"], ["high-protein", "gluten-free", "dairy-free"], 35, 2,
     [("salmon", 260, "salmon fillets (2)"), ("sweet potato", 400, None), ("broccoli", 200, None), ("mixed peppers", 150, None), ("olive oil", 10, None),
      ("lemon juice", 15, None), ("spices & herbs", 0, "garlic, smoked paprika")],
     ["Roast cubed sweet potato and peppers in the oil at 200°C for 20 minutes.", "Add broccoli and the salmon, season, and roast 12-15 minutes more.", "Squeeze over lemon to serve."],
     "One-tray salmon dinner with plenty of slow carbs and omega-3s.", "Endurance athletes and anyone wanting an easy, nutrient-dense dinner.",
     ["Great the night before a race or long session.", "Swap salmon for cod to reduce calories."], ["nhs-pesto-parmesan-salmon"])
meal("somax-beef-burrito-bowl", "Somax Lean Beef Burrito Bowl", "dinner", "beginner", ["muscle", "strength"], ["high-protein", "gluten-free", "dairy-free"], 25, 4,
     [("beef mince 5%", 500, None), ("basmati rice (dry)", 240, None), ("black beans (canned, drained)", 240, None), ("mixed peppers", 200, None), ("onion", 100, None),
      ("salsa", 160, None), ("avocado", 120, None), ("lime juice", 20, None), ("cajun or fajita spice", 0, "fajita spice")],
     ["Cook the rice.", "Brown the mince with onion and peppers, add fajita spice and beans and heat through.", "Serve over rice with salsa, avocado and lime."],
     "A big, macro-friendly Tex-Mex bowl with 40g+ protein.", "Lifters bulking or maintaining who want a crowd-pleasing batch meal.",
     ["Portion into 4 boxes for lunches.", "Use cauliflower rice to cut carbs on rest days."], ["nhs-turkey-burgers"])
meal("somax-chicken-veg-stir-fry", "Somax 15-Minute Chicken Stir-fry", "dinner", "beginner", ["fat-loss", "muscle"], ["high-protein", "dairy-free"], 15, 2,
     [("chicken breast", 300, None), ("frozen mixed stir-fry veg", 300, None), ("egg noodles (dry)", 100, None), ("soy sauce (reduced salt)", 30, None),
      ("olive oil", 10, "rapeseed or olive oil"), ("spices & herbs", 0, "garlic, ginger, chilli")],
     ["Cook the noodles.", "Stir-fry sliced chicken in hot oil for 5 minutes, add garlic, ginger and chilli.", "Add the veg for 3-4 minutes, then the soy and noodles; toss and serve."],
     "Faster than a takeaway, with half the calories.", "Busy weeknight cooks wanting a quick, high-protein dinner.",
     ["Keep frozen stir-fry veg in the freezer for emergencies.", "Swap noodles for extra veg to go low-carb."], ["nhs-turkey-stir-fry"])
meal("somax-tofu-red-curry", "Somax Tofu & Veg Red Curry", "dinner", "intermediate", ["general-fitness", "endurance"], ["vegan", "dairy-free", "gluten-free"], 30, 3,
     [("firm tofu", 400, None), ("light coconut milk", 400, None), ("red curry paste", 40, None), ("mixed peppers", 200, None), ("courgette", 200, None),
      ("spinach", 100, None), ("brown rice (dry)", 180, None), ("lime juice", 15, None)],
     ["Cook the rice.", "Press and cube the tofu and pan-fry until golden.", "Fry the paste for a minute, add coconut milk and veg and simmer 10 minutes.",
      "Add tofu and spinach, finish with lime, and serve over rice."],
     "A creamy Thai-style curry with crispy tofu.", "Vegans and anyone wanting a comforting, plant-based dinner.",
     ["Press the tofu for 15 minutes for crispier results.", "Add edamame to push protein higher."], ["nhs-panjabi-dhal", "nhs-rajma-curry"])
meal("somax-turkey-bolognese", "Somax High-Protein Turkey Bolognese", "dinner", "beginner", ["muscle", "fat-loss", "strength"], ["high-protein", "dairy-free"], 35, 4,
     [("turkey mince 5%", 500, None), ("wholewheat pasta (dry)", 300, None), ("chopped tomatoes (tin)", 800, None), ("onion", 150, None), ("carrot", 150, None),
      ("mushrooms", 150, None), ("olive oil", 10, None), ("spices & herbs", 0, "garlic, oregano, basil")],
     ["Soften onion, carrot and mushrooms in the oil.", "Brown the turkey, add tomatoes and herbs and simmer 20 minutes.", "Serve over the cooked pasta."],
     "A leaner take on spag bol with hidden veg and 40g protein.", "Families and lifters wanting a batch-cook staple.",
     ["Freeze sauce portions for up to 3 months.", "Top with a little parmesan if dairy is fine for you."], ["nhs-turkey-koftas", "nhs-turkey-burgers"])
meal("somax-steak-potato-greens", "Somax Steak, Potatoes & Greens", "dinner", "intermediate", ["strength", "muscle"], ["high-protein", "gluten-free", "dairy-free"], 30, 2,
     [("lean sirloin steak", 350, None), ("potato", 400, "baby potatoes"), ("broccoli", 150, "tenderstem broccoli"), ("spinach", 100, None), ("olive oil", 10, None),
      ("garlic", 0, "garlic & rosemary")],
     ["Boil the potatoes 15 minutes, then crush and crisp in a pan with half the oil.", "Sear the steak 2-4 minutes a side and rest 5 minutes.",
      "Sauté broccoli and spinach with garlic in the remaining oil.", "Slice the steak and serve."],
     "A strength-athlete classic: iron-rich steak, potatoes and greens.", "Strength trainees who want a satisfying, high-protein dinner after heavy sessions.",
     ["Rest the steak before slicing.", "Swap potatoes for sweet potatoes for variety."], ["nhs-haddock-florentine"])
meal("somax-cod-chickpea-stew", "Somax Cod & Chickpea Tomato Stew", "dinner", "beginner", ["fat-loss", "muscle"], ["high-protein", "dairy-free", "gluten-free"], 25, 2,
     [("cod", 300, None), ("chickpeas (canned, drained)", 240, None), ("chopped tomatoes (tin)", 400, None), ("spinach", 100, None), ("onion", 100, None),
      ("olive oil", 10, None), ("spices & herbs", 0, "garlic, smoked paprika, cumin")],
     ["Soften the onion and spices in the oil.", "Add tomatoes and chickpeas and simmer 10 minutes.", "Nestle in the cod, cover and cook 6-8 minutes; stir through spinach."],
     "A light Spanish-style one-pot fish stew.", "People cutting who want a big, warming bowl for few calories.",
     ["Serve with crusty bread on training days.", "Any white fish works."], ["nhs-egg-shakshuka", "nhs-haddock-florentine"])

meal("somax-cottage-cheese-crispbreads", "Somax Cottage Cheese Crispbreads", "snack", "beginner", ["fat-loss", "muscle"], ["vegetarian", "high-protein"], 3, 1,
     [("rye crispbread", 20, "rye crispbreads (2)"), ("cottage cheese", 150, None), ("cherry tomatoes", 60, None), ("cucumber", 40, None)],
     ["Spread cottage cheese on the crispbreads.", "Top with sliced tomatoes and cucumber and season with pepper."],
     "A crunchy, savoury high-protein snack.", "Anyone needing an afternoon snack that won't derail a deficit.",
     ["Great before bed for slow-digesting protein.", "Add smoked salmon for an extra protein hit."], ["nhs-greek-yoghurt-raspberry-chill"])
meal("somax-chocolate-protein-yoghurt", "Somax Chocolate Protein Yoghurt Pot", "snack", "beginner", ["muscle", "fat-loss"], ["vegetarian", "high-protein", "gluten-free"], 3, 1,
     [("greek yogurt 0%", 200, "0% Greek yoghurt"), ("whey protein", 15, "chocolate whey (½ scoop)"), ("cocoa powder", 5, None), ("mixed berries", 60, None),
      ("dark chocolate 70%", 5, "dark chocolate, grated")],
     ["Whisk yoghurt, whey and cocoa until smooth.", "Top with berries and grated chocolate."],
     "A dessert-style snack with 30g protein.", "Anyone with a sweet tooth trying to hit protein targets.",
     ["Freeze for 30 minutes for a frozen-yoghurt texture.", "Use skyr instead of Greek yoghurt for a thicker pot."], ["nhs-greek-yoghurt-raspberry-chill"])
meal("somax-pre-workout-rice-cakes", "Somax Pre-Workout Rice Cakes", "snack", "beginner", ["endurance", "strength"], ["vegetarian", "dairy-free", "gluten-free"], 2, 1,
     [("rice cakes", 20, "rice cakes (2)"), ("peanut butter", 15, None), ("banana", 100, None), ("honey", 5, None)],
     ["Spread rice cakes with peanut butter.", "Top with banana slices and a drizzle of honey."],
     "Quick-digesting carbs to fuel a session 30-60 minutes later.", "Athletes training soon after work who need fast energy.",
     ["Eat 30-60 minutes before training.", "Skip the peanut butter if you train within 30 minutes."], ["nhs-porridge-yoghurt-berries"])
meal("somax-edamame-almond-snack-box", "Somax Edamame & Almond Snack Box", "snack", "beginner", ["general-fitness", "fat-loss"], ["vegan", "dairy-free", "gluten-free", "high-protein"], 5, 1,
     [("edamame (shelled)", 120, None), ("almonds", 15, None), ("apple", 120, None), ("pumpkin seeds", 10, None)],
     ["Defrost or briefly boil the edamame and season with salt and chilli.", "Pack with the almonds, seeds and a sliced apple."],
     "A plant-protein snack box for desks and bags.", "Vegans and busy people who snack on the go.",
     ["Prep 5 boxes on Sunday.", "Swap almonds for another nut or seed if needed."], ["nhs-tuna-bean-salad"])
meal("somax-smoked-salmon-egg-rye", "Somax Smoked Salmon & Egg Rye Plate", "breakfast", "beginner", ["muscle", "fat-loss"], ["high-protein", "dairy-free"], 10, 1,
     [("rye crispbread", 30, "rye bread or crispbread"), ("smoked salmon", 80, None), ("egg", 100, "eggs (2), poached"), ("spinach", 50, None), ("lemon juice", 5, None)],
     ["Poach the eggs for 3-4 minutes.", "Wilt the spinach.", "Serve the salmon and eggs over rye with spinach and lemon."],
     "A protein-packed, omega-3-rich savoury breakfast.", "Anyone wanting a lower-carb, high-protein morning plate.",
     ["Good on rest days.", "Add avocado when you need more calories."], ["nhs-haddock-florentine"])

json.dump(S, open(OUT_SRC, "w"), indent=2, ensure_ascii=False)
json.dump(M, open(OUT_SOMAX, "w"), indent=2, ensure_ascii=False)
print(len(S), "sourced meals,", len(M), "somax meals")
