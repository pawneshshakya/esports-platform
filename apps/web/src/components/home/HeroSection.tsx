"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function HeroSection() {
  return (
    <div className="relative bg-card overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-800 opacity-75" />

      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0 space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
              Experience the Thrill of <span className="text-orange-500">Online Rummy</span>
            </h1>
            <p className="text-xl text-gray-300">
              Play rummy online with friends and win exciting cash prizes. Join thousands of players in our rummy community!
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white py-6 px-8 rounded-md text-lg">
                Play Now
              </Button>
              <Button variant="outline" className="border-orange-500 text-white hover:bg-orange-500 py-6 px-8 rounded-md text-lg">
                Learn How to Play
              </Button>
            </div>
            <div className="pt-4">
              <p className="text-muted-foreground flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                100% Secure & Reliable
              </p>
            </div>
          </div>

          <div className="md:w-1/2 relative">
            <div className="relative rounded-lg overflow-hidden shadow-2xl">
              <Image
                src="/images/hero-cards.jpg"
                alt="Play Rummy Online"
                width={700}
                height={500}
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-50" />
            </div>

            <div className="absolute -bottom-6 -right-6 bg-orange-500 text-white p-4 rounded-lg shadow-lg transform rotate-6">
              <p className="text-xl font-bold">Win Big!</p>
              <p>Cash prizes up to ₹10,000</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
