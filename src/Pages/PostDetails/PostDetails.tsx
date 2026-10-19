import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@heroui/react";
import { ArrowLeft } from "lucide-react";
import { getPost } from "../../services/post.service";
import { getComments } from "../../services/comment.service";
import { errorMessage } from "../../services/api";
import PostCard from "../../components/Posts/components/PostCard";
import CommentItem from "../../components/Posts/components/CommentItem";
import CommentForm from "../../components/Posts/components/CommentForm";
import ErrorMessage from "../../components/Shared/ErrorMessage/ErrorMessage";
import { Loader } from "../../components/Shared/Loader/Loader";
import Pagination from "../../components/Shared/Pagination";

export default function PostDetails() {
  const { postId = "" } = useParams();
  return <PostDetailContent key={postId} postId={postId} />;
}

function PostDetailContent({ postId }: { postId: string }) {
  const [page, setPage] = useState(1);
  const commentsRef = useRef<HTMLElement>(null);
  const { hash } = useLocation();
  const post = useQuery({ queryKey: ["post", postId], queryFn: () => getPost(postId), enabled: Boolean(postId) });
  const comments = useQuery({ queryKey: ["comments", postId, page], queryFn: () => getComments(postId, page), enabled: Boolean(post.data) });
  useEffect(() => {
    if (post.data && hash === "#comments") commentsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [post.data, hash]);
  return <div className="space-y-5">
    <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-primary"><ArrowLeft size={17} />Back to feed</Link>
    {post.isPending && <Loader />}
    {post.isError && <div className="space-y-3"><ErrorMessage status="danger" error={errorMessage(post.error)} /><Button variant="secondary" onPress={() => void post.refetch()}>Try again</Button></div>}
    {post.data && <>
      <PostCard post={post.data} details />
      <section id="comments" ref={commentsRef} className="social-panel scroll-mt-24 space-y-5 p-5">
        <h1 className="text-lg font-extrabold">Comments <span className="text-slate-400">({post.data.commentsCount ?? 0})</span></h1>
        <CommentForm postId={postId} />
        {comments.isPending && <Loader />}
        {comments.isError && <div className="space-y-2"><ErrorMessage status="danger" error={errorMessage(comments.error)} /><Button variant="secondary" onPress={() => void comments.refetch()}>Retry comments</Button></div>}
        {comments.data?.data.comments?.map((comment) => <CommentItem key={comment._id} comment={comment} postId={postId} postOwnerId={post.data.user._id} />)}
        {comments.isSuccess && !comments.data.data.comments?.length && <p className="py-4 text-center text-sm text-slate-500">No comments yet. Start the conversation.</p>}
        <Pagination page={page} hasMore={Boolean(comments.data?.meta?.pagination?.nextPage)} onChange={setPage} pending={comments.isFetching} />
      </section>
    </>}
  </div>;
}
