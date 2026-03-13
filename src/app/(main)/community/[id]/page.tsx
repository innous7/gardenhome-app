"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Heart, MessageCircle, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";
import { toggleLike, addComment, deleteComment } from "../actions";

type PostDetail = {
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
  author_id: string;
  profiles: { name: string; avatar_url: string | null } | null;
};

type Comment = {
  id: string;
  content: string;
  author_id: string;
  created_at: string;
  profiles: { name: string } | null;
};

export default function CommunityPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { requireAuth } = useAuth();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id || null);

    const { data: postData } = await supabase
      .from("community_posts")
      .select("*, profiles!community_posts_author_id_fkey(name, avatar_url)")
      .eq("id", id)
      .single();
    setPost(postData as PostDetail | null);
    if (postData) {
      setLikeCount(postData.like_count);
      // Increment view
      await supabase.from("community_posts").update({ view_count: postData.view_count + 1 }).eq("id", id);
    }

    const { data: commentsData } = await supabase
      .from("community_comments")
      .select("*, profiles!community_comments_author_id_fkey(name)")
      .eq("post_id", id)
      .order("created_at", { ascending: true });
    setComments((commentsData as Comment[] | null) ?? []);

    if (user && postData) {
      const { data: likeData } = await supabase
        .from("community_likes")
        .select("id")
        .eq("post_id", id)
        .eq("user_id", user.id)
        .single();
      setLiked(!!likeData);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleLike = async () => {
    if (!requireAuth("좋아요를 누르려면 로그인이 필요합니다.")) return;
    const result = await toggleLike(id);
    if ("liked" in result && result.liked !== undefined) {
      setLiked(result.liked);
      setLikeCount(prev => result.liked ? prev + 1 : prev - 1);
    }
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;
    if (!requireAuth("댓글을 작성하려면 로그인이 필요합니다.")) return;
    await addComment(id, newComment.trim());
    setNewComment("");
    fetchData();
  };

  const handleDeleteComment = async (commentId: string) => {
    await deleteComment(commentId);
    fetchData();
  };

  if (loading) return <div className="pt-20 flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" /></div>;
  if (!post) return <div className="pt-20 text-center py-20 text-gray-400">게시글을 찾을 수 없습니다.</div>;

  return (
    <div className="pt-20 min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/community">
            <Button variant="ghost" size="icon" className="rounded-xl"><ArrowLeft className="w-5 h-5" /></Button>
          </Link>
          <span className="text-sm text-gray-500">{post.type === "SHOW" ? "정원 자랑" : "Q&A"}</span>
        </div>

        {/* Post content */}
        <Card className="p-6 sm:p-8">
          <h1 className="text-xl font-bold text-gray-900">{post.title}</h1>
          <div className="flex items-center gap-3 mt-3 pb-4 border-b">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm font-bold text-green-600">
              {post.profiles?.name?.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{post.profiles?.name}</p>
              <p className="text-xs text-gray-400">{new Date(post.created_at).toLocaleDateString("ko-KR")}</p>
            </div>
          </div>

          {/* Images */}
          {(post.images as string[])?.length > 0 && (
            <div className="mt-6 space-y-3">
              {(post.images as string[]).map((img, i) => (
                <img key={i} src={img} alt="" className="rounded-xl w-full" />
              ))}
            </div>
          )}

          {/* Text content */}
          <div className="mt-6 text-gray-700 leading-relaxed whitespace-pre-wrap">{post.content}</div>

          {/* Tags */}
          {(post.tags as string[])?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {(post.tags as string[]).map(tag => (
                <span key={tag} className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">#{tag}</span>
              ))}
            </div>
          )}

          {/* Like & stats */}
          <div className="flex items-center gap-4 mt-6 pt-4 border-t">
            <button onClick={handleLike} className={`flex items-center gap-1.5 text-sm transition-colors ${liked ? "text-red-500" : "text-gray-500 hover:text-red-500"}`}>
              <Heart className={`w-5 h-5 ${liked ? "fill-red-500" : ""}`} /> {likeCount}
            </button>
            <span className="flex items-center gap-1.5 text-sm text-gray-500">
              <MessageCircle className="w-5 h-5" /> {comments.length}
            </span>
          </div>
        </Card>

        {/* Comments */}
        <div className="mt-6">
          <h2 className="font-semibold text-gray-900 mb-4">댓글 {comments.length}개</h2>
          <div className="space-y-3">
            {comments.map(comment => (
              <Card key={comment.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">
                      {comment.profiles?.name?.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{comment.profiles?.name}</span>
                        <span className="text-xs text-gray-400">{new Date(comment.created_at).toLocaleDateString("ko-KR")}</span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                    </div>
                  </div>
                  {userId === comment.author_id && (
                    <button onClick={() => handleDeleteComment(comment.id)} className="text-gray-400 hover:text-red-500 p-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </Card>
            ))}
          </div>

          {/* Comment input */}
          <div className="mt-4 flex gap-2">
            <Input
              placeholder="댓글을 입력하세요"
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleComment()}
              className="h-11 rounded-xl flex-1"
            />
            <Button onClick={handleComment} disabled={!newComment.trim()} className="bg-green-600 hover:bg-green-700 text-white rounded-xl h-11 px-4">
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
