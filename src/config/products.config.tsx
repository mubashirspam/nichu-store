import React from "react";
import { Dumbbell, TrendingUp, Apple, Ruler } from "lucide-react";

export interface Product {
  id: string;
  name: string;
  shortName: string;
  price: number;
  originalPrice: number;
  currency: string;
  description: string;
  features: string[];
  icon: React.ReactNode;
  color: string;
  badge?: string;
}

// ═══════════════════════════════════════════════════════════════
// 🎯 PRODUCT PRICING CONFIGURATION
// ═══════════════════════════════════════════════════════════════
// Change prices here to update across the entire store
// ═══════════════════════════════════════════════════════════════

export const PRODUCTS: Product[] = [
  {
    id: "ultimate-fitness-tracker",
    name: "Ultimate Fitness Tracker",
    shortName: "Fitness Tracker",
    price: 1,              // 🔥 SPECIAL OFFER: ₹1 (was ₹299)
    originalPrice: 599,
    currency: "INR",
    description:
      "The all-in-one Excel spreadsheet to track workouts, nutrition, body measurements, sleep, water intake and more. Beautiful charts auto-generated.",
    features: [
      "Daily workout log with exercise library",
      "Calorie & macro nutrition tracker",
      "Body measurement progress charts",
      "Sleep & water intake tracking",
      "Auto-generated weekly/monthly graphs",
      "BMI & body fat calculator",
      "Printable & works on mobile",
      "Lifetime free updates",
    ],
    icon: <Dumbbell size={28} />,
    color: "emerald",
    badge: "Best Seller",
  },
  {
    id: "workout-log-pro",
    name: "Workout Log Pro",
    shortName: "Workout Log",
    price: 1,              // 🔥 SPECIAL OFFER: ₹1 (was ₹199)
    originalPrice: 399,
    currency: "INR",
    description:
      "A detailed workout tracking Excel sheet with exercise database, set/rep logging, progressive overload tracking and strength progress charts.",
    features: [
      "200+ exercise database",
      "Set, rep & weight logging",
      "Progressive overload tracker",
      "Strength progress charts",
      "Rest day planner",
      "Personal records dashboard",
    ],
    icon: <TrendingUp size={28} />,
    color: "blue",
  },
  {
    id: "nutrition-diet-planner",
    name: "Nutrition & Diet Planner",
    shortName: "Diet Planner",
    price: 1,              // 🔥 SPECIAL OFFER: ₹1 (was ₹249)
    originalPrice: 499,
    currency: "INR",
    description:
      "Plan your meals, track macros, count calories and visualise your nutrition journey with beautiful auto-charts in Excel.",
    features: [
      "Meal planning templates",
      "Calorie & macro calculator",
      "Grocery list generator",
      "Water intake tracker",
      "Weekly nutrition charts",
      "Diet comparison dashboard",
    ],
    icon: <Apple size={28} />,
    color: "orange",
  },
  {
    id: "body-measurement-tracker",
    name: "Body Measurement Tracker",
    shortName: "Body Tracker",
    price: 1,              // 🔥 SPECIAL OFFER: ₹1 (was ₹149)
    originalPrice: 299,
    currency: "INR",
    description:
      "Track every body measurement over time — weight, waist, chest, arms, thighs and more. Watch your transformation with auto-generated charts.",
    features: [
      "12+ body measurements",
      "Progress photo log",
      "BMI & body fat calculator",
      "Before/after comparison",
      "Monthly progress charts",
      "Goal setting dashboard",
    ],
    icon: <Ruler size={28} />,
    color: "pink",
  },
];

// ═══════════════════════════════════════════════════════════════
// 📝 HOW TO UPDATE PRICES
// ═══════════════════════════════════════════════════════════════
// 1. Find the product you want to update above
// 2. Change the "price" value (current selling price)
// 3. Change the "originalPrice" value (strikethrough price)
// 4. Save this file
// 5. The entire store will update automatically
// ═══════════════════════════════════════════════════════════════
