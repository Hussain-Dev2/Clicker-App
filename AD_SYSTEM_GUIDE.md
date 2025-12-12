# Ad System Improvements & Strategy Guide

## Overview
This guide outlines the improved ad system with Adsterra and Google AdSense integration, including best practices, analytics, and optimization strategies.

---

## 📊 Ad Manager Features

### Centralized Ad Management (`lib/ads/ad-manager.ts`)
- **Event Tracking**: Track impressions, clicks, errors, and revenue
- **Metrics Dashboard**: Real-time performance monitoring
- **Ad Blocker Detection**: Detect and handle ad blockers gracefully
- **Automatic Refresh**: Set up ad refresh intervals
- **Responsive Ad Sizing**: Automatically select optimal ad sizes for viewports
- **Analytics Export**: Get all event data for debugging and analysis

#### Using Ad Manager
```typescript
import adManager from '@/lib/ads/ad-manager';

// Track an ad event
adManager.trackEvent({
  type: 'impression',
  network: 'adsense',
  slotId: 'YOUR_SLOT_ID',
  timestamp: Date.now(),
});

// Get metrics
const metrics = adManager.getMetrics('adsense');
console.log(metrics); // { impressions: 10, clicks: 2, errors: 0, revenue: 5.50 }

// Detect ad blockers
const isBlocked = await adManager.detectAdBlocker();

// Setup auto-refresh
adManager.setupAdRefresh('banner-1', () => {
  // Refresh callback
}, 60); // 60 seconds
```

---

## 🎯 Ad Placement Strategy

### Recommended Placements

#### 1. **Top Banner (Mobile-Friendly)**
- **Location**: Below header, above main content
- **Size**: 320x50 (mobile), 728x90 (desktop)
- **Component**: `<GoogleAdSlot variant="banner" />`
- **Best For**: Quick impressions, non-intrusive
- **Recommendation**: Show on every page

#### 2. **Content Sidebar (Desktop)**
- **Location**: Right sidebar or floating
- **Size**: 300x250 (rectangle) or 160x600 (wide skyscraper)
- **Component**: `<GoogleAdSlot variant="rectangle" />`
- **Best For**: Engaged users, high click-through rate
- **Recommendation**: Show on dashboard, shop, stats pages

#### 3. **Rewarded Video Ads (High Engagement)**
- **Location**: Dashboard, shop, rewards section
- **Network**: Adsterra
- **Component**: `<AdsterraRewarded />`
- **Reward**: 25 points per video
- **Cooldown**: 5 minutes
- **Daily Limit**: 10 videos/day
- **Best For**: Monetization without annoying users
- **Recommendation**: Primary monetization lever

#### 4. **Interstitial Ads (Strategic Moments)**
- **Location**: After level completion, shop purchases
- **Network**: Adsterra
- **Component**: `<InterstitialAd />`
- **Display**: Auto-close after 8 seconds
- **Best For**: High-value moments
- **Recommendation**: Use sparingly (1-2 times per session)

#### 5. **Native Ads (Seamless Integration)**
- **Location**: In lists, activity feeds
- **Network**: Adsterra
- **Component**: `<AdsterraNativeBar />`
- **Best For**: Feed-style content
- **Recommendation**: Alternate with content

---

## 🎬 Adsterra Rewarded Ads - Enhanced

### Features
- ✅ 10 video per day limit (prevents user fatigue)
- ✅ 5-minute cooldown between watches
- ✅ Better error handling with fallback messages
- ✅ Ad load timeout (15 seconds) with graceful failure
- ✅ Real-time countdown display
- ✅ Analytics integration via Ad Manager
- ✅ Better UI with emoji indicators

### Implementation
```tsx
import AdsterraRewarded from '@/components/ads/AdsterraRewarded';

<AdsterraRewarded
  onReward={(user, points) => {
    console.log(`User earned ${points} points`);
    // Update UI, show toast notification, etc
  }}
  onError={(message) => {
    console.error('Reward ad error:', message);
    // Show error to user
  }}
/>
```

### Metrics Tracked
- Video impressions
- Video clicks
- Load failures
- Revenue (points awarded)

---

## 🔍 Google AdSense - Improved

### Features
- ✅ Lazy loading with Intersection Observer
- ✅ Automatic refresh every 60 seconds (configurable)
- ✅ Responsive sizing (mobile, tablet, desktop)
- ✅ Better error messages
- ✅ Loading state indicators
- ✅ Analytics integration

### Variants
1. **Banner** (320x50 mobile, 728x90 desktop)
   - Quick impressions
   - High viewability
   
2. **Rectangle** (300x250)
   - High click-through rate
   - Best for engagement
   
3. **Fluid** (Responsive)
   - Best for feed content
   - Auto-sized

### Implementation
```tsx
import GoogleAdSlot from '@/components/ads/GoogleAdSlot';

// Auto-refresh every 60 seconds
<GoogleAdSlot 
  variant="rectangle" 
  refreshInterval={60}
  className="mb-4"
/>

// No refresh
<GoogleAdSlot 
  variant="banner"
/>
```

---

## 📱 Mobile Optimization

### Responsive Ad Sizing
AdManager automatically selects optimal sizes:
- **Mobile (<480px)**: 320x50 banner
- **Tablet (480-768px)**: 300x250 rectangle
- **Desktop (>768px)**: 728x90 leaderboard

Get optimal size:
```typescript
const size = adManager.getOptimalAdSize();
// Returns: { width: 300, height: 250, format: 'rectangle' }
```

