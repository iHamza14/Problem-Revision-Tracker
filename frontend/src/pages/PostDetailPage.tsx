/**
 * PostDetailPage — Single post view with comments and like functionality
 */
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getPost, likePost } from "../services/api";
import CommentSection from "../components/CommentSection";
import type { CommentData } from "../components/CommentSection";
import "../styles/discuss.css";

type PostAuthor = {
  id: string;
  email: string;
  handle?: string | null;
};

type PostDetail = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author: PostAuthor;
  tags: { tag: { id: number; name: string } }[];
  comments: CommentData[];
  _count: { likes: number; comments: number };
  userLiked: boolean;
};

async function fetchPostDetail(postId: string): Promise<PostDetail> {
  return getPost(postId);
}

export default function PostDetailPage() {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(Boolean(postId));
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  /** Fetch post details */
  const fetchPost = async () => {
    if (!postId) return;
    try {
      const data = await fetchPostDetail(postId);
      setPost(data);
      setLiked(data.userLiked);
      setLikeCount(data._count.likes);
    } catch (err) {
      console.error("Failed to fetch post:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!postId) {
      return;
    }

    let cancelled = false;

    const loadPost = async () => {
      try {
        const data = await fetchPostDetail(postId);

        if (cancelled) {
          return;
        }

        setPost(data);
        setLiked(data.userLiked);
        setLikeCount(data._count.likes);
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to fetch post:", err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadPost();

    return () => {
      cancelled = true;
    };
  }, [postId]);

  /** Toggle like */
  const handleLike = async () => {
    if (!postId) return;
    try {
      const result = await likePost(postId);
      setLiked(result.liked);
      setLikeCount((prev) => (result.liked ? prev + 1 : prev - 1));
    } catch (err) {
      console.error("Failed to toggle like:", err);
    }
  };

  if (loading) {
    return (
      <div className="post-detail-page">
        <div className="post-detail-container">
          <div className="post-detail-card">
            <div className="skeleton" style={{ height: 28, width: "70%", marginBottom: 16 }} />
            <div className="skeleton" style={{ height: 14, width: "40%", marginBottom: 32 }} />
            <div className="skeleton" style={{ height: 14, width: "100%", marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 14, width: "90%", marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 14, width: "80%" }} />
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="post-detail-page">
        <div className="post-detail-container">
          <Link to="/discuss" className="post-detail-back">← Back to Discussions</Link>
          <p style={{ color: "var(--text-muted)", textAlign: "center", paddingTop: "48px" }}>
            Post not found.
          </p>
        </div>
      </div>
    );
  }

  const date = new Date(post.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="post-detail-page" id="post-detail-page">
      <div className="post-detail-container">
        {/* Back link */}
        <Link to="/discuss" className="post-detail-back">
          ← Back to Discussions
        </Link>

        {/* Post content */}
        <div className="post-detail-card">
          <h1 className="post-detail-title">{post.title}</h1>

          <div className="post-detail-meta">
            <span style={{ color: "var(--text-accent)", fontWeight: 600 }}>
              {post.author.handle || post.author.email.split("@")[0]}
            </span>
            <span>{date}</span>
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="post-card-tags" style={{ marginBottom: 20 }}>
              {post.tags.map((t) => (
                <span key={t.tag.id} className="badge badge-accent">
                  {t.tag.name}
                </span>
              ))}
            </div>
          )}

          <div className="post-detail-content">{post.content}</div>

          {/* Like button */}
          <div className="post-detail-actions">
            <button
              className={`like-btn ${liked ? "liked" : ""}`}
              onClick={handleLike}
              id="like-btn"
            >
              {liked ? "❤️" : "🤍"} {likeCount}
            </button>
            <span style={{ color: "var(--text-muted)", fontSize: 14 }}>
              💬 {post._count.comments} comments
            </span>
          </div>
        </div>

        {/* Comments */}
        <CommentSection
          postId={post.id}
          comments={post.comments}
          isLoggedIn={true}
          onCommentAdded={fetchPost}
        />
      </div>
    </div>
  );
}
