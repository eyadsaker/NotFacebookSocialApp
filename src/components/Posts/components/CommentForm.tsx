import { useRef, useState } from "react";
import { Button } from "@heroui/react";
import { Send } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useAuth } from "../../../context/AuthContext";
import { saveComment } from "../../../services/comment.service";
import { errorMessage } from "../../../services/api";
import { usePostRefresh } from "../../../hooks/usePostRefresh";
import UserAvatar from "../../Shared/UserAvatar";

export default function CommentForm({ postId }: { postId: string }) {
  const { user, isAuthenticated } = useAuth();
  const [content, setContent] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const refresh = usePostRefresh();
  const mutation = useMutation({
    mutationFn: saveComment,
    onSuccess: () => { setContent(""); void refresh(); inputRef.current?.focus(); },
    onError: (error) => toast.error(errorMessage(error)),
  });
  if (!isAuthenticated) return null;
  return <form className="flex items-center gap-2" onSubmit={(event) => { event.preventDefault(); if (content.trim()) mutation.mutate({ postId, content: content.trim() }); }}>
    <UserAvatar user={user} className="size-9" />
    <input ref={inputRef} className="app-input min-w-0 flex-1 rounded-full" placeholder="Write a comment..." aria-label="Write a comment" value={content} onChange={(event) => setContent(event.target.value)} maxLength={5000} />
    <Button type="submit" isIconOnly aria-label="Send comment" variant="ghost" className="text-primary" isPending={mutation.isPending} isDisabled={!content.trim() || mutation.isPending}><Send size={19} /></Button>
  </form>;
}
