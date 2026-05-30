"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Home } from "lucide-react";

export function NotFoundPage() {
  const router = useRouter();

  return (
    <section className="bg-white font-serif min-h-screen flex items-center justify-center">
      <div className="container mx-auto">
        <div className="flex justify-center">
          <div className="w-full sm:w-10/12 md:w-8/12 text-center">
            <div
              className="bg-[url('https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&w=800')] h-[250px] sm:h-[350px] md:h-[400px] bg-center bg-no-repeat bg-cover rounded-2xl shadow-lg relative overflow-hidden"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <h1 className="text-center text-white text-6xl sm:text-7xl md:text-9xl font-bold drop-shadow-lg">
                  404
                </h1>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-2xl text-black sm:text-3xl font-bold mb-4">
                Looks like you're lost
              </h3>
              <p className="mb-6 text-gray-700 sm:mb-5">
                The page you are looking for is not available!
              </p>

              <Button
                variant="default"
                onClick={() => router.push("/")}
                className="my-5 bg-green-600 hover:bg-green-700 text-white transition-all hover:scale-105"
              >
                <Home className="mr-2 h-4 w-4" />
                Go to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
