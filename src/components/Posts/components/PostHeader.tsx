import { Button, Dropdown, Label } from "@heroui/react";
import { Bookmark, Earth, Ellipsis, Pencil, Trash2, Users } from "lucide-react";
import { Link } from "react-router-dom";
import type { Post } from "../../../interface/post";
import { useAuth } from "../../../context/AuthContext";
import { formatDate } from "../../../utils/formatDate";
import UserAvatar from "../../Shared/UserAvatar";

export default function PostHeader({ post, onEdit, onDelete, onBookmark }: {
  post: Post; onEdit: () => void; onDelete: () => void; onBookmark: () => void;
}) {
  const { user } = useAuth();
  const own = Boolean(user?._id && user._id === post.user?._id);
  return <div className="flex w-full items-center justify-between gap-3 p-4 sm:p-5">
    <div className="flex min-w-0 items-center gap-3">
      <Link to={`/profile/${post.user?._id}`}><UserAvatar user={post.user} className="size-12" /></Link>
      <div className="min-w-0">
        <Link to={`/profile/${post.user?._id}`} className="block truncate font-extrabold text-slate-900 hover:underline">{post.user?.name || "User"}</Link>
        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
          <time dateTime={post.createdAt} title={new Date(post.createdAt).toLocaleString()}>{formatDate(post.createdAt)}</time><span>·</span>
          {post.privacy === "friends" ? <Users size={13} /> : <Earth size={13} />}
          <span>{post.privacy === "friends" ? "Friends" : "Public"}</span>
        </div>
      </div>
    </div>
    <Dropdown>
      <Button isIconOnly aria-label="Post options" variant="ghost" className="rounded-full text-slate-500"><Ellipsis size={22} /></Button>
      <Dropdown.Popover>
        <Dropdown.Menu aria-label="Post options" onAction={(key) => { if (key === "edit") onEdit(); if (key === "delete") onDelete(); if (key === "save") onBookmark(); }}>
          <Dropdown.Item id="save" textValue={post.bookmarked ? "Unsave post" : "Save post"}><Bookmark size={16} /><Label>{post.bookmarked ? "Unsave post" : "Save post"}</Label></Dropdown.Item>
          {own && <Dropdown.Item id="edit" textValue="Edit post"><Pencil size={16} /><Label>Edit post</Label></Dropdown.Item>}
          {own && <Dropdown.Item id="delete" textValue="Delete post" variant="danger"><Trash2 size={16} /><Label>Delete post</Label></Dropdown.Item>}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  </div>;
}
