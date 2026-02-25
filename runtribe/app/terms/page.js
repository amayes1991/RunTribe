"use client";
import Link from 'next/link';
import { useSession } from "next-auth/react";

export default function Terms() {
  const { data: session } = useSession();

  return (
    <>
      <nav className="w-full bg-[#1a1a1a] shadow-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <Link href="/" className="text-2xl font-bold text-[#66ff00] hover:text-[#52cc00] transition-colors">
                Run Tribes
              </Link>
            </div>
            <div className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-400 hover:text-white transition-colors">Home</Link>
              <Link href="/about" className="text-gray-400 hover:text-white transition-colors">About</Link>
              <Link href="/groups" className="text-gray-400 hover:text-white transition-colors">Running</Link>
            </div>
            {session ? (
              <Link href="/dashboard" className="inline-block px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700">
                Dashboard
              </Link>
            ) : (
              <div className="flex space-x-4">
                <Link href="/login" className="inline-block px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700">
                  Log In
                </Link>
                <Link href="/signup" className="inline-block px-4 py-2 border border-transparent text-sm font-medium rounded-md text-black bg-[#66ff00] hover:bg-[#52cc00]">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="min-h-screen bg-[#1a1a1a] text-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-[#66ff00] mb-8">Terms and Conditions</h1>
          <p className="text-gray-400 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-8 text-gray-300">
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="leading-relaxed">
                By accessing or using RunTribes, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">2. Use of Service</h2>
              <p className="leading-relaxed">
                RunTribes provides a platform for runners to connect, form groups, and participate in running-related activities. You agree to use the service only for lawful purposes and in accordance with these terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">3. User Accounts</h2>
              <p className="leading-relaxed">
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must provide accurate and complete information when creating your account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">4. User Conduct</h2>
              <p className="leading-relaxed">
                You agree not to use the service to harass, abuse, or harm other users. You will not post content that is illegal, offensive, or violates the rights of others. We reserve the right to suspend or terminate accounts that violate these guidelines.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">5. Limitation of Liability</h2>
              <p className="leading-relaxed">
                RunTribes is provided &quot;as is&quot; without warranties of any kind. We are not liable for any injuries, damages, or losses that may occur during running activities organized through our platform. Always exercise caution and follow safety guidelines when participating in running events.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">6. Changes</h2>
              <p className="leading-relaxed">
                We may update these terms from time to time. We will notify users of significant changes. Continued use of the service after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">7. Contact</h2>
              <p className="leading-relaxed">
                If you have questions about these Terms and Conditions, please contact us through our website.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800">
            <Link href="/signup" className="text-[#66ff00] hover:text-[#52cc00] transition-colors">
              ← Back to Sign Up
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
