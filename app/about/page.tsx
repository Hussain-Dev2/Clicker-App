export default function About() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-cyan-50 via-orange-50 to-cyan-100 dark:from-gray-900 dark:via-cyan-900 dark:to-orange-950 p-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl">
        <h1 className="text-4xl font-bold mb-6 text-cyan-600 dark:text-cyan-400">About RECKON</h1>
        
        <div className="space-y-6 text-gray-700 dark:text-gray-300">
          <section>
            <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Our Mission</h2>
            <p>
              RECKON is a rewards platform that transforms your engagement into real value. We believe in
              rewarding our users for their time and participation through an innovative points-based system.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">What We Offer</h2>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="bg-cyan-50 dark:bg-cyan-900/20 p-4 rounded-xl">
                <h3 className="font-bold text-lg mb-2 text-cyan-600 dark:text-cyan-400">🎯 Interactive Activities</h3>
                <p className="text-sm">Engage with various activities to earn points and rewards.</p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-xl">
                <h3 className="font-bold text-lg mb-2 text-orange-600 dark:text-orange-400">📈 Level System</h3>
                <p className="text-sm">Progress through levels to unlock better rewards and multipliers.</p>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl">
                <h3 className="font-bold text-lg mb-2 text-emerald-600 dark:text-emerald-400">🏆 Achievements</h3>
                <p className="text-sm">Complete milestones to earn bonus points and recognition.</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl">
                <h3 className="font-bold text-lg mb-2 text-purple-600 dark:text-purple-400">🎁 Rewards Shop</h3>
                <p className="text-sm">Redeem your points for amazing digital products and rewards.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">How It Works</h2>
            <ol className="space-y-3">
              <li className="flex gap-3">
                <span className="font-bold text-cyan-600 dark:text-cyan-400">1.</span>
                <span>Sign up with your Google account to get started instantly</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-cyan-600 dark:text-cyan-400">2.</span>
                <span>Participate in activities like clicking, watching ads, spinning the wheel, and more</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-cyan-600 dark:text-cyan-400">3.</span>
                <span>Earn points and level up to increase your earning potential</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold text-cyan-600 dark:text-cyan-400">4.</span>
                <span>Redeem your points in the shop for digital products and rewards</span>
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Our Values</h2>
            <ul className="space-y-2">
              <li>✅ <strong>Transparency:</strong> Clear rules and fair point distribution</li>
              <li>✅ <strong>Engagement:</strong> Fun and interactive user experience</li>
              <li>✅ <strong>Rewards:</strong> Real value for your time and participation</li>
              <li>✅ <strong>Community:</strong> Compete and collaborate with other users</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Join Us Today</h2>
            <p>
              Start earning rewards today! Sign up now and begin your journey to earning points and
              unlocking amazing rewards.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
