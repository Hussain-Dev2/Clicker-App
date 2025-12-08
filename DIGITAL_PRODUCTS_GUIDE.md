# 🎁 Digital Products Store System

## Overview
Your clicker app now has a complete digital products store where users can purchase gift cards, game codes, and premium subscriptions using their earned points!

## ✨ Features

### 🛒 For Users

1. **Browse Digital Products**
   - Beautiful product cards with images
   - Categories: Google Play, iTunes, Steam, PlayStation, Xbox, Nintendo, Game Codes, Premium
   - Product values clearly displayed ($10, $25, etc.)
   - Real-time stock availability
   - Category filtering

2. **Purchase Products**
   - Buy with earned points
   - Instant purchase validation
   - Stock management (unlimited or limited)
   - Insufficient points warning

3. **Scratch-to-Reveal Codes** 🎉
   - Interactive scratch card animation
   - Reveal redeem codes by scratching
   - Skip option available
   - Copy code button
   - Progress indicator

4. **Purchase History**
   - View all purchased codes at `/purchases`
   - Re-reveal codes anytime
   - Copy codes easily
   - Mark codes as used/unused
   - Filter by category
   - See purchase dates and values

### ⚙️ For Admins

1. **Product Management** (at `/admin`)
   - Create new products
   - Edit existing products
   - Delete products
   - Set product images, categories, values
   - Manage stock (unlimited or limited)
   - Set point costs

2. **Product Fields**
   - Title (required)
   - Description
   - Cost in Points (required)
   - Image URL
   - Category (Google Play, iTunes, Steam, etc.)
   - Value ($10, $25, 100 Diamonds, etc.)
   - Stock (null = unlimited)

## 🚀 Getting Started

### 1. Set Up Admin Access
```bash
# First, register at http://localhost:3000/register
# Then visit http://localhost:3000/admin-setup
# Use secret key: admin123secret
```

### 2. Add Sample Products
```bash
npx tsx prisma/seed-digital-products.ts
```

This will create 10 sample products including:
- Google Play Gift Cards
- iTunes Gift Cards
- Steam Wallet Codes
- PlayStation Network Cards
- Xbox Gift Cards
- Nintendo eShop Cards
- Mobile Legends Diamonds
- Free Fire Diamonds
- Spotify Premium
- Netflix Gift Cards

### 3. Access the Store
- **Shop**: http://localhost:3000/shop
- **Purchases**: http://localhost:3000/purchases
- **Admin**: http://localhost:3000/admin

## 📋 How It Works

### Purchase Flow
1. User browses products in the shop
2. Clicks "Buy Now" on a product
3. System validates:
   - User has enough points
   - Product is in stock
   - User is authenticated
4. Generates unique redeem code (format: XXXX-XXXX-XXXX-XXXX)
5. Deducts points from user
6. Decrements stock (if not unlimited)
7. Shows scratch card modal
8. User scratches to reveal code
9. Code is saved in purchase history

### Code Generation
- Format: 4 segments of 4 characters
- Example: `A2B3-C4D5-E6F7-G8H9`
- Uses uppercase letters (no I, O) and numbers (no 0, 1) to avoid confusion
- Each code is unique per purchase

## 🎨 Customization

### Adding Product Images
You can use:
- Direct image URLs
- Image hosting services (Imgur, Cloudinary)
- Your own CDN

Example image URLs in the admin panel:
```
https://example.com/google-play-card.png
https://imgur.com/your-image.jpg
```

### Product Categories
Suggested categories:
- Google Play
- iTunes
- Steam
- PlayStation
- Xbox
- Nintendo
- Game Codes
- Gift Cards
- Premium
- Subscriptions

### Setting Product Values
Examples:
- `$10`, `$25`, `$50` for gift cards
- `100 Diamonds`, `500 Diamonds` for game currencies
- `1 Month`, `3 Months` for subscriptions

## 📊 Database Schema

### Order Table
```prisma
model Order {
  id           String   @id @default(cuid())
  userId       String
  productId    String
  cost         Int
  redeemCode   String?  // The redemption code
  isRevealed   Boolean  @default(false)
  isUsed       Boolean  @default(false)
  createdAt    DateTime @default(now())
}
```

### Product Table
```prisma
model Product {
  id          String   @id @default(cuid())
  title       String
  description String?
  costPoints  Int
  stock       Int?     // null = unlimited
  imageUrl    String?
  category    String?
  value       String?
  isDigital   Boolean  @default(true)
  createdAt   DateTime @default(now())
}
```

## 🔧 API Endpoints

### Store Endpoints
- `POST /api/store/buy` - Purchase a product
- `GET /api/store/purchases` - Get user's purchases
- `POST /api/store/reveal-code` - Mark code as revealed
- `POST /api/store/toggle-used` - Toggle used status

### Admin Endpoints
- `GET /api/admin/products` - List all products
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/[id]` - Update product
- `DELETE /api/admin/products/[id]` - Delete product

## 🎯 User Experience

### Shop Page Features
- Hover effects on product cards
- Category badges
- Value badges (displayed prominently)
- Stock indicators (color-coded)
- "Not enough points" warnings
- Category filtering
- Responsive grid layout

### Scratch Card Features
- Touch/mouse support
- Smooth scratching animation
- Progress bar showing reveal percentage
- Auto-reveal at 50% scratched
- Skip scratch option
- Copy code button
- Success animations

### Purchase History Features
- Chronological order (newest first)
- Product thumbnails
- Category and value badges
- Reveal unrevealed codes
- Copy codes easily
- Mark as used/unused
- Purchase dates
- Empty state with call-to-action

## 💡 Tips for Success

1. **Set Appropriate Prices**
   - Balance point earning rate with product costs
   - Consider $1 = 1000 points as a baseline
   - Offer varied price points

2. **Manage Stock Wisely**
   - Use unlimited for digital codes you can regenerate
   - Set limits for actual purchased gift cards
   - Monitor stock levels regularly

3. **Use Quality Images**
   - Official brand logos work best
   - Minimum 400x400px recommended
   - PNG or JPG format

4. **Category Organization**
   - Keep categories consistent
   - Use recognizable platform names
   - Don't create too many categories

5. **Product Descriptions**
   - Be clear about what users get
   - Mention platform/game if applicable
   - Keep it concise (1-2 sentences)

## 🔒 Security Notes

- Codes are stored in the database
- Only purchase owner can access their codes
- Admin authentication required for product management
- Point transactions are atomic (all-or-nothing)
- Stock decrements are protected against race conditions

## 📱 Mobile Responsive

All features work perfectly on:
- Desktop browsers
- Tablets
- Mobile phones
- Touch devices (scratch feature)

## 🎉 Next Steps

1. ✅ Register your account
2. ✅ Set yourself as admin
3. ✅ Seed sample products or create your own
4. ✅ Test the purchase flow
5. ✅ Customize product images and categories
6. ✅ Set up your real product inventory
7. ✅ Share with users!

Enjoy your new digital products store! 🚀
