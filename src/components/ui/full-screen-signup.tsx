"use client";
 
import { SunIcon as Sunburst } from "lucide-react";
import { useState } from "react";

export const FullScreenSignup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [submitted, setSubmitted] = useState(false);
 
  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };
 
  const validatePassword = (value: string) => {
    return value.length >= 8;
  };
 
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;
 
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
      valid = false;
    } else {
      setEmailError("");
    }
 
    if (!validatePassword(password)) {
      setPasswordError("Password must be at least 8 characters.");
      valid = false;
    } else {
      setPasswordError("");
    }
 
    setSubmitted(true);
 
    if (valid) {
      // Submission logic goes here
      console.log("Form submitted!");
      console.log("Email:", email);
      alert("Form submitted!");
      setEmail("");
      setPassword("");
      setSubmitted(false);
    }
  };
 
  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden p-4 bg-background">
      <div className="w-full relative max-w-5xl overflow-hidden flex flex-col md:flex-row shadow-xl rounded-3xl">
        <div className="w-full h-full z-10 absolute bg-gradient-to-t from-transparent to-black pointer-events-none"></div>
        <div className="flex absolute z-0 overflow-hidden backdrop-blur-2xl pointer-events-none">
          {/* Abstract geometric background elements */}
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
 
        <div className="p-8 md:p-12 md:w-1/2 flex flex-col bg-secondary z-20 text-secondary-foreground">
          <div className="flex flex-col items-start mb-8">
            <div className="text-orange-500 mb-4 bg-white p-2 rounded-full shadow-sm">
              <Sunburst className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-medium mb-2 tracking-tight">
              Get Started
            </h2>
            <p className="text-left opacity-80">
              Welcome to HextaStudio — Let's get started
            </p>
          </div>
 
          <form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit}
            noValidate
          >
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Your email
              </label>
              <input
                type="email"
                id="email"
                placeholder="hi@hextastudio.in"
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
                Create new password
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
              className="w-full mt-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              Create a new account
            </button>
 
            <div className="text-center text-secondary-foreground/70 text-sm mt-4">
              Already have an account?{" "}
              <a href="/login" className="text-orange-500 font-semibold hover:underline">
                Login
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
