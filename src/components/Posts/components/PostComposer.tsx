import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@heroui/react";
import { Earth, ImagePlus, Send, Smile, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useAuth } from "../../../context/AuthContext";
import { savePost } from "../../../services/post.service";
import { errorMessage } from "../../../services/api";
import { usePostRefresh } from "../../../hooks/usePostRefresh";
import type { Post } from "../../../interface/post";
import UserAvatar from "../../Shared/UserAvatar";

export default function PostComposer({ post, onDone }: { post?: Post; onDone?: () => void }) {
  const { user } = useAuth();
  const [body, setBody] = useState(post?.body ?? "");
  const [privacy, setPrivacy] = useState(post?.privacy ?? "public");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [showFeelings, setShowFeelings] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const refresh = usePostRefresh();
  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);
  const mutation = useMutation({
    mutationFn: savePost,
    onSuccess: () => {
      setBody(""); setImage(null); setPreview("");
      if (inputRef.current) inputRef.current.value = "";
      void refresh();
      onDone?.();
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!body.trim() && !image && !post?.image) return;
    const form = new FormData();
    form.append("body", body.trim());
    form.append("privacy", privacy);
    if (image) form.append("image", image);
    mutation.mutate({ id: post?._id, form });
  }
  return <form onSubmit={submit} className="social-panel p-4 sm:p-6">
    <div className="mb-5 flex items-center gap-3">
      <UserAvatar user={user} className="size-12" />
      <div><p className="font-extrabold text-slate-900">{user?.name || "Your post"}</p>
        <label className="mt-1 flex items-center gap-1 text-xs text-slate-500">
          <Earth size={13} />
          <select aria-label="Post visibility" className="rounded-lg bg-slate-50 px-2 py-1" value={privacy} onChange={(event) => setPrivacy(event.target.value as Post["privacy"])}>
            <option value="public">Public</option><option value="friends">Friends</option>
          </select>
        </label>
      </div>
      {post && <span className="ml-auto text-sm font-semibold text-primary">Edit post</span>}
    </div>
    <textarea ref={textRef} aria-label="Post text" className="min-h-36 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 p-4 text-base outline-none focus:border-primary sm:min-h-40" maxLength={10000} placeholder={`What's on your mind, ${user?.name?.split(" ")[0] || "friend"}?`} value={body} onChange={(event) => setBody(event.target.value)} />
    {(image || post?.image) && <div className="relative mt-3">
      <img src={image ? preview : post?.image} alt="Post attachment preview" className="max-h-64 w-full rounded-xl object-contain bg-slate-50" />
      {image && <button type="button" aria-label="Remove selected image" onClick={() => { setImage(null); setPreview(""); if (inputRef.current) inputRef.current.value = ""; }} className="absolute right-2 top-2 rounded-full bg-white p-2 shadow"><X size={16} /></button>}
    </div>}
    <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" aria-label="Attach photo" onChange={(event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) { toast.error("Choose an image smaller than 10 MB."); event.target.value = ""; return; }
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }} />
    {showFeelings && <div className="mt-3 flex flex-wrap gap-2">{["😊 happy", "🙏 grateful", "🎉 excited", "💻 productive"].map((feeling) => <button type="button" className="rounded-full bg-primary-bg px-3 py-1 text-sm" key={feeling} onClick={() => { setBody((value) => value + ` — feeling ${feeling}`); setShowFeelings(false); textRef.current?.focus(); }}>{feeling}</button>)}</div>}
    <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-200 pt-4">
      <Button variant="ghost" onPress={() => inputRef.current?.click()} className="gap-2 px-2 text-sm text-slate-600"><ImagePlus size={20} className="text-emerald-600" />Photo</Button>
      <Button variant="ghost" onPress={() => setShowFeelings(!showFeelings)} className="gap-2 px-2 text-sm text-slate-600"><Smile size={20} className="text-amber-500" /><span>Feeling/activity</span></Button>
      <div className="ml-auto flex gap-2">{post && <Button variant="ghost" onPress={onDone} isDisabled={mutation.isPending}>Cancel</Button>}
      <Button type="submit" isPending={mutation.isPending} isDisabled={mutation.isPending || (!body.trim() && !image && !post?.image)} className="gap-2 bg-primary px-5 font-bold text-white">{post ? "Save" : "Post"}<Send size={17} /></Button></div>
    </div>
  </form>;
}
