-- Storefront settings in cart_config: social links and the Google Sheet enquiry endpoint.
INSERT INTO cart_config (name, value) VALUES
  ('enquiry_sheet_url', 'https://script.google.com/macros/s/AKfycbzA8hE6HA1Qhstrk8Ndmi_KgyvFttqgXdNyAApEbZ2X54f1I7eaell_TF78vIzSPibCbQ/exec'),
  ('social_facebook',   'https://www.facebook.com/share/188VMCCLgC/'),
  ('social_instagram',  'https://www.instagram.com/mimasa_foods?vrfl=MThnZDhhcGo2OXN0MA==')
ON CONFLICT (name) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW();
