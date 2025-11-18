import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] border-t border-gray-800 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-[#66ff00]">RunTribe</h3>
            <p className="text-gray-300">
              Connecting runners worldwide, one step at a time.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-300 hover:text-[#66ff00] transition-colors">Home</Link></li>
              <li><Link href="/about" className="text-gray-300 hover:text-[#66ff00] transition-colors">About</Link></li>
              <li><Link href="/groups" className="text-gray-300 hover:text-[#66ff00] transition-colors">Groups</Link></li>
              <li><Link href="/dashboard" className="text-gray-300 hover:text-[#66ff00] transition-colors">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Connect</h4>
            <p className="text-gray-300">
              Ready to find your running tribe? Join thousands of runners who've already discovered the power of community.
            </p>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 RunTribe. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
