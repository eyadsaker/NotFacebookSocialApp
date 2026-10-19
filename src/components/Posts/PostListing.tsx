import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@heroui/react";
import { getAllPosts } from "../../services/post.service";
import { useAuth } from "../../context/AuthContext";
import { errorMessage } from "../../services/api";
import PostCard from "./components/PostCard";
import ErrorMessage from "../Shared/ErrorMessage/ErrorMessage";
import { Loader } from "../Shared/Loader/Loader";
import Pagination from "../Shared/Pagination";

export default function PostListing({ userId, saved = false }: { userId?: string; saved?: boolean }) {
  const { token } = useAuth();
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: ["posts", { userId, saved, page }],
    queryFn: () => getAllPosts(page, userId, saved),
    enabled: Boolean(token),
  });
  if (query.isPending) return <Loader />;
  if (query.isError) return <div className="space-y-3"><ErrorMessage error={errorMessage(query.error)} status="danger" /><Button variant="secondary" onPress={() => void query.refetch()}>Try again</Button></div>;
  const posts = query.data?.data.posts ?? [];
  return <section aria-label="Posts" className="space-y-5">
    {posts.length ? posts.map((post) => <PostCard key={post._id} post={post} />) : <div className="social-panel p-8 text-center text-slate-500">{saved ? "No saved posts yet. Save a post using its options menu." : "No posts here yet."}</div>}
    <Pagination page={page} hasMore={Boolean(query.data?.meta?.pagination?.nextPage)} pending={query.isFetching} onChange={setPage} />
  </section>;
}
