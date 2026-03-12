"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, MessageCircle, Eye, PenSquare, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createClient } from "@/lib/supabase/client";

type Post = {
  id: string;
  type: string;
  title: string;
  content: string;
  images: string[];
  tags: string[];
  like_count: number;
  comment_count: number;
  view_count: number;
  created_at: string;
  profiles: { name: string; avatar_url: string | null } | null;
};

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("SHOW");

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("community_posts")
        .select("*, profiles!community_posts_author_id_fkey(name, avatar_url)")
        .eq("type", activeTab)
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(30);
      setPosts((data as Post[] | null) ?? []);
      setLoading(false);
    };
    fetchPosts();
  }, [activeTab]);

  const gradients = ["from-green-400 to-emerald-500", "from-teal-400 to-cyan-500", "from-lime-400 to-green-500", "from-emerald-400 to-teal-500"];

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">커뮤니티</h1>
            <p className="text-gray-500 mt-1">정원 이야기를 나눠보세요</p>
          </div>
          <Link href="/community/write">
            <Button className="bg-green-600 hover:bg-green-700 text-white rounded-full px-5">
              <PenSquare className="w-4 h-4 mr-2" /> 글쓰기
            </Button>
          </Link>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border rounded-xl p-1 h-auto">
            <TabsTrigger value="SHOW" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-green-600 data-[state=active]:text-white">
              정원 자랑
            </TabsTrigger>
            <TabsTrigger value="QNA" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-green-600 data-[state=active]:text-white">
              Q&A
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
              </div>
            ) : posts.length === 0 ? (
              <Card className="p-12 text-center">
                <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400 text-lg">아직 게시글이 없습니다</p>
                <p className="text-gray-400 text-sm mt-1">첫 번째 글을 작성해보세요!</p>
              </Card>
            ) : activeTab === "SHOW" ? (
              /* Gallery grid for SHOW */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {posts.map((post, i) => (
                  <Link key={post.id} href={`/community/${post.id}`}>
                    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
                      <div className={`aspect-[4/3] bg-gradient-to-br ${gradients[i % gradients.length]} relative`}>
                        {(post.images as string[])?.length > 0 ? (
                          <img src={(post.images as string[])[0]} alt="" className="w-full h-full object-cover" />
                        ) : null}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        <div className="absolute bottom-2 right-2 flex gap-2 text-white text-xs">
                          <span className="flex items-center gap-0.5 bg-black/40 px-2 py-0.5 rounded-full">
                            <Heart className="w-3 h-3" /> {post.like_count}
                          </span>
                          <span className="flex items-center gap-0.5 bg-black/40 px-2 py-0.5 rounded-full">
                            <MessageCircle className="w-3 h-3" /> {post.comment_count}
                          </span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-gray-900 line-clamp-1">{post.title}</h3>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                          <span>{post.profiles?.name}</span>
                          <span>&middot;</span>
                          <span>{new Date(post.created_at).toLocaleDateString("ko-KR")}</span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              /* List view for QNA */
              <div className="space-y-3">
                {posts.map(post => (
                  <Link key={post.id} href={`/community/${post.id}`}>
                    <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            {post.comment_count > 0 && <Badge className="bg-green-100 text-green-700 text-[10px]">답변 {post.comment_count}</Badge>}
                          </div>
                          <h3 className="font-medium text-gray-900 line-clamp-1">{post.title}</h3>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{post.content}</p>
                          <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                            <span>{post.profiles?.name}</span>
                            <span>{new Date(post.created_at).toLocaleDateString("ko-KR")}</span>
                            <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" /> {post.view_count}</span>
                            <span className="flex items-center gap-0.5"><Heart className="w-3 h-3" /> {post.like_count}</span>
                          </div>
                        </div>
                        {(post.images as string[])?.length > 0 && (
                          <div className="w-16 h-16 bg-gray-100 rounded-lg ml-4 shrink-0 overflow-hidden">
                            <img src={(post.images as string[])[0]} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
