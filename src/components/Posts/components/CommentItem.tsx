import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@heroui/react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import type { Comment } from "../../../interface/comment";
import { useAuth } from "../../../context/AuthContext";
import { deleteComment, saveComment } from "../../../services/comment.service";
import { usePostRefresh } from "../../../hooks/usePostRefresh";
import { errorMessage } from "../../../services/api";
import { formatDate } from "../../../utils/formatDate";
import UserAvatar from "../../Shared/UserAvatar";

export default function CommentItem({ comment, postId, postOwnerId }: { comment: Comment; postId: string; postOwnerId: string }) {
  const { user } = useAuth();
  const own = user?._id === comment.commentCreator?._id;
  const canDelete = own || user?._id === postOwnerId;
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [content, setContent] = useState(comment.content ?? "");
  const refresh = usePostRefresh();
  const edit = useMutation({ mutationFn: saveComment, onSuccess: () => { setEditing(false); void refresh(); toast.success("Comment updated"); }, onError: (error) => toast.error(errorMessage(error)) });
  const remove = useMutation({ mutationFn: deleteComment, onSuccess: () => { void refresh(); toast.success("Comment deleted"); }, onError: (error) => toast.error(errorMessage(error)) });
  return <div className="flex gap-2.5">
    <Link to={`/profile/${comment.commentCreator?._id}`}><UserAvatar user={comment.commentCreator} className="size-9" /></Link>
    <div className="min-w-0 flex-1">
      <div className="rounded-2xl bg-slate-100 px-3 py-2">
        <Link className="text-sm font-bold text-slate-900 hover:underline" to={`/profile/${comment.commentCreator?._id}`}>{comment.commentCreator?.name || "User"}</Link>
        {editing ? <form className="mt-2" onSubmit={(event) => { event.preventDefault(); if (content.trim()) edit.mutate({ postId, id: comment._id, content: content.trim() }); }}>
          <textarea aria-label="Edit comment" className="app-input" value={content} onChange={(event) => setContent(event.target.value)} maxLength={5000} />
          <div className="mt-2 flex gap-2"><Button size="sm" type="submit" isPending={edit.isPending} isDisabled={!content.trim() || edit.isPending}>Save</Button><Button size="sm" variant="ghost" onPress={() => setEditing(false)}>Cancel</Button></div>
        </form> : <p className="whitespace-pre-wrap wrap-break-word text-sm text-slate-700">{comment.content}</p>}
        {comment.image && <img src={comment.image} alt="Comment attachment" className="mt-2 max-h-48 rounded-lg object-contain" loading="lazy" />}
      </div>
      <div className="mt-1 flex items-center gap-3 px-2 text-xs text-slate-500">
        <time dateTime={comment.createdAt} title={new Date(comment.createdAt).toLocaleString()}>{formatDate(comment.createdAt)}</time>
        {own && <button type="button" onClick={() => { setContent(comment.content ?? ""); setEditing(true); }} className="flex items-center gap-1 hover:text-primary"><Pencil size={12} />Edit</button>}
        {canDelete && <button type="button" onClick={() => setConfirming(true)} className="flex items-center gap-1 hover:text-rose-600"><Trash2 size={12} />Delete</button>}
      </div>
      {confirming && <div role="alert" className="mt-2 rounded-lg bg-rose-50 p-3 text-sm">Delete this comment?
        <div className="mt-2 flex gap-2"><Button size="sm" className="bg-rose-600 text-white" isPending={remove.isPending} isDisabled={remove.isPending} onPress={() => remove.mutate({ postId, id: comment._id })}>Delete</Button><Button size="sm" variant="ghost" onPress={() => setConfirming(false)}>Cancel</Button></div>
      </div>}
    </div>
  </div>;
}
