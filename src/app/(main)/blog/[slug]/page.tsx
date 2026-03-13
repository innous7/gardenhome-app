export const dynamic = 'force-dynamic';

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Eye, Tag, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AuthLink } from "@/components/auth/AuthLink";
import { getBlogPostBySlug, getBlogPosts, incrementBlogViews } from "@/lib/supabase/queries";
import { BLOG_CATEGORIES } from "@/lib/constants";
import type { Metadata } from "next";
import type { BlogCategory } from "@/types";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: "Not Found" };
  return {
    title: `${post.title} | GardenHome 블로그`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
    },
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  // Fire and forget: increment view count
  incrementBlogViews(slug);

  const relatedPosts = (await getBlogPosts()).filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <div className="pt-20 min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-green-400 to-emerald-600 h-64 sm:h-80 relative">
        <div className="absolute inset-0 bg-black/20" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10 h-full flex flex-col justify-end pb-8">
          <Badge className="w-fit bg-white/90 text-gray-700 mb-4">
            {BLOG_CATEGORIES[post.category as BlogCategory]}
          </Badge>
          <h1 className="text-2xl sm:text-4xl font-bold text-white">{post.title}</h1>
          <div className="flex items-center gap-4 mt-4 text-sm text-white/80">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" /> {post.published_at ? new Date(post.published_at).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" }) : ""}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" /> {post.views.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <Link href="/blog">
            <Button variant="ghost" size="sm" className="text-gray-500">
              <ArrowLeft className="w-4 h-4 mr-1" /> 목록으로
            </Button>
          </Link>
          <Button variant="ghost" size="sm" className="text-gray-500">
            <Share2 className="w-4 h-4 mr-1" /> 공유
          </Button>
        </div>

        <article className="prose prose-lg prose-green max-w-none">
          <p className="text-lg text-gray-600 leading-relaxed font-medium">{post.excerpt}</p>
          <hr className="my-8" />
          {post.content ? (
            post.content.startsWith("<") ? (
              // HTML content from Tiptap
              <div
                className="text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            ) : (
              // Plain text content (legacy)
              <div className="text-gray-700 leading-relaxed space-y-4">
                {post.content.split("\n\n").map((paragraph: string, i: number) => {
                  if (!paragraph.trim()) return null;
                  // Handle headings
                  if (paragraph.startsWith("### ")) {
                    return <h3 key={i} className="text-xl font-bold text-gray-900 mt-8 mb-3">{paragraph.slice(4)}</h3>;
                  }
                  if (paragraph.startsWith("## ")) {
                    return <h2 key={i} className="text-2xl font-bold text-gray-900 mt-10 mb-4">{paragraph.slice(3)}</h2>;
                  }
                  // Handle bullet lists
                  if (paragraph.includes("\n- ") || paragraph.startsWith("- ")) {
                    const items = paragraph.split("\n").filter(line => line.startsWith("- "));
                    return (
                      <ul key={i} className="list-disc list-inside space-y-1">
                        {items.map((item, j) => (
                          <li key={j} className="text-gray-700">{item.slice(2)}</li>
                        ))}
                      </ul>
                    );
                  }
                  // Regular paragraphs
                  return <p key={i}>{paragraph}</p>;
                })}
              </div>
            )
          ) : (
            <div className="my-8 bg-gray-50 rounded-2xl p-8 text-center text-gray-400">
              콘텐츠가 아직 작성되지 않았습니다.
            </div>
          )}
        </article>

        {/* Tags */}
        <div className="flex items-center gap-2 mt-8 pt-8 border-t">
          <Tag className="w-4 h-4 text-gray-400" />
          {(post.tags as string[]).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">#{tag}</Badge>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 bg-green-50 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">조경이 필요하신가요?</h3>
          <p className="text-gray-500 mb-4">검증된 조경 전문가에게 무료 견적을 받아보세요.</p>
          <AuthLink href="/quote" message="견적을 요청하려면 로그인이 필요합니다.">
            <Button className="bg-green-600 hover:bg-green-700 text-white rounded-full px-8">
              무료 견적 받기
            </Button>
          </AuthLink>
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl font-bold text-gray-900 mb-6">관련 글</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedPosts.map((rp, i) => {
                const gradients = ["from-green-300 to-emerald-500", "from-teal-300 to-green-500", "from-emerald-300 to-teal-500"];
                return (
                  <Link key={rp.id} href={`/blog/${rp.slug}`} className="group">
                    <div className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-md transition-all">
                      <div className={`aspect-[16/10] bg-gradient-to-br ${gradients[i % gradients.length]}`} />
                      <div className="p-3">
                        <h4 className="text-sm font-medium text-gray-900 group-hover:text-green-600 line-clamp-2">
                          {rp.title}
                        </h4>
                        <p className="text-xs text-gray-400 mt-1">{rp.published_at ? new Date(rp.published_at).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" }) : ""}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
