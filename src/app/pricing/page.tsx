"use client";

import Link from "next/link";
import { Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function PricingPage() {
  const tiers = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for getting started and building your first portfolio.",
      features: [
        "1 Portfolio",
        "Basic Templates",
        "GenFolio Subdomain",
        "Community Support",
      ],
      buttonText: "Get Started",
      buttonVariant: "outline" as const,
    },
    {
      name: "Pro",
      price: "$12",
      description: "Unlock advanced features and custom domains.",
      features: [
        "Unlimited Portfolios",
        "Premium Templates",
        "Custom Domain Support",
        "Priority Support",
        "Advanced Analytics",
        "Remove Watermark",
      ],
      buttonText: "Upgrade to Pro",
      buttonVariant: "default" as const,
      popular: true,
    },
    {
      name: "Team",
      price: "$49",
      description: "For agencies and teams building multiple portfolios.",
      features: [
        "Everything in Pro",
        "Team Collaboration",
        "Client Billing",
        "White Labeling",
        "Dedicated Manager",
      ],
      buttonText: "Contact Sales",
      buttonVariant: "outline" as const,
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white relative selection:bg-white/30 pt-24 pb-12">
      <nav className="fixed top-0 left-0 right-0 z-[100] border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <ArrowLeft className="w-5 h-5 text-white" />
              <span className="text-xl font-bold tracking-tight text-white">GenFolio</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-white/70 hover:text-white transition-colors">
              Log in
            </Link>
            <Link href="/builder" className="text-sm font-medium bg-white text-black px-4 py-2 rounded-full hover:bg-white/90 transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Simple, transparent pricing</h1>
          <p className="text-lg text-white/60">
            Choose the perfect plan for your needs. Whether you're just starting out or managing multiple clients, we have a plan for you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <Card key={tier.name} className={`bg-zinc-900 border-zinc-800 flex flex-col relative ${tier.popular ? 'ring-2 ring-white scale-105 z-10' : ''}`}>
              {tier.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-black px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl text-white">{tier.name}</CardTitle>
                <div className="mt-4 flex items-baseline text-5xl font-extrabold text-white">
                  {tier.price}
                  <span className="ml-1 text-xl font-medium text-zinc-500">/mo</span>
                </div>
                <CardDescription className="text-zinc-400 mt-4 h-12">
                  {tier.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-4">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <div className="flex-shrink-0">
                        <Check className="h-5 w-5 text-white" />
                      </div>
                      <p className="ml-3 text-sm text-zinc-300">{feature}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant={tier.buttonVariant} className="w-full">
                  {tier.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
