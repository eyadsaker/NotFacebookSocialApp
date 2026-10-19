import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@heroui/react";
import { Bell, CheckCheck } from "lucide-react";
import { toast } from "react-toastify";
import { api, errorMessage } from "../../services/api";
import type { ApiResponse } from "../../interface/ApiResponse";
import type { User } from "../../interface/user";
import UserAvatar from "../../components/Shared/UserAvatar";
import { Loader } from "../../components/Shared/Loader/Loader";
import ErrorMessage from "../../components/Shared/ErrorMessage/ErrorMessage";
import Pagination from "../../components/Shared/Pagination";
import { formatDate } from "../../utils/formatDate";

interface Notification {
  _id: string; actor?: User; type: string; isRead: boolean; createdAt: string;
  entityType?: string; entity?: { _id: string; post?: string | { _id: string } };
}

export default function Notifications() {
  const [page, setPage] = useState(1);
  const [unread, setUnread] = useState(false);
  const client = useQueryClient();
  const query = useQuery({
    queryKey: ["notifications", page, unread],
    queryFn: async () => (await api.get<ApiResponse<{ notifications: Notification[] }>>("/notifications", { params: { page, limit: 10, unread } })).data,
  });
  const mark = useMutation({
    mutationFn: (id?: string) => api.patch(id ? `/notifications/${id}/read` : "/notifications/read-all"),
    onSuccess: () => { void client.invalidateQueries({ queryKey: ["notifications"] }); },
    onError: (error) => toast.error(errorMessage(error)),
  });
  function target(item: Notification) {
    if (item.entityType === "post" && item.entity?._id) return `/post/${item.entity._id}`;
    const postId = typeof item.entity?.post === "string" ? item.entity.post : item.entity?.post?._id;
    return postId ? `/post/${postId}#comments` : `/profile/${item.actor?._id}`;
  }
  const labels: Record<string, string> = { like_post: "liked your post", post_like: "liked your post", comment: "commented on your post", comment_post: "commented on your post", post_comment: "commented on your post", follow: "started following you", share: "shared your post", share_post: "shared your post", like_comment: "liked your comment" };
  return <section className="social-panel overflow-hidden">
    <div className="border-b border-slate-100 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="flex items-center gap-2 text-xl font-extrabold"><Bell size={22} />Notifications</h1><Button size="sm" variant="secondary" isDisabled={mark.isPending} onPress={() => mark.mutate(undefined)}><CheckCheck size={16} />Mark all as read</Button></div>
      <p className="mt-2 text-sm text-slate-500">Likes, comments, shares, and new connections.</p>
      <div className="mt-4 flex gap-2">{[false, true].map((value) => <button key={String(value)} onClick={() => { setUnread(value); setPage(1); }} className={`rounded-full px-4 py-1.5 text-sm font-bold ${unread === value ? "bg-primary text-white" : "bg-slate-100 text-slate-600"}`}>{value ? "Unread" : "All"}</button>)}</div>
    </div>
    <div className="space-y-3 p-4">
      {query.isPending && <Loader />}
      {query.isError && <><ErrorMessage status="danger" error={errorMessage(query.error)} /><Button onPress={() => void query.refetch()}>Retry</Button></>}
      {query.data?.data.notifications.map((item) => <article key={item._id} className={`flex gap-3 rounded-xl border p-4 ${item.isRead ? "border-slate-200" : "border-primary-border bg-primary-bg"}`}>
        <Link to={`/profile/${item.actor?._id}`}><UserAvatar user={item.actor} /></Link>
        <div className="min-w-0 flex-1"><Link to={target(item)} className="text-sm text-slate-700"><strong>{item.actor?.name || "Someone"}</strong> {labels[item.type] || item.type.replaceAll("_", " ")}</Link><p className="mt-1 text-xs text-slate-500">{formatDate(item.createdAt)}</p>
          {!item.isRead && <button className="mt-2 text-xs font-bold text-primary" disabled={mark.isPending} onClick={() => mark.mutate(item._id)}>Mark as read</button>}
        </div>
      </article>)}
      {query.isSuccess && !query.data.data.notifications.length && <p className="p-6 text-center text-sm text-slate-500">No {unread ? "unread " : ""}notifications yet.</p>}
      <Pagination page={page} hasMore={Boolean(query.data?.meta?.pagination?.nextPage)} onChange={setPage} />
    </div>
  </section>;
}
