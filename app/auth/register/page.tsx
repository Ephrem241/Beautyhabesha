"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import { registerUser } from "./actions";

const MAX_PHOTO_MB = 5;
const MIN_IMAGES = 3;
const MAX_IMAGES = 12;

const MIN_AGE = 18;

function RegisterForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [age, setAge] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"user" | "escort">("user");
  const [images, setImages] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    const ageNum = parseInt(age, 10);
    if (Number.isNaN(ageNum) || ageNum < MIN_AGE || ageNum > 120) {
      setErrorMessage(`Age must be between ${MIN_AGE} and 120`);
      setIsLoading(false);
      return;
    }

    if (role === "escort" && images.length < MIN_IMAGES) {
      setErrorMessage(`Please upload at least ${MIN_IMAGES} images. The first image will be your profile picture.`);
      setIsLoading(false);
      return;
    }

    if (role === "escort" && images.length > MAX_IMAGES) {
      setErrorMessage(`You can upload at most ${MAX_IMAGES} images.`);
      setIsLoading(false);
      return;
    }

    if (role === "escort" && images.some((f) => f.size > MAX_PHOTO_MB * 1024 * 1024)) {
      setErrorMessage(`Each image must be smaller than ${MAX_PHOTO_MB}MB`);
      setIsLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("username", username.trim());
      formData.append("age", age);
      formData.append("password", password);
      formData.append("role", role);
      if (role === "escort" && images.length > 0) {
        images.forEach((file) => formData.append("images", file));
      }

      const result = await registerUser(formData);

      if (result.error) {
        setErrorMessage(result.error);
        setIsLoading(false);
      } else {
        router.push("/auth/login?registered=true");
      }
    } catch {
      setErrorMessage("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black px-4 py-12 text-white sm:px-6 sm:py-16">
      <div className="mx-auto max-w-md">
        <header className="mb-8 text-center">
          <h1 className="text-2xl font-semibold sm:text-3xl">Create Account</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Sign up to get started
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-zinc-800 bg-black p-4 sm:p-6"
        >
          {errorMessage && (
            <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {errorMessage}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-semibold text-zinc-200"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
                maxLength={30}
                pattern="[a-zA-Z0-9_]+"
                className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
                placeholder="letters, numbers, underscores"
                autoComplete="username"
              />
              <p className="mt-1 text-xs text-zinc-500">3–30 characters. Letters, numbers, underscores only.</p>
            </div>

            <div>
              <label
                htmlFor="age"
                className="block text-sm font-semibold text-zinc-200"
              >
                Age
              </label>
              <input
                id="age"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
                min={MIN_AGE}
                max={120}
                className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
                placeholder="18"
                autoComplete="off"
              />
              <p className="mt-1 text-xs text-zinc-500">You must be at least {MIN_AGE}.</p>
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-semibold text-zinc-200"
              >
                I want to register as
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => {
                  const value = e.target.value as "user" | "escort";
                  setRole(value);
                  if (value === "user") setImages([]);
                }}
                required
                className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
              >
                <option value="user">Regular User</option>
                <option value="escort">Escort</option>
              </select>
              {role === "escort" && (
                <p className="mt-2 text-xs text-zinc-400">
                  Escorts can create profiles and list their services. Upload 3–12 images below — admin will review before approving.
                </p>
              )}
            </div>

            {role === "escort" && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4">
                <label
                  htmlFor="profileImages"
                  className="block text-sm font-semibold text-zinc-200"
                >
                  Images <span className="text-amber-400">*</span> (min {MIN_IMAGES}, max {MAX_IMAGES})
                </label>
                <p className="mt-1 text-xs text-zinc-500">
                  The first image is your profile picture. Upload 3–12 images. Each max 5MB. Admin will review before approving.
                </p>
                <input
                  id="profileImages"
                  type="file"
                  accept="image/*"
                  multiple
                  required={role === "escort"}
                  onChange={(e) => setImages(Array.from(e.target.files ?? []))}
                  className="mt-3 block w-full cursor-pointer rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-500 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-emerald-950 hover:file:bg-emerald-400"
                />
                {images.length > 0 && (
                  <p className="mt-2 text-xs text-emerald-400">
                    Selected: {images.length} image{images.length !== 1 ? "s" : ""}
                    {images.length > 0 && ` — first is profile picture`}
                  </p>
                )}
              </div>
            )}

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-zinc-200"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold text-zinc-200"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-6 w-full rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-950 transition hover:bg-emerald-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-zinc-500">
          <p>
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-emerald-400 transition hover:text-emerald-300"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-black px-4 py-16 text-white sm:px-6">
        <div className="mx-auto max-w-md text-center">
          <p className="text-zinc-400">Loading...</p>
        </div>
      </main>
    }>
      <RegisterForm />
    </Suspense>
  );
}
