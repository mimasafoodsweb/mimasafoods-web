# Deploy Supabase Edge Function for Payment Verification

## 🚀 Overview
Replace the separate Node.js backend with a Supabase Edge Function for payment verification. This eliminates the need to run a separate server.

## 📁 Files Created
- `supabase/functions/razorpay-verify-payment/index.ts` - Edge Function code

## 🔧 Setup Instructions

### Step 1: Install Supabase CLI
```bash
# Install Supabase CLI
npm install -g supabase

# Or using Homebrew
brew install supabase/tap/supabase
```

### Step 2: Login to Supabase
```bash
supabase login
```

### Step 3: Link to Your Project
```bash
# Get your project reference from Supabase dashboard
supabase link --project-ref your-project-ref
```

### Step 4: Set Environment Variables
```bash
# Set Razorpay secret for the Edge Function
supabase secrets set RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### Step 5: Deploy the Edge Function
```bash
# Deploy the function
supabase functions deploy razorpay-verify-payment
```

### Step 6: Verify Deployment
```bash
# List deployed functions
supabase functions list

# Test the function
supabase functions invoke razorpay-verify-payment \
  --data '{"razorpay_order_id":"test","razorpay_payment_id":"test","razorpay_signature":"test"}'
```

## 🌐 How It Works

### **Edge Function URL:**
```
https://your-project-ref.supabase.co/functions/v1/razorpay-verify-payment
```

### **Frontend Integration:**
```typescript
// The frontend now calls Supabase Edge Function instead of separate backend
const { data, error } = await supabase.functions.invoke('razorpay-verify-payment', {
  body: paymentData
});
```

### **Security Features:**
- ✅ **CORS Headers**: Properly configured for cross-origin requests
- ✅ **Environment Variables**: Secure secret storage
- ✅ **HMAC Verification**: Real cryptographic signature validation
- ✅ **Error Handling**: Comprehensive error responses

## 🔍 TypeScript Errors (Expected)

The TypeScript errors in the Edge Function are **expected** because:
1. **Deno Runtime**: Uses Deno-specific APIs (not Node.js)
2. **Supabase Environment**: Different from regular TypeScript
3. **Edge Runtime**: Specialized for serverless functions

**These errors don't affect deployment** - Supabase handles the runtime environment.

## 🚀 Benefits of Edge Function

### **Before (Separate Server):**
- ❌ Run separate Node.js server
- ❌ Manage server uptime
- ❌ Handle server deployment
- ❌ Monitor server health

### **After (Supabase Edge Function):**
- ✅ No separate server needed
- ✅ Auto-scaling
- ✅ Built-in monitoring
- ✅ Global CDN distribution
- ✅ Environment variable security

## 🧪 Testing

### **Local Development:**
```bash
# Start local Supabase
supabase start

# Test function locally
supabase functions serve razorpay-verify-payment
```

### **Production Testing:**
```bash
# Test with real data
curl -X POST \
  https://your-project-ref.supabase.co/functions/v1/razorpay-verify-payment \
  -H "Content-Type: application/json" \
  -d '{
    "razorpay_order_id": "order_123",
    "razorpay_payment_id": "pay_123",
    "razorpay_signature": "abc123..."
  }'
```

## 📋 Environment Variables Required

### **Supabase Edge Function:**
```bash
RAZORPAY_KEY_SECRET=your_live_razorpay_secret
```

### **Frontend (.env.local):**
```bash
VITE_RAZORPAY_KEY_ID=your_live_razorpay_key_id
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🎯 Migration Steps

1. **Deploy Edge Function** (above)
2. **Stop Separate Server** (no longer needed)
3. **Update Vite Config** (remove proxy)
4. **Test Payment Flow**
5. **Remove Server Files** (optional)

## ✅ Verification

Once deployed, your payment verification will:
- Handle Classic Checkout (accept payment_id)
- Handle Standard Checkout (verify signature)
- Work without separate backend server
- Scale automatically with Supabase

The Edge Function approach is much cleaner and more maintainable! 🎉
