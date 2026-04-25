"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const gameTypes = [
  {
    id: "points-rummy",
    title: "Points Rummy",
    description: "Fast-paced game where players play for points that have a pre-determined rupee value.",
    icon: "🎯",
    link: "/games/points-rummy",
  },
  {
    id: "pool-rummy",
    title: "Pool Rummy",
    description: "Play for a fixed entry fee and the winner takes the entire pool prize at the end.",
    icon: "🏊",
    link: "/games/pool-rummy",
  },
  {
    id: "deals-rummy",
    title: "Deals Rummy",
    description: "Play for a fixed number of deals and the player with the highest points wins.",
    icon: "🃏",
    link: "/games/deals-rummy",
  },
  {
    id: "tournaments",
    title: "Tournaments",
    description: "Compete against multiple players in knockout-style tournaments with big cash prizes.",
    icon: "🏆",
    link: "/tournaments",
  },
];

export function GameTypesSection() {
  return (
    <section className="py-16 bg-gray-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-orange-500">Exciting</span> Game Types
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Choose from a variety of rummy formats to match your style. Whether you're looking for quick games or long tournaments, we've got you covered.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {gameTypes.map((game) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: gameTypes.indexOf(game) * 0.1 }}
              viewport={{ once: true }}
            >
              <Link href={game.link} className="block h-full">
                <Card className="h-full transition-all duration-300 hover:shadow-lg hover:border-orange-500 cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className="text-4xl mb-2">{game.icon}</div>
                    <CardTitle className="text-xl font-bold">{game.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{game.description}</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
