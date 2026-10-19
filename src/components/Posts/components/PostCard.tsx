import { useState } from "react";
import { Button, Card } from "@heroui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PostActions from "./PostActions";
import PostHeader from "./PostHeader";
import PostStats from "./PostStats";
import PostComposer from "./PostComposer";
import CommentItem from "./CommentItem";
import CommentForm from "./CommentForm";
import type { Post } from "../../../interface/post";
import { deletePost, toggleBookmark } from "../../../services/post.service";
import { errorMessage } from "../../../services/api";
import { usePostRefresh } from "../../../hooks/usePostRefresh";

export default function PostCard({ post, details = false }: { post: Post; details?: boolean }) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const refresh = usePostRefresh();
  const client = useQueryClient();
  const navigate = useNavigate();
  const remove = useMutation({ mutationFn: deletePost, onSuccess: () => {
    client.removeQueries({ queryKey: ["post", post._id] });
    if (details) navigate("/");
    void refresh(); toast.success("Post deleted");
  }, onError: (error) => toast.error(errorMessage(error)) });
  const bookmark = useMutation({ mutationFn: toggleBookmark, onSuccess: () => { void refresh(); toast.success(post.bookmarked ? "Post removed from saved" : "Post saved"); }, onError: (error) => toast.error(errorMessage(error)) });
  if (editing) return <PostComposer post={post} onDone={() => setEditing(false)} />;
  return <Card className="social-panel gap-0 overflow-hidden p-0">
    <Card.Header className="p-0">
      <PostHeader post={post} onEdit={() => setEditing(true)} onDelete={() => setConfirming(true)} onBookmark={() => { if (!bookmark.isPending) bookmark.mutate(post._id); }} />
    </Card.Header>
    <Card.Content className="p-0">
      {post.body && <p className="whitespace-pre-wrap wrap-break-word px-5 pb-4 text-sm leading-relaxed text-slate-800">{post.body}</p>}
      {post.image && <Link to={`/post/${post._id}`}><img src={post.image} alt={post.body || "Post image"} className="max-h-170 w-full bg-slate-50 object-contain" loading="lazy" /></Link>}
      {post.sharedPost && <Link to={`/post/${post.sharedPost._id}`} className="m-4 block overflow-hidden rounded-xl border border-slate-200">
        <p className="p-3 text-sm font-bold">{post.sharedPost.user?.name}</p>
        {post.sharedPost.body && <p className="px-3 pb-3 text-sm">{post.sharedPost.body}</p>}
        {post.sharedPost.image && <img src={post.sharedPost.image} alt="Shared post" className="max-h-96 w-full object-contain" loading="lazy" />}
      </Link>}
      {confirming && <div role="alert" className="mx-5 mb-4 rounded-xl bg-rose-50 p-4 text-sm">
        <p className="font-bold">Delete this post?</p><p className="mt-1 text-slate-600">This will also remove its comments.</p>
        <div className="mt-3 flex gap-2"><Button className="bg-rose-600 text-white" isPending={remove.isPending} isDisabled={remove.isPending} onPress={() => remove.mutate(post._id)}>Delete post</Button><Button variant="ghost" onPress={() => setConfirming(false)}>Cancel</Button></div>
      </div>}
    </Card.Content>
    <Card.Footer className="block p-0">
      <PostStats post={post} />
      <PostActions post={post} />
      {!details && <div className="space-y-4 border-t border-slate-100 p-4">
        {post.topComment && <div><p className="mb-2 text-xs font-bold text-slate-500">Top comment</p><CommentItem comment={post.topComment} postId={post._id} postOwnerId={post.user?._id} /></div>}
        <CommentForm postId={post._id} />
      </div>}
    </Card.Footer>
  </Card>;
}
