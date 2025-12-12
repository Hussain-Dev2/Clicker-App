# Ad System Quick Start

## ✅ What's New

Your ad system has been significantly improved with:

1. **Ad Manager** - Centralized analytics and control
2. **Enhanced Components** - Better error handling, lazy loading, refresh
3. **Daily Limits** - Prevent rewarded ad abuse
4. **Real-time Metrics** - Track performance
5. **Mobile Optimization** - Responsive ad sizes
6. **Comprehensive Guides** - Full documentation

---

## 🚀 Getting Started

### 1. Check Environment Variables

Verify your `.env` file has:

```env
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-4681103183883079
NEXT_PUBLIC_ADSENSE_SLOT_ID=YOUR_SLOT_ID
NEXT_PUBLIC_ADSTERRA_REWARDED_KEY=28139013
NEXT_PUBLIC_ADSTERRA_INTERSTITIAL_KEY=28139013
```

### 2. Import and Use Components

```tsx
import GoogleAdSlot from '@/components/ads/GoogleAdSlot';
import AdsterraRewarded from '@/components/ads/AdsterraRewarded';

// In your page or component
<GoogleAdSlot variant="rectangle" refreshInterval={60} />
<AdsterraRewarded onReward={(user, points) => {...}} />
```

### 3. Monitor Performance

```tsx
import adManager from '@/lib/ads/ad-manager';
import { logAdReport, getAdMetricsSummary } from '@/lib/ads/ad-utils';

// View metrics
const summary = getAdMetricsSummary();
console.log(summary);
// { totalImpressions: 100, totalClicks: 5, avgCTR: 5%, ... }

// Log full report
logAdReport();
```

### 4. Deploy

```bash
# Build locally to test
npm run build

# Push to production
git add .
git commit -m "Improve ad system with analytics and optimizations"
git push
```

---

## 📊 Key Files

| File | Purpose |
|------|---------|
| `lib/ads/ad-manager.ts` | Core analytics engine |
| `lib/ads/ad-utils.ts` | Helper functions and reports |
| `components/ads/GoogleAdSlot.tsx` | Google AdSense component |
| `components/ads/AdsterraRewarded.tsx` | Rewarded video ads |
| `AD_SYSTEM_GUIDE.md` | Complete strategy guide |
| `AD_IMPROVEMENTS_SUMMARY.md` | What was improved |

---

## 🎯 Ad Manager Quick Reference

```typescript
import adManager from '@/lib/ads/ad-manager';

// Track events
adManager.trackEvent({
  type: 'impression' | 'click' | 'error' | 'load' | 'revenue',
  network: 'adsense' | 'adsterra',
  slotId?: 'your-slot-id',
  timestamp: Date.now(),
  value?: 25, // For revenue events
});

// Get metrics
const metrics = adManager.getMetrics(); // All networks
const adsenseMetrics = adManager.getMetrics('adsense'); // Single network

// Detect ad blockers
const isBlocked = await adManager.detectAdBlocker();

// Setup refresh
adManager.setupAdRefresh('banner-1', () => {
  console.log('Refreshing ad...');
}, 60); // 60 seconds

// Get events
const events = adManager.getEvents(100); // Last 100 events

// Clear data
adManager.clearAnalytics();
```

---

## 📱 Mobile Optimization

Auto-responsive ad sizing:

- **Mobile** (<480px): 320x50 banner
- **Tablet** (480-768px): 300x250 rectangle  
- **Desktop** (>768px): 728x90 leaderboard

```typescript
import { getAdSizeForViewport } from '@/lib/ads/ad-utils';

const size = getAdSizeForViewport();
// { width: 300, height: 250, format: 'rectangle' }
```

---

## 🛡️ Ad Blocker Handling

Users with ad blockers see a friendly message via `AdBlockDetector` component.

```tsx
import AdBlockDetector from '@/components/AdBlockDetector';

<AdBlockDetector /> // Shows warning if ad blocker detected
```

---

## 📈 Tracking Metrics

All ad events are automatically tracked:

```typescript
// Automatically tracks:
- Impressions (ads shown)
- Clicks (user interactions)
- Errors (load failures)
- Revenue (points awarded from rewarded ads)
```

