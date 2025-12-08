# 🎫 Manual Redemption Code System Guide

## Overview
This system allows you to sell digital products (Google Play, iTunes, Steam codes, etc.) with **manual redemption codes** that you add yourself. Users can purchase even when out of stock and will receive their codes within 2 days.

---

## 🚀 How It Works

### For Users:

1. **Browse Shop** (`/shop`)
   - View all available products
   - Filter by category (Google Play, iTunes, Steam, etc.)
   - See product images, values, and prices

2. **Purchase Product**
   - Click "Buy Now" button
   - Two scenarios:
     - ✅ **Code Available**: Instant scratch card with code
     - ⏳ **Out of Stock**: Order placed, notification sent: "Will be delivered in less than 2 days"

3. **Receive Notification** (`/inbox`)
   - Pending orders show: "⏳ Order Pending - Will arrive in less than 2 days"
   - When admin adds codes: "🎁 Your Order is Ready!"
   - Unread count badge in header

4. **View Purchases** (`/purchases`)
   - See all orders (pending and delivered)
   - Pending orders show countdown message
   - Delivered orders can be scratched to reveal code
   - Copy code to clipboard
   - Mark as used/unused

---

### For Admin:

1. **Create Products** (`/admin` → Products tab)
   - Title: "Google Play $10 Gift Card"
   - Description: "Redeem on Google Play Store"
   - Cost: 10000 points ($1 = 1000 points recommended)
   - Category: "Google Play"
   - Value: "$10"
   - Image URL: https://example.com/googleplay.jpg
   - Stock: Leave empty (will auto-update from codes)

2. **Add Redemption Codes** (`/admin` → Codes tab)
   - Select product from dropdown
   - See statistics: Available / Used / Total
   - Paste codes (one per line):
     ```
     ABCD-1234-EFGH-5678
     IJKL-9012-MNOP-3456
     QRST-3456-UVWX-7890
     ```
   - Click "Add Codes"
   - System automatically:
     - Updates product stock count
     - Delivers codes to pending orders (oldest first)
     - Sends notifications to users

3. **Manage Codes**
   - View all codes for a product
   - Green badge: Available
   - Red badge: Used (shows date)
   - Delete unused codes (used codes cannot be deleted)

---

## 📋 Code Management Workflow

### Scenario 1: Codes Available
```
User buys product → Gets code instantly → Scratch to reveal → Copy & use
```

### Scenario 2: Out of Stock
```
User buys product → Order marked "pending" → Gets notification: "2 days"
                     ↓
Admin adds codes → System auto-delivers → User notified → Code ready
```

### Scenario 3: Bulk Code Addition
```
Admin pastes 50 codes → System checks for duplicates → Adds new codes
                         ↓
5 pending orders exist → System delivers to oldest 5 orders
                         ↓
45 codes remain available → Stock updated to 45
```

---

## 🎨 Product Examples

### Google Play Gift Cards
```typescript
Title: "Google Play $10 Gift Card"
Category: "Google Play"
Value: "$10"
Cost: 10000 points
Image: https://i.imgur.com/googleplay10.jpg

Codes Format: XXXX-XXXX-XXXX-XXXX
```

### iTunes/Apple Gift Cards
```typescript
Title: "iTunes $25 Gift Card"
Category: "iTunes"
Value: "$25"
Cost: 25000 points
Image: https://i.imgur.com/itunes25.jpg

Codes Format: XXXXXXXXXXXX
```

### Steam Wallet Codes
```typescript
Title: "Steam $50 Wallet Code"
Category: "Steam"
Value: "$50"
Cost: 50000 points
Image: https://i.imgur.com/steam50.jpg

Codes Format: XXXXX-XXXXX-XXXXX
```

### Mobile Game Currency
```typescript
Title: "Mobile Legends 1000 Diamonds"
Category: "Mobile Legends"
Value: "1000 Diamonds"
Cost: 15000 points
Image: https://i.imgur.com/ml1000.jpg

Codes Format: Custom redemption codes
```

---

## 🔔 Notification System

### Notification Types:

1. **Order Pending** (⏳)
   ```
   Title: "Order Pending"
   Message: "Thank you for purchasing [Product]!
            Your order will be delivered in less than 2 days.
            You'll receive a notification when your code is ready."
   ```

2. **Order Delivered** (🎁)
   ```
   Title: "Your Order is Ready!"
   Message: "Your [Product] has been delivered!
            You can now view your redemption code in the Purchases page.
            Click 'View Order' below to see your code."
   ```

3. **System Notifications** (📢)
   - Welcome messages
   - Promotions
   - Important updates

---

## 🗄️ Database Structure

