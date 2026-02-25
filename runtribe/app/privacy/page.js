"use client";
import Link from 'next/link';
import { useSession } from "next-auth/react";

export default function Privacy() {
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
          <h1 className="text-4xl font-bold text-[#66ff00] mb-8">Privacy Policy</h1>
          <p className="text-gray-400 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="space-y-8 text-gray-300">
            <section>
              <h2 className="text-xl font-semibold text-white mb-4">1. Information We Collect</h2>
              <p className="leading-relaxed">
                We collect information you provide when creating an account, including your name, email address, and profile details. We also collect usage data to improve our service and user experience.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
              <p className="leading-relaxed">
                Your information is used to provide and improve our services, authenticate your account, communicate with you, and personalize your experience. We do not sell your personal information to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">3. Information Sharing</h2>
              <p className="leading-relaxed">
                We may share your information with service providers who assist in operating our platform, when required by law, or to protect our rights and safety. Profile information you choose to make public (such as your name in groups) may be visible to other users.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">4. Data Security</h2>
              <p className="leading-relaxed">
                We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">5. Your Rights</h2>
              <p className="leading-relaxed">
                You have the right to access, correct, or delete your personal information. You can update your profile through your account settings. To request deletion of your account and data, please contact us.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">6. Cookies and Tracking</h2>
              <p className="leading-relaxed">
                We use cookies and similar technologies for authentication and to improve our service. You can control cookie preferences through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">7. Changes to This Policy</h2>
              <p className="leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the new policy on this page and updating the &quot;Last updated&quot; date.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-4">8. Contact Us</h2>
              <p className="leading-relaxed">
                If you have questions about this Privacy Policy or our data practices, please contact us through our website.
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
