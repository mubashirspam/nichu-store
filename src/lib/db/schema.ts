import {
  pgTable,
  uuid,
  text,
  numeric,
  integer,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Profiles (synced from Clerk) ────────────────────────────────────────────
export const profiles = pgTable("profiles", {
  id: text("id").primaryKey(), // Clerk user ID
  email: text("email").notNull(),
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Products ────────────────────────────────────────────────────────────────
export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  shortName: text("short_name").notNull(),
  description: text("description").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: numeric("original_price", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("INR"),
  features: jsonb("features").$type<string[]>().notNull().default([]),
  iconName: text("icon_name").notNull().default("Dumbbell"),
  color: text("color").notNull().default("emerald"),
  badge: text("badge"),
  fileUrl: text("file_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Orders ──────────────────────────────────────────────────────────────────
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  orderNumber: text("order_number").notNull(),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  discountAmount: numeric("discount_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  currency: text("currency").notNull().default("INR"),
  status: text("status").notNull().default("pending"),
  razorpayOrderId: text("razorpay_order_id"),
  razorpayPaymentId: text("razorpay_payment_id"),
  razorpaySignature: text("razorpay_signature"),
  offerCodeId: uuid("offer_code_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Order Items ─────────────────────────────────────────────────────────────
export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull(),
  productId: uuid("product_id").notNull(),
  productName: text("product_name").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull().default(1),
  fileUrl: text("file_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Cart Items ──────────────────────────────────────────────────────────────
export const cartItems = pgTable("cart_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  productId: uuid("product_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Offer Codes ─────────────────────────────────────────────────────────────
export const offerCodes = pgTable("offer_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  discountType: text("discount_type").notNull(),
  discountValue: numeric("discount_value", { precision: 10, scale: 2 }).notNull(),
  maxUses: integer("max_uses"),
  usedCount: integer("used_count").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  validFrom: timestamp("valid_from", { withTimezone: true }).notNull().defaultNow(),
  validUntil: timestamp("valid_until", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Offer Code Usage ────────────────────────────────────────────────────────
export const offerCodeUsage = pgTable("offer_code_usage", {
  id: uuid("id").primaryKey().defaultRandom(),
  offerCodeId: uuid("offer_code_id").notNull(),
  userId: text("user_id").notNull(),
  orderId: uuid("order_id").notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Relations ───────────────────────────────────────────────────────────────
export const ordersRelations = relations(orders, ({ many }) => ({
  orderItems: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  product: one(products, { fields: [cartItems.productId], references: [products.id] }),
}));

// ─── Landing Pages ───────────────────────────────────────────────────────────
export const landingPages = pgTable("landing_pages", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").notNull(),
  slug: text("slug").notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),

  // SEO & Tracking
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  metaPixelId: text("meta_pixel_id"),

  // Hero
  heroHeadline: text("hero_headline").notNull(),
  heroSubheadline: text("hero_subheadline"),
  heroVideoUrl: text("hero_video_url"),
  heroImageUrls: jsonb("hero_image_urls").$type<string[]>().default([]),
  heroCtaText: text("hero_cta_text").default("Buy Now"),

  // Lead Form
  leadFormEnabled: boolean("lead_form_enabled").default(true),
  leadFormHeadline: text("lead_form_headline"),
  leadFormFields: jsonb("lead_form_fields").$type<string[]>().default(["name", "email", "phone"]),
  leadFormCtaText: text("lead_form_cta_text").default("Get Access Now"),
  leadFormVideoUrl: text("lead_form_video_url"),

  // Offer/Urgency
  offerHeadline: text("offer_headline"),
  offerExpiresAt: timestamp("offer_expires_at", { withTimezone: true }),
  offerSlotsTotal: integer("offer_slots_total").default(100),
  offerSlotsUsed: integer("offer_slots_used").default(0),
  offerUrgencyText: text("offer_urgency_text"),

  // Social Proof & FAQ (JSONB)
  testimonials: jsonb("testimonials").$type<{ name: string; text: string; avatar_url?: string; rating?: number }[]>().default([]),
  stats: jsonb("stats").$type<{ label: string; value: string }[]>().default([]),
  faqs: jsonb("faqs").$type<{ question: string; answer: string }[]>().default([]),
  features: jsonb("features").$type<{ title: string; description: string; image_url?: string; video_url?: string }[]>().default([]),
  sections: jsonb("sections").$type<{ type: string; content: string; image_url?: string }[]>().default([]),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Leads ───────────────────────────────────────────────────────────────────
export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  landingPageId: uuid("landing_page_id").notNull(),
  productId: uuid("product_id").notNull(),
  name: text("name"),
  email: text("email"),
  phone: text("phone"),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  converted: boolean("converted").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Landing Page Relations ──────────────────────────────────────────────────
export const landingPagesRelations = relations(landingPages, ({ one, many }) => ({
  product: one(products, { fields: [landingPages.productId], references: [products.id] }),
  leads: many(leads),
}));

export const leadsRelations = relations(leads, ({ one }) => ({
  landingPage: one(landingPages, { fields: [leads.landingPageId], references: [landingPages.id] }),
}));
