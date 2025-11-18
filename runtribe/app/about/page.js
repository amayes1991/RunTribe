"use client";
import Link from 'next/link';
import { useSession } from "next-auth/react";

export default function About() {
  const { data: session } = useSession();

  return (
    <>
      {/* Navigation */}
      <nav className="w-full bg-[#1a1a1a] shadow-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <Link href="/" className="text-2xl font-bold text-[#66ff00] hover:text-[#52cc00] transition-colors">
                Run Tribe
              </Link>
            </div>
            <div className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-400 hover:text-white transition-colors">Home</Link>
              <Link href="/about" className="text-white font-semibold">About Us</Link>
              <Link href="/groups" className="text-gray-400 hover:text-white transition-colors">Running</Link>
            </div>
            {session ? (
              <div className="hidden md:flex space-x-4">
                <Link
                  href="/dashboard"
                  className="inline-block px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 hover:border-gray-500 transition-colors"
                >
                  Dashboard
                </Link>
              </div>
            ) : (
              <div className="hidden md:flex space-x-4">
                <Link
                  href="/login"
                  className="inline-block px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 hover:border-gray-500 transition-colors"
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
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#1a1a1a] via-gray-900 to-[#1a1a1a] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-[#66ff00]">
            About RunTribe
          </h1>
          <p className="text-xl sm:text-2xl max-w-3xl mx-auto leading-relaxed text-gray-300">
            We're building the world's most connected running community, where every runner finds their tribe and every mile tells a story.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[#66ff00] mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                At RunTribe, we believe that running is more than just exercise—it's a way of life that brings people together. Our mission is to create a global community where runners of all levels can connect, inspire, and support each other.
              </p>
              <p className="text-lg text-gray-300 leading-relaxed">
                Whether you're training for your first 5K or chasing a marathon PR, we're here to help you find your running family and make every step count.
              </p>
            </div>
            <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl">
              <div className="text-center">
                <div className="w-24 h-24 bg-[#66ff00] rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Community First</h3>
                <p className="text-gray-400">Building meaningful connections through shared passion</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#66ff00] mb-6">
              Our Story
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              RunTribe was born from a simple observation: runners are some of the most supportive and inspiring people on the planet, but they often train alone.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#66ff00] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-black text-xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">The Beginning</h3>
              <p className="text-gray-400">
                Founded by a group of passionate runners who wanted to bridge the gap between solo training and community support.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#66ff00] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-black text-xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">The Growth</h3>
              <p className="text-gray-400">
                From local running clubs to a global platform connecting thousands of runners across continents.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-[#66ff00] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-black text-xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">The Future</h3>
              <p className="text-gray-400">
                Continuously evolving to meet the needs of runners and build the ultimate running community platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#66ff00] text-center mb-16">
            Our Values
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#66ff00]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#66ff00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Passion</h3>
              <p className="text-gray-400 text-sm">
                We're fueled by our love for running and the community it creates.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#66ff00]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#66ff00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Inclusivity</h3>
              <p className="text-gray-400 text-sm">
                Every runner, regardless of pace or experience, has a place here.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#66ff00]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#66ff00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Innovation</h3>
              <p className="text-gray-400 text-sm">
                We constantly push boundaries to enhance the running experience.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#66ff00]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#66ff00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Authenticity</h3>
              <p className="text-gray-400 text-sm">
                Real connections, real stories, real support from real runners.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#1a1a1a] to-gray-900 text-white border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6 text-[#66ff00]">
            Ready to Join Your Tribe?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-300">
            Connect with runners in your area, share your journey, and be part of something bigger than yourself.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {session ? (
              <Link
                href="/dashboard"
                className="inline-block px-8 py-4 text-lg font-semibold rounded-md bg-[#66ff00] text-black hover:bg-[#52cc00] transition-colors"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                href="/signup"
                className="inline-block px-8 py-4 text-lg font-semibold rounded-md bg-[#66ff00] text-black hover:bg-[#52cc00] transition-colors"
              >
                Get Started Today
              </Link>
            )}
            <Link
              href="/groups"
              className="inline-block px-8 py-4 text-lg font-semibold rounded-md border-2 border-[#66ff00] text-[#66ff00] hover:bg-[#66ff00] hover:text-black transition-colors"
            >
              Explore Groups
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
