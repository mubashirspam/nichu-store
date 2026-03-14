import {
  pgTable,
  uuid,
  text,
  numeric,
  integer,
  boolean,
  timestamp,
  jsonb,
  varchar,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Better Auth Tables ───────────────────────────────────────────────────────
// These are managed by Better Auth — do not rename columns.

export const authUser = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: text("role").notNull().default("user"), // "user" | "admin"
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const authSession = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id").notNull().references(() => authUser.id, { onDelete: "cascade" }),
});

export const authAccount = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id").notNull().references(() => authUser.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const authVerification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ─── Profiles (legacy — kept for admin/tracker feature compat) ─────────────
export const profiles = pgTable("profiles", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  role: text("role").notNull().default("user"),
  authProvider: text("auth_provider").notNull().default("neon"),
  emailVerified: boolean("email_verified").notNull().default(false),
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

// ─── Pending Checkouts (guest checkout before webhook fires) ─────────────────
export const pendingCheckouts = pgTable("pending_checkouts", {
  id: uuid("id").primaryKey().defaultRandom(),
  razorpayOrderId: text("razorpay_order_id").notNull().unique(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  productId: uuid("product_id").notNull(),
  status: text("status").notNull().default("pending"), // pending | completed | failed
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ─── Orders ──────────────────────────────────────────────────────────────────
export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),         // Better Auth user.id
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
  sections: jsonb("sections").$type<{ title: string; content: string; image_url?: string; layout?: "left" | "right" }[]>().default([]),

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

// ─── Tracker: User Cloud Accounts ────────────────────────────────────────────
export const userCloudAccounts = pgTable(
  "user_cloud_accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    provider: varchar("provider", { length: 20 }).notNull(), // 'google' | 'microsoft'
    accessToken: text("access_token").notNull(),
    refreshToken: text("refresh_token"),
    tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true }),
    email: varchar("email", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [uniqueIndex("uq_user_cloud_accounts").on(t.userId, t.provider)]
);

// ─── Tracker: Master Templates (admin manages) ────────────────────────────────
export const masterTemplates = pgTable(
  "master_templates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    provider: varchar("provider", { length: 20 }).notNull(), // 'google' | 'microsoft'
    fileId: varchar("file_id", { length: 255 }).notNull(),
    fileUrl: text("file_url"),
    trackerType: varchar("tracker_type", { length: 50 }).notNull(),
    version: varchar("version", { length: 20 }).default("1.0"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [uniqueIndex("uq_master_templates").on(t.productId, t.provider)]
);

// ─── Tracker: User Trackers (cloned templates) ────────────────────────────────
export const userTrackers = pgTable(
  "user_trackers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id),
    cloudAccountId: uuid("cloud_account_id")
      .notNull()
      .references(() => userCloudAccounts.id),
    fileId: varchar("file_id", { length: 255 }).notNull(),
    fileUrl: text("file_url"),
    trackerType: varchar("tracker_type", { length: 50 }).notNull(),
    isActive: boolean("is_active").default(true),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [
    uniqueIndex("uq_user_trackers").on(t.userId, t.productId, t.cloudAccountId),
    index("idx_user_trackers_user").on(t.userId),
  ]
);

// ─── Tracker: Sync Logs ───────────────────────────────────────────────────────
export const syncLogs = pgTable(
  "sync_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userTrackerId: uuid("user_tracker_id")
      .notNull()
      .references(() => userTrackers.id, { onDelete: "cascade" }),
    action: varchar("action", { length: 50 }).notNull(),
    data: jsonb("data"),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (t) => [index("idx_sync_logs_tracker").on(t.userTrackerId)]
);

// ─── Relations ────────────────────────────────────────────────────────────────
export const userCloudAccountsRelations = relations(userCloudAccounts, ({ many }) => ({
  trackers: many(userTrackers),
}));

export const masterTemplatesRelations = relations(masterTemplates, ({ one }) => ({
  product: one(products, { fields: [masterTemplates.productId], references: [products.id] }),
}));

export const userTrackersRelations = relations(userTrackers, ({ one, many }) => ({
  product: one(products, { fields: [userTrackers.productId], references: [products.id] }),
  cloudAccount: one(userCloudAccounts, { fields: [userTrackers.cloudAccountId], references: [userCloudAccounts.id] }),
  syncLogs: many(syncLogs),
}));

export const syncLogsRelations = relations(syncLogs, ({ one }) => ({
  tracker: one(userTrackers, { fields: [syncLogs.userTrackerId], references: [userTrackers.id] }),
}));

export const landingPagesRelations = relations(landingPages, ({ one, many }) => ({
  product: one(products, { fields: [landingPages.productId], references: [products.id] }),
  leads: many(leads),
}));

export const leadsRelations = relations(leads, ({ one }) => ({
  landingPage: one(landingPages, { fields: [leads.landingPageId], references: [landingPages.id] }),
}));
