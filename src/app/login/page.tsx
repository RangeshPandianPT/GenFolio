"use client";
 
import { SunIcon as Sunburst } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { app } from "@/lib/firebase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const auth = getAuth(app);
 
  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };
 
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;
 
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
      valid = false;
    } else {
      setEmailError("");
    }
 
    if (!password) {
      setPasswordError("Password is required.");
      valid = false;
    } else {
      setPasswordError("");
    }
 
    if (valid) {
      setIsLoading(true);
      try {
        await signInWithEmailAndPassword(auth, email, password);
        router.push("/builder");
      } catch (error) {
        console.error("Failed to login", error);
        setPasswordError("Invalid credentials or login failed.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push("/builder");
    } catch (error) {
      console.error("Failed to login with Google", error);
    }
  };
 
  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden p-4 bg-background">
      <div className="w-full relative max-w-5xl overflow-hidden flex flex-col md:flex-row shadow-xl rounded-3xl border border-border/50">
        <div className="w-full h-full z-10 absolute bg-gradient-to-t from-transparent to-black pointer-events-none"></div>
        <div className="flex absolute z-0 overflow-hidden backdrop-blur-2xl pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-[40rem] w-[4rem] bg-gradient-to-r from-transparent via-black/50 to-white/30 opacity-30 overflow-hidden"></div>
          ))}
        </div>
        <div className="w-[15rem] h-[15rem] bg-orange-500 absolute z-0 rounded-full bottom-0 left-[-5rem] blur-3xl opacity-50"></div>
        <div className="w-[8rem] h-[8rem] bg-white absolute z-0 rounded-full bottom-[5rem] right-[-2rem] blur-3xl opacity-20"></div>
 
        <div className="bg-black text-white p-8 md:p-12 md:w-1/2 relative rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none overflow-hidden flex items-center">
          <h1 className="text-2xl md:text-4xl font-medium leading-tight z-10 tracking-tight relative">
            Design and dev partner for startups and founders.
          </h1>
        </div>
 
        <div className="p-8 md:p-12 md:w-1/2 flex flex-col bg-secondary/80 backdrop-blur-lg z-20 text-secondary-foreground">
          <div className="flex flex-col items-start mb-8">
            <div className="text-orange-500 mb-4 bg-white p-2 rounded-full shadow-sm">
              <Sunburst className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">
              Welcome back
            </h2>
            <p className="text-left opacity-80 text-sm">
              Sign in to your GenFolio account to continue.
            </p>
          </div>

          <button 
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 mb-6 rounded-xl border border-border/50 bg-white text-black hover:bg-gray-50 transition-colors font-medium text-sm shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-secondary px-2 text-muted-foreground font-medium">Or continue with email</span>
            </div>
          </div>
 
          <form
            className="flex flex-col gap-4"
            onSubmit={handleEmailLogin}
            noValidate
          >
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Your email
              </label>
              <input
                type="email"
                id="email"
                placeholder="name@example.com"
                className={`text-sm w-full py-3 px-4 border rounded-xl focus:outline-none focus:ring-2 bg-white text-black transition-all ${
                  emailError ? "border-red-500 focus:ring-red-500" : "border-gray-200 focus:ring-orange-500"
                }`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!emailError}
                aria-describedby="email-error"
              />
              {emailError && (
                <p id="email-error" className="text-red-500 text-xs mt-1 font-medium">
                  {emailError}
                </p>
              )}
            </div>
 
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                className={`text-sm w-full py-3 px-4 border rounded-xl focus:outline-none focus:ring-2 bg-white text-black transition-all ${
                  passwordError ? "border-red-500 focus:ring-red-500" : "border-gray-200 focus:ring-orange-500"
                }`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!passwordError}
                aria-describedby="password-error"
              />
              {passwordError && (
                <p id="password-error" className="text-red-500 text-xs mt-1 font-medium">
                  {passwordError}
                </p>
              )}
            </div>
 
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
 
            <div className="text-center text-secondary-foreground/70 text-sm mt-4">
              Don't have an account?{" "}
              <a href="/signup" className="text-orange-500 font-semibold hover:underline">
                Sign up
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
