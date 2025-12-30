/**
 * Debug script to verify environment variables are loaded correctly
 * Run this in your browser console or temporarily import in your app
 */
export function debugEnvironmentVariables() {
  console.log('=== Environment Variables Debug ===');
  console.log('VITE_BREVO_API_KEY:', import.meta.env.VITE_BREVO_API_KEY ? '✅ Found' : '❌ Not found');
  console.log('VITE_RAZORPAY_KEY_ID:', import.meta.env.VITE_RAZORPAY_KEY_ID ? '✅ Found' : '❌ Not found');
  
  console.log('\nAll VITE_ environment variables:');
  Object.keys(import.meta.env)
    .filter(key => key.startsWith('VITE_'))
    .forEach(key => {
      const value = import.meta.env[key];
      console.log(`${key}: ${value ? value.substring(0, 10) + '...' : 'undefined'}`);
    });
    
  console.log('\n=== Troubleshooting Steps ===');
  if (!import.meta.env.VITE_BREVO_API_KEY) {
    console.log('1. Make sure you have a .env.local file in the project root');
    console.log('2. Add this line to .env.local: VITE_BREVO_API_KEY=your_actual_api_key');
    console.log('3. Restart your development server (npm run dev)');
    console.log('4. Make sure the API key starts with "xkeysib-"');
  }
}

// Auto-run if this file is imported
debugEnvironmentVariables();
