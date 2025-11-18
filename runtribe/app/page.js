"use client";
import Image from "next/image";
import { useState } from "react";
import Head from 'next/head';
import Link from 'next/link';
import { useSession, signOut } from "next-auth/react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session } = useSession();

  const fetchMessage = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5071';
      const response = await fetch(`${apiUrl}/api/message`);
      const data = await response.text();
      setMessage(data);
    } catch (error) {
      console.error("Error fetching message:", error);
      setMessage("Error fetching message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Run Tribe</title>
        <meta name="description" content="Connect with fellow runners, track your runs, and join groups." />
      </Head>

      {/* Navigation */}
      <nav className="w-full bg-[#1a1a1a] border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-white">Run Tribe</h1>
            </div>
            <div className="hidden md:flex space-x-8">
              <Link href="/" className="text-white font-medium">Home</Link>
              <Link href="/about" className="text-gray-300 hover:text-white transition-colors">About Us</Link>
              <Link href="/groups" className="text-gray-300 hover:text-white transition-colors">Running</Link>
            </div>
            {session ? (
              <div className="hidden md:flex space-x-4">
                <Link
                  href="/dashboard"
                  className="inline-block px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-[#1a1a1a] hover:bg-gray-800 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="inline-block px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#66ff00] hover:bg-[#52cc00] transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="hidden md:flex space-x-4">
                <Link
                  href="/login"
                  className="inline-block px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-[#1a1a1a] hover:bg-gray-800 hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="inline-block px-4 py-2 border border-transparent text-sm font-medium rounded-md text-black bg-[#66ff00] hover:bg-[#52cc00] transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#66ff00]"
                aria-controls="mobile-menu"
                aria-expanded={mobileMenuOpen}
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu, show/hide based on menu state */}
        <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`} id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-[#1a1a1a] border-t border-gray-800">
            <Link
              href="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-white hover:text-[#66ff00] hover:bg-gray-800"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800"
            >
              About Us
            </Link>
            <Link
              href="/groups"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800"
            >
              Running
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-800 bg-[#1a1a1a]">
            {session ? (
              <div className="flex items-center px-5 space-x-3">
                <Link
                  href="/dashboard"
                  className="flex-1 text-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-[#1a1a1a] hover:bg-gray-800 hover:text-white"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex-1 text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#66ff00] hover:bg-[#52cc00]"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center px-5 space-x-3">
                <Link
                  href="/login"
                  className="flex-1 text-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-[#1a1a1a] hover:bg-gray-800 hover:text-white"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="flex-1 text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-black bg-[#66ff00] hover:bg-[#52cc00]"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative bg-[#1a1a1a] h-screen overflow-hidden">
        <img
          src="/run1.jpg"
          alt="Runners"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4">
          <h2 className="text-4xl sm:text-6xl font-extrabold mb-6 text-[#66ff00]">
            Find Your Tribe.<br />Run Together.
          </h2>
          <p className="text-lg sm:text-xl max-w-3xl mb-12 leading-relaxed text-gray-200">
            Join running groups, schedule routes, share updates, and chat in real time — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-6">
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="inline-block px-8 py-4 text-lg font-semibold rounded-md bg-[#66ff00] hover:bg-[#52cc00] text-black transition-colors"
                >
                  Go to Dashboard
                </Link>
                <Link
                  href="/groups"
                  className="inline-block px-8 py-4 text-lg font-semibold rounded-md border-2 border-white text-white hover:bg-white hover:text-[#1a1a1a] transition-colors"
                >
                  Find Groups
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="inline-block px-8 py-4 text-lg font-semibold rounded-md bg-[#66ff00] hover:bg-[#52cc00] text-black transition-colors"
                >
                  Get Started
                </Link>
                <Link
                  href="/about"
                  className="inline-block px-8 py-4 text-lg font-semibold rounded-md border-2 border-white text-white hover:bg-white hover:text-[#1a1a1a] transition-colors"
                >
                  Learn More
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Core Features Section */}
      <section className="py-20 bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-4xl font-bold text-[#66ff00] text-center mb-16">
            Core Features
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="mb-6">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <h4 className="text-xl font-semibold mb-3 text-white">Create & Manage Groups</h4>
              <p className="text-gray-300">
                Start your own or join existing running groups to stay motivated and connected.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="mb-6">
                <div className="w-16 h-16 bg-[#66ff00] rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
              <h4 className="text-xl font-semibold mb-3 text-white">Post Runs with Location</h4>
              <p className="text-gray-300">
                Add geo-tagged routes and share your favorite running paths with the community.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="mb-6">
                <div className="w-16 h-16 bg-pink-600 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
              </div>
              <h4 className="text-xl font-semibold mb-3 text-white">Real-Time Chat</h4>
              <p className="text-gray-300">
                Stay connected with group members through instant messaging and real-time updates.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="mb-6">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <h4 className="text-xl font-semibold mb-3 text-white">Log & Track Runs</h4>
              <p className="text-gray-300">
                View your run history, track progress, and monitor your stats over time.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="mb-6">
                <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              </div>
              <h4 className="text-xl font-semibold mb-3 text-white">Smart AI Coaching</h4>
              <p className="text-gray-300">
                Personalized training plans and insights powered by AI (Coming Soon).
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="mb-6">
                <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h4 className="text-xl font-semibold mb-3 text-white">Schedule & Organize</h4>
              <p className="text-gray-300">
                Plan group runs and coordinate with your tribe members seamlessly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-4xl font-bold text-[#66ff00] text-center mb-16">
            How It Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <h4 className="text-2xl font-semibold mb-4 text-white">Create a Group or Join One</h4>
              <p className="text-gray-300 text-lg">
                Find runners near you or start your own community to build connections.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-[#66ff00] to-green-500 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-12 h-12 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <h4 className="text-2xl font-semibold mb-4 text-white">Schedule a Run</h4>
              <p className="text-gray-300 text-lg">
                Pick a location, time, and share with your group to coordinate activities.
              </p>
            </div>
            
            <div className="text-center">
              <div className="mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <h4 className="text-2xl font-semibold mb-4 text-white">Stay Connected</h4>
              <p className="text-gray-300 text-lg">
                Chat with your team, log your runs, and track your progress together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#1a1a1a]">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h3 className="text-4xl font-bold text-[#66ff00] mb-6">
            Ready to Find Your Tribe?
          </h3>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of runners who are already building their communities and achieving their goals together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {session ? (
              <Link
                href="/dashboard"
                className="inline-block px-8 py-4 text-lg font-semibold rounded-md bg-[#66ff00] hover:bg-[#52cc00] text-black transition-colors"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                href="/signup"
                className="inline-block px-8 py-4 text-lg font-semibold rounded-md bg-[#66ff00] hover:bg-[#52cc00] text-black transition-colors"
              >
                Get Started Today
              </Link>
            )}
            <Link
              href="/groups"
              className="inline-block px-8 py-4 text-lg font-semibold rounded-md border-2 border-white text-white hover:bg-white hover:text-[#1a1a1a] transition-colors"
            >
              Explore Groups
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
