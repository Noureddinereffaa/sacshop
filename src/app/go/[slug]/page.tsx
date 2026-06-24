import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import GoToSiteClient from "./GoToSiteClient";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/['"]/g, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim().replace(/['"]/g, "");
  if (!url || !key) return null;
  return createClient(url, key);
}

type Props = {
  params: Promise<{ slug: string }>;
};

async function getLinkData(slug: string) {
  const sb = getSupabase();
  if (!sb) return null;

  const { data } = await sb
    .from("short_links")
    .select("product_name, product_image, destination")
    .eq("slug", slug)
    .maybeSingle();

  return data || null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const link = await getLinkData(slug);

  if (!link) {
    return {
      title: "Service Serigraphie",
      description: "تصفح منتجاتنا المميزة",
    };
  }

  const siteName = "Service Serigraphie";

  return {
    title: `${link.product_name} | ${siteName}`,
    description: `اطلب الآن ${link.product_name} - جودة عالية وتوصيل لكل الولايات`,
    openGraph: {
      title: link.product_name,
      description: `اطلب الآن ${link.product_name} - جودة عالية وتوصيل لكل الولايات`,
      siteName,
      images: link.product_image ? [{ url: link.product_image, width: 800, height: 800, alt: link.product_name }] : [],
      type: "website",
      locale: "ar_DZ",
    },
    twitter: {
      card: "summary_large_image",
      title: link.product_name,
      description: `اطلب الآن ${link.product_name} - جودة عالية وتوصيل لكل الولايات`,
      images: link.product_image ? [link.product_image] : [],
    },
    robots: { index: false, follow: false },
  };
}

export default async function GoToSitePage({ params }: Props) {
  const { slug } = await params;
  const link = await getLinkData(slug);

  return (
    <GoToSiteClient
      slug={slug}
      productName={link?.product_name || "منتجنا المميز"}
      productImage={link?.product_image || null}
      destination={link?.destination || "/products"}
    />
  );
}