View metrics anytime:

```typescript
import { getAdMetricsSummary, logAdReport } from '@/lib/ads/ad-utils';

// Console
logAdReport();

// Programmatic
const summary = getAdMetricsSummary();
console.log(`CTR: ${summary.avgCTR}%, CPM: ${summary.avgCPM}`);
```

---

## 🎬 Rewarded Ads Features

**New improvements:**
- ✅ 10 videos per day limit
- ✅ 5-minute cooldown between videos
- ✅ 30-second watch time (was 25s)
- ✅ Better error messages
- ✅ Real-time countdown
- ✅ Daily counter in UI

**Usage:**
```tsx
<AdsterraRewarded
  onReward={(user, points) => {
    // Show toast notification
    showToast(`Earned ${points} points!`);
    // Update user state
    setPoints(user.points);
  }}
  onError={(message) => {
    showError(message);
  }}
/>
```

---

## 🧪 Testing Locally

1. **Enable console logging:**
   ```env
   NODE_ENV=development
   ```

2. **Watch ad events:**
   Open DevTools → Console
   You'll see messages like:
   ```
   [Ad Manager] IMPRESSION - adsense
   [Ad Manager] LOAD - adsense
   [Ad Manager] ERROR - adsterra
   ```

3. **View metrics:**
   ```javascript
   // In console
   adManager.getMetrics()
   adManager.getEvents(10)
   ```

---

## 📊 Analytics Dashboard

Add to your admin panel:

```tsx
import { getAdMetricsSummary, generateAdReport } from '@/lib/ads/ad-utils';

export default function AdsDashboard() {
  const summary = getAdMetricsSummary();

  return (
    <div>
      <h2>Ad Performance</h2>
      <div>Impressions: {summary.totalImpressions}</div>
      <div>Clicks: {summary.totalClicks}</div>
      <div>CTR: {summary.avgCTR.toFixed(2)}%</div>
      <div>Revenue: ${summary.totalRevenue}</div>
      <pre>{generateAdReport()}</pre>
    </div>
  );
}
```

---

## 🔧 Configuration Tips

### Increase Ad Refresh
Show newer ads more often:
```tsx
<GoogleAdSlot refreshInterval={30} /> // Every 30 seconds
```

### Disable Refresh
For static content:
```tsx
<GoogleAdSlot refreshInterval={0} /> // No refresh
```

### Adjust Rewarded Limits
Edit `components/ads/AdsterraRewarded.tsx`:
```typescript
const MAX_DAILY_WATCHES = 15; // Was 10
const COOLDOWN_SECONDS = 180;  // Was 300
```

---

## 💡 Best Practices

1. **Place ads strategically**
   - Top: High visibility
   - Sidebar: Engaged users
   - Bottom: Secondary placement

2. **Use rewarded ads for monetization**
   - High completion rate (70-90%)
   - User opt-in (no annoyance)
   - 70-80% revenue share

3. **Monitor performance weekly**
   - Check CTR trends
   - Watch error rates
   - Track revenue

4. **Respect user experience**
   - Don't show multiple ads at once
   - Use reasonable cooldowns
   - Provide ad-free premium option

5. **Test placements**
   - A/B test different positions
   - Monitor which formats perform best
   - Optimize based on CTR/revenue

---

## 🐛 Troubleshooting

**Ads not showing:**
1. Check environment variables
2. Verify domains in ad network dashboards
3. Disable ad blocker
4. Check browser console for errors

**Low fill rate:**
1. Wait 1-2 weeks after deployment
2. Verify audience is from allowed countries
3. Check ad placement quality

**High error rate:**
1. Check network connectivity
2. Verify API keys are correct
3. Check CSP headers in DevTools

---

## 📞 Support

- **Google AdSense**: support.google.com/adsense
- **Adsterra**: adsterra.com/contact
- **Ad Manager**: Check console logs for detailed debugging

---

## 🎉 You're Ready!

Your improved ad system is now ready to use. 

**Next steps:**
1. ✅ Deploy to production
2. ⏳ Verify domains in ad networks (24-48 hours)
3. 📊 Monitor metrics
4. 🚀 Optimize based on data

Good luck with monetization! 🚀
