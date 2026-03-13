import Link from "next/link";
import { getBlogPosts } from "@/lib/supabase/queries";
import { BLOG_CATEGORIES } from "@/lib/constants";
import type { BlogCategory } from "@/types";

export default async function BlogPreview() {
  const allBlogPosts = await getBlogPosts();
  const blogPosts = allBlogPosts.slice(0, 4);

  const gradients = [
    "from-green-300 to-emerald-500",
    "from-teal-300 to-green-500",
    "from-emerald-300 to-teal-500",
    "from-lime-300 to-green-500",
  ];

  return (
    <section className="bg-white py-12 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-gray-900">조경 가이드</h2>
          <Link
            href="/blog"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            더보기 &gt;
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {blogPosts.map((post, i) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group"
            >
              <article>
                <div
                  className={`aspect-[4/3] rounded-xl overflow-hidden bg-gradient-to-br ${gradients[i % gradients.length]} relative`}
                >
                  {post.cover_image_url && (
                    <img src={post.cover_image_url} alt={post.title} className="absolute inset-0 w-full h-full object-cover" />
                  )}
                </div>
                <div className="pt-3">
                  <span className="text-xs text-green-600 font-medium">
                    {BLOG_CATEGORIES[post.category as BlogCategory]}
                  </span>
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mt-1 group-hover:text-green-600 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-2">
                    {post.published_at} · 조회 {post.views.toLocaleString()}
                  </p>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
