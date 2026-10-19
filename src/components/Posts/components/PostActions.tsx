import { Button } from "@heroui/react";
import { MessageCircle, Share2, ThumbsUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import type { Post } from "../../../interface/post";
import { useAuth } from "../../../context/AuthContext";
import { sharePost, toggleLike } from "../../../services/post.service";
import { errorMessage } from "../../../services/api";
import { usePostRefresh } from "../../../hooks/usePostRefresh";

export default function PostActions({ post }: { post: Post }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const refresh = usePostRefresh();
  const like = useMutation({ mutationFn: toggleLike, onSuccess: () => { void refresh(); }, onError: (error) => toast.error(errorMessage(error)) });
  const share = useMutation({ mutationFn: sharePost, onSuccess: () => { void refresh(); toast.success("Post shared to your profile"); }, onError: (error) => toast.error(errorMessage(error)) });
  const liked = Boolean(user && post.likes?.includes(user._id));
  return <div className="post-actions grid grid-cols-3 gap-1 border-t border-slate-100 px-2 py-2 sm:px-4">
    <Button variant="ghost" aria-pressed={liked} isDisabled={like.isPending} onPress={() => like.mutate(post._id)} className={`gap-2 px-1 text-sm font-bold ${liked ? "text-primary bg-primary-bg" : "text-slate-600"}`}><ThumbsUp size={19} className={liked ? "fill-current" : ""} />Like</Button>
    <Button variant="ghost" onPress={() => navigate(`/post/${post._id}#comments`)} className="gap-2 px-1 text-sm font-bold text-slate-600"><MessageCircle size={19} />Comment</Button>
    <Button variant="ghost" isDisabled={share.isPending} onPress={() => share.mutate(post._id)} className="gap-2 px-1 text-sm font-bold text-slate-600"><Share2 size={19} />Share</Button>
  </div>;
}
