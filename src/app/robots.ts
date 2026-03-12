import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://gardenhome.kr";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/mypage/", "/partner/", "/admin/", "/auth/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