### Mobile Best Practices
1. **Top sticky banner** for continuous impressions
2. **Rewarded ads** for opt-in engagement (preferred)
3. **Avoid** interstitials on mobile (high bounce rate)
4. **Responsive** ad units for all screen sizes

---

## 🛡️ Ad Blocker Handling

### Detection
```typescript
const isBlocked = await adManager.detectAdBlocker();
if (isBlocked) {
  // Show friendly message or alternative monetization
}
```

### Current Implementation
- `AdBlockDetector` component shows friendly warning
- Shows on dashboard when detected
- Encourages user to whitelist site
- Doesn't block functionality

### Display Message
```
"We noticed you're using an ad blocker.
Your support helps us keep the service free!
Please consider disabling it or supporting us."
```

---

## 📊 Analytics & Monitoring

### View Ad Manager Metrics
```typescript
import adManager from '@/lib/ads/ad-manager';

// Get all metrics
const allMetrics = adManager.getMetrics();
console.log(allMetrics);
// {
//   adsense: { impressions: 50, clicks: 5, errors: 0, revenue: 0 },
//   adsterra: { impressions: 30, clicks: 8, errors: 2, revenue: 200 }
// }

// Get specific network metrics
const adsenseMetrics = adManager.getMetrics('adsense');
const adsterraMetrics = adManager.getMetrics('adsterra');

// Get all events for debugging
const events = adManager.getEvents(100); // Last 100 events
```

### Expected Metrics
**Google AdSense:**
- CPM: $0.25-$5.00 (avg $1.50)
- CTR: 0.5%-2%
- Fill Rate: 50%-100%

**Adsterra Rewarded:**
- CPV: $0.10-$1.00 per video
- Completion Rate: 70%-90%
- Revenue share: 70-80%

---

## 🔧 Configuration

### Environment Variables
```env
# Google AdSense
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXX
NEXT_PUBLIC_ADSENSE_SLOT_ID=XXXXX
NEXT_PUBLIC_ADSENSE_SLOT_ID_ALT=XXXXX

# Adsterra
NEXT_PUBLIC_ADSTERRA_REWARDED_KEY=XXXXX
NEXT_PUBLIC_ADSTERRA_INTERSTITIAL_KEY=XXXXX
NEXT_PUBLIC_ADSTERRA_SOCIAL_BAR_KEY=XXXXX
NEXT_PUBLIC_ADSTERRA_NATIVE_BAR_KEY=XXXXX
```

### CSP Headers (next.config.js)
Already configured to allow:
- `pagead2.googlesyndication.com`
- `googleads.g.doubleclick.net`
- `www.highperformanceformat.com`
- `effectivegatecpm.com`
- `topcreativeformat.com`

---

## 🚀 Optimization Tips

### 1. **Maximize Adsterra Revenue**
- Focus on rewarded ads (user opt-in, 70-90% completion)
- Place in high-traffic areas (dashboard, shop)
- Encourage watching through UI/notifications
- Monitor completion rates

### 2. **Improve AdSense Performance**
- Test different ad placements
- Use responsive ad units
- Maintain 300x250 rectangles (highest CTR)
- Avoid ad stacking (multiple ads visible)

### 3. **Prevent Ad Fatigue**
- Limit rewarded ads to 10/day
- Use cooldowns (5 minutes between videos)
- Don't show multiple ads simultaneously
- Respect user preferences

### 4. **Monitor Quality**
- Track error rates
- Check ad load times
- Monitor bounce rates
- Exclude low-performing placements

---

## 🐛 Debugging

### Enable Development Logging
Add to `.env.local`:
```env
NODE_ENV=development
```

This will log all ad events to console:
```
[Ad Manager] IMPRESSION - adsense
[Ad Manager] LOAD - adsense
[Ad Manager] ERROR - adsterra
```

### Common Issues

**Ads Not Showing:**
1. Check environment variables are set
2. Verify domains in ad network dashboards
3. Disable ad blocker
4. Check CSP headers in Network tab
5. Verify slot IDs are correct

**Low Fill Rate:**
1. Wait 1-2 weeks after domain verification
2. Increase traffic
3. Check ad placement quality score
4. Verify audience is from allowed countries

**Ad Blockers:**
1. Show AdBlockDetector component
2. Offer premium/ad-free option
3. Use less intrusive ad placements
4. Focus on rewarded ads

---

## 📈 Expected Revenue

### Monthly Projections (per 1000 users)
**Google AdSense:**
- Daily page views: 5000
- CPM: $1.50
- Monthly revenue: ~$225

**Adsterra Rewarded:**
- Video views: 1000/day
- CPV: $0.30
- 70% revenue share
- Monthly revenue: ~$420

**Combined Monthly:** ~$645

---

## 🎯 Next Steps

1. ✅ Deploy AdManager and improved components
2. ⏳ Verify domains in Google AdSense & Adsterra dashboards
3. 📊 Monitor metrics for 1-2 weeks
4. 🔄 Optimize placements based on performance
5. 🚀 A/B test different ad formats
6. 💰 Explore premium/ad-free tier

---

## Resources

- [Google AdSense Help](https://support.google.com/adsense)
- [Adsterra Documentation](https://adsterra.com/publishers)
- [IAB Ad Standard Sizes](https://www.iab.com/wp-content/uploads/2016/12/IAB_Standard_Ads_6.0_final.pdf)
