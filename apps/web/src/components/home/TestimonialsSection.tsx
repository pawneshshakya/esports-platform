"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const testimonials = [
  {
    id: "testimonial-1",
    name: "Rahul Singh",
    location: "Mumbai",
    content: "Local Rummy has the best user interface among all the rummy sites I've played on. The games are smooth, and payments are processed quickly!",
    rating: 5,
    avatar: "R",
  },
  {
    id: "testimonial-2",
    name: "Priya Sharma",
    location: "Delhi",
    content: "I've won several tournaments on Local Rummy. The competition is fair, and the customer support team is always helpful whenever I need assistance.",
    rating: 5,
    avatar: "P",
  },
  {
    id: "testimonial-3",
    name: "Karthik Reddy",
    location: "Hyderabad",
    content: "What I love about Local Rummy is the variety of game formats. Whether I want to play a quick game or participate in tournaments, there's always something exciting.",
    rating: 4,
    avatar: "K",
  },
  {
    id: "testimonial-4",
    name: "Anjali Patel",
    location: "Ahmedabad",
    content: "The bonuses and promotions on Local Rummy are fantastic! I've been playing here for over a year, and the experience keeps getting better.",
    rating: 5,
    avatar: "A",
  },
];

// Create a static array of star positions
const starPositions = [1, 2, 3, 4, 5];

export function TestimonialsSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What Our <span className="text-orange-500">Players Say</span>
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Don't just take our word for it - hear from our community of rummy enthusiasts who've experienced the Local Rummy difference.
          </p>
        </div>

        <Carousel className="max-w-4xl mx-auto">
          <CarouselContent>
            {testimonials.map((testimonial) => (
              <CarouselItem key={testimonial.id}>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="bg-white p-8 rounded-lg shadow-md">
                    <div className="flex items-center mb-4">
                      <div className="flex-shrink-0 h-12 w-12 rounded-full bg-orange-500 flex items-center justify-center text-white text-xl font-bold">
                        {testimonial.avatar}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold">{testimonial.name}</h3>
                        <p className="text-gray-600">{testimonial.location}</p>
                      </div>
                      <div className="ml-auto flex">
                        {starPositions.map((position) => (
                          <svg
                            key={`star-position-${position}`}
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-5 w-5 ${
                              position <= testimonial.rating ? "text-yellow-500" : "text-gray-300"
                            }`}
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <blockquote className="text-gray-700 italic">"{testimonial.content}"</blockquote>
                  </div>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center mt-8 gap-4">
            <CarouselPrevious />
            <CarouselNext />
          </div>
        </Carousel>
      </div>
    </section>
  );
}
