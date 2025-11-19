"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";

export default function Signup() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    dateOfBirth: "",
    city: "",
    runningLevel: "beginner",
    acceptTerms: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    if (!formData.acceptTerms) {
      setError("You must accept the terms and conditions");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      // Call the backend API to create the user
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const signupResponse = await fetch(`${apiUrl}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: `${formData.firstName} ${formData.lastName}`,
        }),
      });

      if (!signupResponse.ok) {
        const errorData = await signupResponse.text();
        setError(errorData || "Failed to create account");
        return;
      }
      
      // After successful signup, sign in the user
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Account created but login failed. Please try logging in.");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("An error occurred during signup. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#66ff00]">Run Tribe</h1>
          <h2 className="mt-6 text-3xl font-bold text-white">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Or{" "}
            <Link
              href="/login"
              className="font-medium text-[#66ff00] hover:text-[#52cc00] transition-colors"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-900 border border-gray-800 py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-900/20 border border-red-800 text-red-300 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-300"
                >
                  First name
                </label>
                <div className="mt-1">
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md placeholder-gray-500 bg-gray-800 text-white focus:outline-none focus:ring-[#66ff00] focus:border-[#66ff00] sm:text-sm transition-colors"
                    placeholder="Enter your first name"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-300"
                >
                  Last name
                </label>
                <div className="mt-1">
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md placeholder-gray-500 bg-gray-800 text-white focus:outline-none focus:ring-[#66ff00] focus:border-[#66ff00] sm:text-sm transition-colors"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-300"
              >
                Username
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md placeholder-gray-500 bg-gray-800 text-white focus:outline-none focus:ring-[#66ff00] focus:border-[#66ff00] sm:text-sm transition-colors"
                  placeholder="Choose a username"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300"
              >
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md placeholder-gray-500 bg-gray-800 text-white focus:outline-none focus:ring-[#66ff00] focus:border-[#66ff00] sm:text-sm transition-colors"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="dateOfBirth"
                  className="block text-sm font-medium text-gray-300"
                >
                  Date of birth
                </label>
                <div className="mt-1">
                  <input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    required
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md placeholder-gray-500 bg-gray-800 text-white focus:outline-none focus:ring-[#66ff00] focus:border-[#66ff00] sm:text-sm transition-colors"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-gray-300"
                >
                  City
                </label>
                <div className="mt-1">
                  <input
                    id="city"
                    name="city"
                    type="text"
                    autoComplete="address-level2"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md placeholder-gray-500 bg-gray-800 text-white focus:outline-none focus:ring-[#66ff00] focus:border-[#66ff00] sm:text-sm transition-colors"
                    placeholder="Enter your city"
                  />
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="runningLevel"
                className="block text-sm font-medium text-gray-300"
              >
                Running experience level
              </label>
              <div className="mt-1">
                <select
                  id="runningLevel"
                  name="runningLevel"
                  value={formData.runningLevel}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md placeholder-gray-500 bg-gray-800 text-white focus:outline-none focus:ring-[#66ff00] focus:border-[#66ff00] sm:text-sm transition-colors"
                >
                  <option value="beginner">Beginner (0-6 months)</option>
                  <option value="intermediate">Intermediate (6 months - 2 years)</option>
                  <option value="advanced">Advanced (2+ years)</option>
                  <option value="expert">Expert (competitive runner)</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300"
              >
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md placeholder-gray-500 bg-gray-800 text-white focus:outline-none focus:ring-[#66ff00] focus:border-[#66ff00] sm:text-sm transition-colors"
                  placeholder="Create a password (min 8 characters)"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-300"
              >
                Confirm password
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md placeholder-gray-500 bg-gray-800 text-white focus:outline-none focus:ring-[#66ff00] focus:border-[#66ff00] sm:text-sm transition-colors"
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="acceptTerms"
                name="acceptTerms"
                type="checkbox"
                checked={formData.acceptTerms}
                onChange={handleChange}
                className="h-4 w-4 text-[#66ff00] focus:ring-[#66ff00] border-gray-600 rounded bg-gray-800"
              />
              <label
                htmlFor="acceptTerms"
                className="ml-2 block text-sm text-gray-300"
              >
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="font-medium text-[#66ff00] hover:text-[#52cc00] transition-colors"
                >
                  Terms and Conditions
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="font-medium text-[#66ff00] hover:text-[#52cc00] transition-colors"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-black bg-[#66ff00] hover:bg-[#52cc00] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#66ff00] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-black"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : null}
                {loading ? "Creating account..." : "Create account"}
              </button>
            </div>
          </form>


        </div>
      </div>
    </div>
  );
} 