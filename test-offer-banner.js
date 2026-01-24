// Test script to verify offer banner configuration
// This script helps you set up the offer_banner in config_settings table

console.log(`
📋 To set up the offer banner:

1. Go to your Supabase dashboard
2. Navigate to Table Editor
3. Select the 'config_settings' table
4. Insert a new record with:
   - name: 'offer_banner'
   - value: 'Special Offer: 20% OFF on all orders this weekend! 🎉'

5. Or run this SQL in Supabase SQL Editor:

INSERT INTO config_settings (name, value) 
VALUES ('offer_banner', 'Special Offer: 20% OFF on all orders this weekend! 🎉')
ON CONFLICT (name) DO UPDATE SET value = EXCLUDED.value;

6. The banner will appear in green below the "Free Delivery" text

🎨 Banner Features:
- Green gradient background (green-600 to green-500)
- White text with rounded corners
- Pulse animation for attention
- Responsive design for mobile/desktop
- Only displays if offer_banner value exists

💡 Example banner texts:
- "🔥 Flash Sale: 15% OFF today only!"
- "🎉 Festival Special: Buy 2 Get 1 FREE"
- "⚡ Limited Time: Free dessert on orders above ₹500"
- "🎁 New Customer Offer: 10% OFF first order"

🔄 To update the banner:
Just update the 'value' field in the config_settings table where name = 'offer_banner'
`);

// You can also test the configuration fetching directly:
// import { getOfferBanner } from './src/utils/cartConfig';
// getOfferBanner().then(banner => console.log('Current banner:', banner));
