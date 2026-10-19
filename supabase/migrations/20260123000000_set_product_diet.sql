-- Veg / non-veg tags (confirmed by the owner). Everything not listed below stays veg.
-- Only changes products still on the default 'veg', so later Admin edits are kept.
UPDATE products SET diet = 'nonveg'
WHERE diet = 'veg' AND name IN (
  'Butter Chicken', 'Dhaba Chicken', 'Fish Fry', 'Maharashtrian Chicken Curry',
  'Mutton Rogan Josh', 'Prawns Curry'
);
