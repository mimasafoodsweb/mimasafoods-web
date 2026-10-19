-- Method of preparation (transcribed from each product's BACK pack image; obvious typos corrected).
-- Replaces the unused preparation_steps column from the heritage redesign migration.
-- Only fills empty values, so anything edited in Admin is never overwritten.
ALTER TABLE products ADD COLUMN IF NOT EXISTS preparation_method text[];
ALTER TABLE products DROP COLUMN IF EXISTS preparation_steps;

UPDATE products SET preparation_method = ARRAY[
    'Take 500 gm boneless chicken and 100gm hung curd, marinade with spice mix powder given, and saute in pan with 1 teaspoon of butter',
    'In another pan, add 2-3 spoon of butter, add MIMASA Butter Chicken Makhani Gravy, add required water',
    'Saute for 2 - 3 mins, then add boneless chicken. Then add some milk to adjust consistency',
    'Add fresh cream and coriander for garnishing',
    'Serve hot with butter naan and jeera rice.'
  ]
  WHERE name = 'Butter Chicken' AND (preparation_method IS NULL OR cardinality(preparation_method) = 0);

UPDATE products SET preparation_method = ARRAY[
    'Add 250gm soaked chickpeas along with 125gm of MIMASA Chole Gravy Paste.',
    'Add water as per required, bring to a boil, pressure cook for 4–5 whistles.',
    'Add salt to taste if required.',
    'Garnish with fresh coriander leaves, serve hot with Bhatura or Roti or Rice.'
  ]
  WHERE name = 'Chole Masala' AND (preparation_method IS NULL OR cardinality(preparation_method) = 0);

UPDATE products SET preparation_method = ARRAY[
    'Heat 2-4 tbsp oil in a pan. Add 500 gm cleaned and washed Chicken pieces, stir fry for 2-3 mins.',
    'Add 125 gm of Mimasa Dhaba Chicken Curry and saute for a few mins.',
    'Add boiling water as required. Cover and cook for 10-15 mins on medium flame or until cooked.',
    'Add Salt if required. Garnish with fresh coriander leaves and mix well, serve hot with Roti and jeera rice.'
  ]
  WHERE name = 'Dhaba Chicken' AND (preparation_method IS NULL OR cardinality(preparation_method) = 0);

UPDATE products SET preparation_method = ARRAY[
    'Wash 1 Kg of Fish and add 1½ tsp Salt.',
    'Apply the MIMASA Fish Fry Marinade Paste evenly and coat with rice flour or semolina'
  ]
  WHERE name = 'Fish Fry' AND (preparation_method IS NULL OR cardinality(preparation_method) = 0);

UPDATE products SET preparation_method = ARRAY[
    'In bowl add 1 tbsp of oil, and turmeric in 300 gms of veggies or 400 gms of chicken add 100 gm hung curd and MIMASA Hyderabadi Biryani Gravy Paste. Mix well and keep aside for 15 to 20 mins.',
    'Heat 2 tbsp oil/ghee, add Veggies. Add required water, cover and cook for 8-10 mins.',
    'In another vessel take 350 gm basmati rice (soaked for half an hour) and cook upto approx 80%',
    'In thick bottom vessel, add 2-3 tbsp of ghee, spread some gravy, then 80% cooked rice half quantity. Then spread remaining gravy, and sprinkle some coriander and mint leaves and fried cashews, cook for 8 to 10 mins on low flame.',
    'Use coal for smoky flavour (optional).',
    'Serve hot with Raita.'
  ]
  WHERE name = 'Hyderabadi Biryani' AND (preparation_method IS NULL OR cardinality(preparation_method) = 0);

UPDATE products SET preparation_method = ARRAY[
    'Take 125gm Mataki or any mixed sprouts, add a pinch of salt and turmeric and cook for 10 min.',
    'Heat 2 tbsp of oil in a kadhai, add 125gm of MIMASA Spicy Kolhapuri Misal Curry Paste, cook until oil separates.',
    'Add cooked sprouts along with 700 ml boiling water, bring to boil, simmer for 5 mins. Add fresh coriander leaves and mix well.',
    'Serving: Take above sprout gravy into the bowl, add farsan, and chopped onion to it. Garnish with fresh coriander leaves and serve hot with pav with lemon slice.'
  ]
  WHERE name = 'Kolhapuri Misal' AND (preparation_method IS NULL OR cardinality(preparation_method) = 0);

UPDATE products SET preparation_method = ARRAY[
    'Heat 2-4 tbsp oil in a pan. Add 500 gm cleaned and washed Chicken pieces, stir fry for 2-3 mins.',
    'Add 125 gm of Mimasa Maharashtrian Chicken Curry and saute for a few mins.',
    'Add boiling water as required. Cover and cook for 10-15 mins on medium flame or until cooked.',
    'Add Salt if required. Garnish with fresh coriander leaves and mix well, serve hot with Roti and jeera rice.'
  ]
  WHERE name = 'Maharashtrian Chicken Curry' AND (preparation_method IS NULL OR cardinality(preparation_method) = 0);

UPDATE products SET preparation_method = ARRAY[
    'Take 125 gms of any sprouts, add a pinch of salt and turmeric and cook for 10 min.',
    'Heat 2 tbsp of oil in a kadhai, add 125gm of MIMASA Misal | Usal Curry Paste, cook until oil separates.',
    'Add cooked sprouts along with 700 ml boiling water, bring to boil, simmer for 5 mins. Add fresh coriander leaves and mix well.',
    'Serving: Take above sprout gravy into the bowl, add farsan, and chopped onion to it. Garnish with fresh coriander leaves and serve hot with pav with lemon slice.'
  ]
  WHERE name = 'Mild Misal' AND (preparation_method IS NULL OR cardinality(preparation_method) = 0);

UPDATE products SET preparation_method = ARRAY[
    'Marinate 500 gm of washed and cleaned Mutton pieces with 125 gm of Mimasa Mutton Rogan Josh Masala.',
    'Heat 2-3 tbsp of oil/Ghee in a pressure pan. Add marinated mutton pieces & saute till oil separates.',
    'Add 400ml boiling water or as required and pressure cook with 4-5 whistles or until done.',
    'Add Salt if required and mix well. Garnish with the fresh coriander leaves, serve hot with Chapati or Paratha or Rice.'
  ]
  WHERE name = 'Mutton Rogan Josh' AND (preparation_method IS NULL OR cardinality(preparation_method) = 0);

UPDATE products SET preparation_method = ARRAY[
    'Take 500-750 gms of boiled and smashed mix veggies like potato cauliflower green peas etc.',
    'Take a spoonful of butter in a pan add MIMASA Pav Bhaji Gravy Paste 125 grams',
    'Add smashed vegetables and approx 500 ml of water or as per required',
    'Boil for 4/5 minutes',
    'Add salt if required',
    'Garnish with fresh coriander leaves'
  ]
  WHERE name = 'PaavBhaji Masala' AND (preparation_method IS NULL OR cardinality(preparation_method) = 0);

UPDATE products SET preparation_method = ARRAY[
    'Add 2 to 3 tbsp butter in a pan and Mimasa Paneer Butter Makhani Gravy 125 gms and saute for 2 to 3 minutes',
    'Add 300 gms of soft Paneer Cube and cook for 5 mins',
    'Add 200ml water and 100 ml milk to adjust consistency',
    'Add fresh cream and garnish with coriander leaves serve hot with butter naan and jeera rice'
  ]
  WHERE name = 'Paneer Butter Masala' AND (preparation_method IS NULL OR cardinality(preparation_method) = 0);

UPDATE products SET preparation_method = ARRAY[
    'Take 250 gm paneer and 100gm onion and capsicum cubes each, marinade with spice mix powder given, and 100gm hung curd and saute in pan with 1 teaspoon of butter',
    'In another pan, add 2-3 spoon of butter, add MIMASA Paneer Tikka Makhani Gravy, add required water',
    'Saute for 2 - 3 mins, then add paneer and veggies cubes. Then add some milk to adjust consistency',
    'Add fresh cream and Coriander leaves for garnishing',
    'Serve hot with butter naan and jeera rice.'
  ]
  WHERE name = 'Paneer Tikka Masala' AND (preparation_method IS NULL OR cardinality(preparation_method) = 0);

UPDATE products SET preparation_method = ARRAY[
    'Take 500 gm of medium-sized prawns, clean and devein them properly.',
    'Add 1 tsp salt and 1 tsp turmeric and mix well. Keep it aside for 10–15 mins.',
    'Heat 2 tbsp oil in a kadhai. Add 125 gm of Mimasa Prawns Curry Paste & saute for 2 mins.',
    'Add prawns & add hot water as required and cook for 10 mins.'
  ]
  WHERE name = 'Prawns Curry' AND (preparation_method IS NULL OR cardinality(preparation_method) = 0);

UPDATE products SET preparation_method = ARRAY[
    'In bowl add 1 tbsp of oil, and turmeric in 500gm chicken or 300gm mixed veggies, add 100 gm hung curd and MIMASA Biryani Gravy Paste Mix well and keep aside for 15 to 20 mins',
    'Heat 2 tbsp oil/ ghee, add Marinade Chicken or Veggies. Add required water, cover and cook for 8-10 mins',
    'In another vessel take 350 gm basmati rice (soaked for half an hour) and cook upto approx 80%',
    'In thick bottom vessel, add 2-3 tbsp of ghee, spread some gravy, then 80% cooked rice half quantity. Then spread remaining gravy, and sprinkle some coriander and mint leaves and fried cashews, cook for 8 to 10 mins on low flame',
    'Use coal for smoky flavour (optional)',
    'Serve hot with Raita'
  ]
  WHERE name = 'Shahi Biryani' AND (preparation_method IS NULL OR cardinality(preparation_method) = 0);

UPDATE products SET preparation_method = ARRAY[
    'Wash 1 kg of Chicken or 750 gm Paneer, Onion, Capsicum, and add 1 tsp salt to it.',
    'Add 125gm of MIMASA Tandoori Marinade Paste to 100 gm of hung curd. Marinade evenly with all sides.',
    'Roast in a Tandoor, Grill or oven or fry it in butter on a grilled pan.',
    'Squeeze some lemon juice and sprinkle chaat masala over it and serve hot.'
  ]
  WHERE name = 'Tandoori Marinade' AND (preparation_method IS NULL OR cardinality(preparation_method) = 0);

UPDATE products SET preparation_method = ARRAY[
    'Heat 2 tbsp oil in a pan. Add 500 gms Mixed vegetables like Cauliflower, Carrots, French beans, Green Peas, Capsicum etc., as required. Stir fry for 2 mins.',
    'Add "Mimasa VEG KADHAI Gravy Paste 125g" and saute for a few mins.',
    'Add 400ml warm water or as required. Cover and Cook for 10-15 mins on medium flame.',
    'Add Salt if required. Garnish with fresh coriander leaves and mix well. Serve hot with Roti and Jeera Rice!!'
  ]
  WHERE name = 'Veg Kadhai' AND (preparation_method IS NULL OR cardinality(preparation_method) = 0);

UPDATE products SET preparation_method = ARRAY[
    'Heat 2 tbsp oil in a pan. Add 500 gms mixed vegetables like Cauliflower, Carrots, French beans, green peas, Capsicum etc. as required, stir fry for 2 mins.',
    'Add 125 gm of MIMASA Veg Kolhapuri Gravy Paste and saute for a few mins.',
    'Add 400 ml warm water or as required. Cover and cook for 10-15 mins on medium flame.',
    'Add Salt if required. Garnish with fresh coriander leaves and mix well, serve hot with Roti and jeera rice.'
  ]
  WHERE name = 'Veg Kolhapuri' AND (preparation_method IS NULL OR cardinality(preparation_method) = 0);
