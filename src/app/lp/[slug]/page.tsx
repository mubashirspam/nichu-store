import { db } from "@/lib/db";
import { landingPages, products } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import LandingPageClient from "./LandingPageClient";

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

async function getLandingPage(slug: string) {
  const [page] = await db
    .select()
    .from(landingPages)
    .where(and(eq(landingPages.slug, slug), eq(landingPages.isActive, true)))
    .limit(1);

  if (!page) return null;

  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.id, page.productId))
    .limit(1);

  return { page, product: product || null };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getLandingPage(slug);
  if (!data) return { title: "Not Found" };

  return {
    title: data.page.metaTitle || data.page.heroHeadline,
    description: data.page.metaDescription || data.page.heroSubheadline || "",
  };
}

export default async function LandingPage({ params }: Props) {
  const { slug } = await params;
  const data = await getLandingPage(slug);

  if (!data || !data.product) {
    notFound();
  }

  // Serialize for client
  const pageData = {
    id: data.page.id,
    productId: data.page.productId,
    slug: data.page.slug,
    metaPixelId: data.page.metaPixelId,
    heroHeadline: data.page.heroHeadline,
    heroSubheadline: data.page.heroSubheadline,
    heroVideoUrl: data.page.heroVideoUrl,
    heroImageUrls: (data.page.heroImageUrls || []) as string[],
    heroCtaText: data.page.heroCtaText || "Buy Now",
    leadFormEnabled: data.page.leadFormEnabled ?? true,
    leadFormHeadline: data.page.leadFormHeadline,
    leadFormFields: (data.page.leadFormFields || ["name", "email", "phone"]) as string[],
    leadFormCtaText: data.page.leadFormCtaText || "Get Access Now",
    leadFormVideoUrl: data.page.leadFormVideoUrl,
    offerHeadline: data.page.offerHeadline,
    offerExpiresAt: data.page.offerExpiresAt?.toISOString() || null,
    offerSlotsTotal: data.page.offerSlotsTotal || 100,
    offerSlotsUsed: data.page.offerSlotsUsed || 0,
    offerUrgencyText: data.page.offerUrgencyText,
    testimonials: (data.page.testimonials || []) as { name: string; text: string; avatar_url?: string; rating?: number }[],
    stats: (data.page.stats || []) as { label: string; value: string }[],
    faqs: (data.page.faqs || []) as { question: string; answer: string }[],
    features: (data.page.features || []) as { title: string; description: string; image_url?: string; video_url?: string }[],
  };

  const productData = {
    id: data.product.id,
    name: data.product.name,
    price: Number(data.product.price),
    originalPrice: Number(data.product.originalPrice),
    currency: data.product.currency,
  };

  return <LandingPageClient page={pageData} product={productData} />;
}
