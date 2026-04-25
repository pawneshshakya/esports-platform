"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="py-16 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <motion.h2
              className="text-3xl md:text-4xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              Ready to Experience the <br />
              <span className="text-yellow-300">Ultimate Rummy Adventure?</span>
            </motion.h2>
            <motion.p
              className="text-xl text-white/90"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Join thousands of players today and start winning big prizes!
            </motion.p>

            <motion.div
              className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Button className="bg-white text-orange-600 hover:bg-gray-100 py-6 px-8 rounded-md text-lg">
                Sign Up Now
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white/20 py-6 px-8 rounded-md text-lg">
                Learn More
              </Button>
            </motion.div>
          </div>

          <motion.div
            className="md:w-1/2 relative"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm border border-white/20">
              <h3 className="text-2xl font-bold mb-4">New Player Bonus</h3>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Welcome bonus up to ₹2,000
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  5 free tournament entries
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Daily rewards & cashback
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Access to VIP rewards program
                </li>
              </ul>

              <div className="mt-6">
                <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-800 font-bold py-3">
                  Claim Your Bonus
                </Button>
              </div>
            </div>

            <div className="absolute -top-6 -right-6 bg-yellow-500 text-gray-800 p-4 rounded-lg shadow-lg transform rotate-6">
              <p className="text-xl font-bold">Limited Time Offer!</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
