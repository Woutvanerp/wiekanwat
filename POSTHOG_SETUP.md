# PostHog Setup Guide

## 📊 PostHog Analytics Integration

PostHog has been set up in your Next.js application for the EU region.

### 🔑 Setup Instructions

1. **Create a PostHog Account**
   - Go to [https://eu.posthog.com/signup](https://eu.posthog.com/signup)
   - Sign up for a free account (EU region)

2. **Get Your Project API Key**
   - After signing up, you'll be given a **Project API Key**
   - It looks like: `phc_xxxxxxxxxxxxxxxxxxxxxxxxxx`

3. **Configure Environment Variables**
   
   Open your `.env.local` file and add:
   ```bash
   NEXT_PUBLIC_POSTHOG_KEY=phc_your_actual_key_here
   NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
   ```

   If `.env.local` doesn't exist, copy `.env.local.example`:
   ```bash
   cp .env.local.example .env.local
   ```
   Then edit it with your actual PostHog key.

4. **Restart Your Dev Server**
   ```bash
   npm run dev
   ```

### ✅ What's Already Configured

- ✅ PostHog SDK installed (`posthog-js`)
- ✅ Provider set up in `app/providers.js`
- ✅ Integrated in `app/layout.js`
- ✅ Automatic pageview tracking
- ✅ EU region configured
- ✅ Privacy-focused (identified_only person profiles)

### 📈 What PostHog Will Track

- **Pageviews**: Automatically tracks all page visits
- **User sessions**: Tracks user behavior across your app
- **Custom events**: You can add custom tracking anywhere in your code

### 🎯 Adding Custom Events

To track custom events in your components:

```javascript
import { usePostHog } from 'posthog-js/react'

function YourComponent() {
  const posthog = usePostHog()

  const handleButtonClick = () => {
    posthog?.capture('button_clicked', {
      button_name: 'Add Employee',
      page: 'Dashboard'
    })
  }

  return <button onClick={handleButtonClick}>Click me</button>
}
```

### 🔒 Privacy & GDPR Compliance

PostHog is configured with:
- EU data hosting (data stays in EU)
- `person_profiles: 'identified_only'` - only creates profiles for logged-in users
- No automatic PII collection
- GDPR compliant

### 🚀 Next Steps

1. Add your PostHog API key to `.env.local`
2. Restart the dev server
3. Open your app in the browser
4. Check PostHog dashboard to see events coming in!

### 📚 Resources

- [PostHog Documentation](https://posthog.com/docs)
- [Next.js Integration Guide](https://posthog.com/docs/libraries/next-js)
- [Event Tracking](https://posthog.com/docs/product-analytics/capture-events)

