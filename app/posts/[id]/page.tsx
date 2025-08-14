import { LikeButton } from "@/components/post/like-button";
import { CommentList } from "@/components/post/comment-list";

async function getPost(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_ORIGIN ?? ""}/api/posts/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Post not found");
  return res.json();
}

export default async function PostPage({ params }: { params: { id: string } }) {
  const post = await getPost(params.id);
  return (
    <article className="prose prose-neutral max-w-none">
      <h1 className="!mb-2">{post.title}</h1>
      <p className="text-neutral-600 !mt-0">{post.category}</p>
      <div className="not-prose mt-4 mb-6">
        <LikeButton postId={post._id} initialCount={post.likeCount} />
      </div>
      <div className="whitespace-pre-wrap leading-relaxed">{post.body}</div>
      <hr className="my-8 border-neutral-200" />
      <CommentList postId={post._id} />
    </article>
  );
}
