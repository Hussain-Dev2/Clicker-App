import { prisma } from '../lib/prisma';

async function seedDigitalProducts() {
  console.log('🌱 Seeding digital products...');

  const products = [
    {
      title: 'Google Play $10 Gift Card',
      description: 'Redeem $10 on Google Play Store for games, apps, movies & more',
      costPoints: 10000,
      stock: 50,
      imageUrl: 'https://play-lh.googleusercontent.com/WNWZaxi9RdJKe2GQM3vqXIAkk69mnIl4Cc8EyZcir2SKlVOxeUv9tZGfNTmNaLC717Ht=w240-h480',
      category: 'Google Play',
      value: '$10',
      isDigital: true,
    },
    {
      title: 'iTunes $25 Gift Card',
      description: 'Use on Apple Music, apps, games, movies & more',
      costPoints: 25000,
      stock: 30,
      imageUrl: 'https://cdn-icons-png.flaticon.com/512/0/747.png',
      category: 'iTunes',
      value: '$25',
      isDigital: true,
    },
    {
      title: 'Steam $20 Wallet Code',
      description: 'Add $20 to your Steam Wallet for PC games',
      costPoints: 20000,
      stock: 40,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg',
      category: 'Steam',
      value: '$20',
      isDigital: true,
    },
    {
      title: 'PlayStation Network $15',
      description: 'Get $15 PSN credit for PS5/PS4 games',
      costPoints: 15000,
      stock: 25,
      imageUrl: 'https://cdn.iconscout.com/icon/free/png-256/free-playstation-3-226425.png',
      category: 'PlayStation',
      value: '$15',
      isDigital: true,
    },
    {
      title: 'Xbox Gift Card $10',
      description: 'Redeem for Xbox games, add-ons & more',
      costPoints: 10000,
      stock: 35,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Xbox_one_logo.svg',
      category: 'Xbox',
      value: '$10',
      isDigital: true,
    },
    {
      title: 'Nintendo eShop $35',
      description: 'Get Nintendo Switch games & DLC',
      costPoints: 35000,
      stock: 20,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0d/Nintendo.svg',
      category: 'Nintendo',
      value: '$35',
      isDigital: true,
    },
    {
      title: 'Mobile Legends Diamonds 100',
      description: 'Get 100 diamonds for Mobile Legends',
      costPoints: 5000,
      stock: null, // Unlimited
      imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_D8P9jIQUH8aO0RYKiC9hBqUiEp8W4FZpkQ&s',
      category: 'Game Codes',
      value: '100 Diamonds',
      isDigital: true,
    },
    {
      title: 'Free Fire Diamonds 500',
      description: 'Get 500 diamonds for Free Fire',
      costPoints: 8000,
      stock: null, // Unlimited
      imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQH_h0e9r4A7GVL8xR0RsRdN3SXJCY0w8G7jw&s',
      category: 'Game Codes',
      value: '500 Diamonds',
      isDigital: true,
    },
    {
      title: 'Spotify Premium 1 Month',
      description: 'Enjoy ad-free music streaming for 1 month',
      costPoints: 12000,
      stock: 15,
      imageUrl: 'https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_Green.png',
      category: 'Premium',
      value: '1 Month',
      isDigital: true,
    },
    {
      title: 'Netflix Gift Card $50',
      description: 'Stream unlimited movies & shows',
      costPoints: 50000,
      stock: 10,
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
      category: 'Premium',
      value: '$50',
      isDigital: true,
    },
  ];

  for (const product of products) {
    const created = await prisma.product.create({
      data: product,
    });
    console.log(`✅ Created: ${created.title}`);
  }

  console.log('🎉 Digital products seeded successfully!');
}

seedDigitalProducts()
  .catch((error) => {
    console.error('❌ Error seeding products:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
