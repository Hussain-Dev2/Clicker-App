export default function Blog() {
  const articles = [
    {
      id: 1,
      title: "How to Maximize Your Points Earning Strategy",
      excerpt: "Learn the best strategies to earn points efficiently and level up faster in RECKON.",
      date: "December 10, 2025",
      readTime: "5 min read"
    },
    {
      id: 2,
      title: "Understanding the Level System: A Complete Guide",
      excerpt: "Discover how the level system works and what benefits each level unlocks.",
      date: "December 9, 2025",
      readTime: "7 min read"
    },
    {
      id: 3,
      title: "Top 10 Tips for New Users",
      excerpt: "Starting your journey on RECKON? Here are essential tips every beginner should know.",
      date: "December 8, 2025",
      readTime: "6 min read"
    },
    {
      id: 4,
      title: "Referral System Explained: Earn More Points",
      excerpt: "Learn how to use the referral system to earn bonus points and grow your network.",
      date: "December 7, 2025",
      readTime: "4 min read"
    },
    {
      id: 5,
      title: "Activity Cooldowns and How to Plan Your Day",
      excerpt: "Master the timing of activities to maximize your daily point earnings.",
      date: "December 6, 2025",
      readTime: "5 min read"
    }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-cyan-50 via-orange-50 to-cyan-100 dark:from-gray-900 dark:via-cyan-900 dark:to-orange-950 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-600 via-orange-500 to-emerald-600 bg-clip-text text-transparent">
            RECKON Blog
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Tips, guides, and news about earning rewards
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <article
              key={article.id}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                <span>📅 {article.date}</span>
                <span>•</span>
                <span>⏱️ {article.readTime}</span>
              </div>
              
              <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                {article.title}
              </h2>
              
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {article.excerpt}
              </p>
              
              <button className="text-cyan-600 dark:text-cyan-400 font-semibold hover:underline">
                Read More →
              </button>
            </article>
          ))}
        </div>

        {/* Google AdSense Ad Space */}
        <div className="mt-12 p-6 bg-white dark:bg-gray-800 rounded-2xl">
          <ins
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client="ca-pub-4681103183883079"
            data-ad-slot="YOUR_SLOT_ID"
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        </div>
      </div>
    </main>
  );
}
