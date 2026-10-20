import { useState, type FormEvent } from "react";
import { Button } from "@heroui/react";
import { MessageCircle, Share2, ThumbsUp, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import type { Post } from "../../../interface/post";
import { useAuth } from "../../../context/AuthContext";
import { sharePost, toggleLike } from "../../../services/post.service";
import { errorMessage } from "../../../services/api";
import { usePostRefresh } from "../../../hooks/usePostRefresh";
import UserAvatar from "../../Shared/UserAvatar";

export default function PostActions({ post }: { post: Post }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const refresh = usePostRefresh();
  const like = useMutation({ mutationFn: toggleLike, onSuccess: () => { void refresh(); }, onError: (error) => toast.error(errorMessage(error)) });
  const share = useMutation({ mutationFn: sharePost, onSuccess: () => { setIsShareDialogOpen(false); setShareMessage(""); void refresh(); }, onError: (error) => toast.error(errorMessage(error)) });
  const liked = Boolean(user && post.likes?.includes(user._id));
  const closeShareDialog = () => { if (!share.isPending) { setIsShareDialogOpen(false); setShareMessage(""); } };
  const submitShare = (event: FormEvent) => { event.preventDefault(); share.mutate({ id: post._id, body: shareMessage.trim() }); };
  return <>
  <div className="post-actions grid grid-cols-3 gap-1 border-t border-slate-100 px-2 py-2 sm:px-4">
    <Button variant="ghost" aria-pressed={liked} isDisabled={like.isPending} onPress={() => like.mutate(post._id)} className={`gap-2 px-1 text-sm font-bold ${liked ? "text-primary bg-primary-bg" : "text-slate-600"}`}><ThumbsUp size={19} className={liked ? "fill-current" : ""} />Like</Button>
    <Button variant="ghost" onPress={() => navigate(`/post/${post._id}#comments`)} className="gap-2 px-1 text-sm font-bold text-slate-600"><MessageCircle size={19} />Comment</Button>
    <Button variant="ghost" onPress={() => setIsShareDialogOpen(true)} className="gap-2 px-1 text-sm font-bold text-slate-600"><Share2 size={19} />Share</Button>
  </div>
  {isShareDialogOpen && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeShareDialog(); }}>
    <form role="dialog" aria-modal="true" aria-labelledby="share-post-title" onSubmit={submitShare} className="w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 sm:px-8"><h2 id="share-post-title" className="text-2xl font-extrabold text-slate-900">Share post</h2><button type="button" aria-label="Close share dialog" onClick={closeShareDialog} disabled={share.isPending} className="rounded-full p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"><X size={25} /></button></div>
      <div className="space-y-6 p-6 sm:p-8"><textarea aria-label="Share message" value={shareMessage} onChange={(event) => setShareMessage(event.target.value)} maxLength={10000} placeholder="Say something about this..." className="min-h-38 w-full resize-y rounded-2xl border-2 border-slate-200 p-5 text-lg text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-primary" />
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4"><UserAvatar user={user} className="size-12" /><div><p className="text-lg font-extrabold text-slate-900">{user?.name || "You"}</p><p className="text-sm font-semibold text-slate-500">@{user?.username || "user"}</p></div></div>
      </div>
      <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-5 sm:px-8"><Button type="button" variant="ghost" onPress={closeShareDialog} isDisabled={share.isPending} className="border border-slate-300 bg-white px-6 font-bold text-slate-700">Cancel</Button><Button type="submit" isPending={share.isPending} isDisabled={share.isPending} className="bg-primary px-7 font-extrabold text-white">Share now</Button></div>
    </form>
  </div>}
  </>;
}
