-- Devanagari product names (from the Heritage design mock, plus Butter Chicken and Paneer Tikka Masala supplied by the owner; client to confirm).
-- Only fills empty values, so names edited in Admin are never overwritten.
UPDATE products p SET name_devanagari = v.dev
FROM (VALUES
  ('Butter Chicken',              'बटर चिकन'),
  ('Chole Masala',                'छोले-राजमा'),
  ('Dhaba Chicken',               'ढाबा चिकन'),
  ('Fish Fry',                    'फिश फ्राई'),
  ('Hyderabadi Biryani',          'हैदराबादी बिरयानी'),
  ('Kolhapuri Misal',             'कोल्हापुरी मिसळ'),
  ('Maharashtrian Chicken Curry', 'महाराष्ट्रीयन चिकन करी'),
  ('Mild Misal',                  'माइल्ड मिसळ'),
  ('Mutton Rogan Josh',           'मटन रोगन जोश'),
  ('PaavBhaji Masala',            'पावभाजी'),
  ('Paneer Butter Masala',        'पनीर बटर'),
  ('Paneer Tikka Masala',         'पनीर टिक्का मसाला'),
  ('Prawns Curry',                'प्रॉन्स करी'),
  ('Shahi Biryani',               'शाही बिरयानी'),
  ('Tandoori Marinade',           'तंदूरी'),
  ('Veg Kadhai',                  'वेज कढ़ाई'),
  ('Veg Kolhapuri',               'वेज कोल्हापुरी')
) AS v(name, dev)
WHERE p.name = v.name AND (p.name_devanagari IS NULL OR p.name_devanagari = '');