### RedemptionCode Table
```prisma
model RedemptionCode {
  id          String   @id @default(cuid())
  product     Product  @relation(...)
  productId   String
  code        String   @unique     // Actual redemption code
  isUsed      Boolean  @default(false)
  orderId     String?               // Which order claimed this
  usedAt      DateTime?
  createdAt   DateTime @default(now())
}
```

### Order Updates
```prisma
model Order {
  ...existing fields...
  status       String   @default("pending")  // "pending" | "delivered"
  deliveredAt  DateTime?                      // When code was assigned
}
```

### Notification Table
```prisma
model Notification {
  id          String   @id @default(cuid())
  userId      String
  type        String                          // Type of notification
  title       String
  message     String   @db.Text
  orderId     String?                         // Link to order
  isRead      Boolean  @default(false)
  createdAt   DateTime @default(now())
}
```

---

## 🔄 Auto-Delivery Process

When admin adds codes:

1. **Check Pending Orders**
   - Find all orders with `status = "pending"` for this product
   - Sort by `createdAt` (oldest first)

2. **Assign Codes**
   - Take first available unused code
   - Update order: `status = "delivered"`, add `redeemCode`
   - Mark code: `isUsed = true`, add `orderId`
   - Create notification for user

3. **Update Stock**
   - Count remaining unused codes
   - Update product stock

4. **Repeat**
   - Continue until no pending orders OR no codes left

---

## 📱 User Interface

### Header Badge
```tsx
📬 Inbox [3]  // Red badge with unread count
```

### Inbox Page
- Unread notifications highlighted in blue
- "Mark all as read" button
- Click notification to mark as read
- "View Order" link for order-related notifications

### Purchases Page
- **Pending Orders**: Yellow "⏳ Order Pending" message
- **Delivered Orders**: Scratch card or revealed code
- Copy button for revealed codes
- Mark as used/unused toggle

---

## ⚙️ Admin Configuration

### Recommended Pricing
```
$1 USD = 1000 points

Examples:
$5 card   = 5,000 points
$10 card  = 10,000 points
$25 card  = 25,000 points
$50 card  = 50,000 points
$100 card = 100,000 points
```

### Code Format Guidelines
- Use clear, readable formats (avoid 0/O, 1/I/l)
- Standard: XXXX-XXXX-XXXX-XXXX
- iTunes: XXXXXXXXXXXX (16 chars)
- Custom: Whatever the provider uses

### Stock Management
- Stock auto-updates when adding/deleting codes
- "Available" = unused codes count
- Users can buy even if stock = 0 (pending order)

---

## 🚨 Important Notes

### Security
- Only admins can add/delete codes
- Codes are unique (duplicates rejected)
- Used codes cannot be deleted
- Codes revealed only to purchaser

### User Experience
- 2-day delivery promise
- Email-style inbox notifications
- Scratch card animation for excitement
- Easy copy-to-clipboard

### Admin Tools
- Bulk code upload (paste many at once)
- Code status tracking (available/used)
- Auto-delivery to pending orders
- Duplicate detection

---

## 🎯 Quick Start Checklist

### Initial Setup:
- [x] Database migrated with new models
- [x] Admin account created
- [x] First product added

### Add First Product:
1. Go to `/admin` → Products tab
2. Click "Add New Product"
3. Fill in details (Google Play $10 example)
4. Submit

### Add Codes:
1. Go to `/admin` → Codes tab
2. Select product
3. Paste codes (one per line)
4. Click "Add Codes"

### Test Purchase:
1. Create test user account
2. Give yourself points (admin can edit user)
3. Buy product from shop
4. Check inbox for notification
5. View purchase and reveal code

---

## 🐛 Troubleshooting

### Codes Not Delivering
- Check if codes exist for product
- Verify order status is "pending"
- Check notification was created
- Refresh purchases page

### Duplicate Code Error
- Code already exists in database
- Remove duplicate and try again
- Each code must be unique across all products

### User Not Receiving Notification
- Check inbox page directly (`/inbox`)
- Verify user ID matches order
- Check notification table in database

---

## 📞 API Endpoints

### User Endpoints:
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications/[id]/read` - Mark as read
- `POST /api/notifications/read-all` - Mark all as read
- `POST /api/store/buy` - Purchase product
- `GET /api/store/purchases` - Get user purchases

### Admin Endpoints:
- `GET /api/admin/codes/[productId]` - Get codes for product
- `POST /api/admin/codes` - Add new codes
- `DELETE /api/admin/codes/[codeId]` - Delete unused code

---

## 🎉 Success!

Your manual redemption code system is now fully functional! Users can purchase digital products, receive notifications, and get their codes delivered automatically when you add new inventory.
