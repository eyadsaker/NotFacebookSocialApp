
import { MessageCircle, Repeat, ThumbsUp } from "lucide-react";
import { Link } from "react-router-dom";
import type { Post } from "../../../interface/post";


interface PostStatsProps{
  post: Post
}

export default function PostStats({post}: PostStatsProps) {

  const {likesCount, sharesCount , commentsCount} = post
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-xs font-medium text-slate-500 sm:px-5 sm:text-sm">
      <div className="post-like-summary flex items-center gap-2">
        <span className="grid size-6 place-items-center rounded-full bg-primary text-white">
          <ThumbsUp size={12} className="fill-current" />
        </span>
        <span
          className="rounded font-semibold text-slate-600 transition-colors hover:text-primary hover:underline"
        >
          {likesCount ?? 0}{" "}Likes
        </span>
      </div>

      <div className="post-secondary-stats flex items-center gap-3 sm:gap-5">
        <div className="flex items-center gap-1">
          <MessageCircle size={12} />
          <Link to={`/post/${post._id}#comments`}>{commentsCount ?? 0} Comments</Link>
        </div>
        <div className="hidden items-center gap-1 sm:flex">
          <Repeat size={12} />
          <span>{sharesCount ?? 0} Shares</span>
        </div>
        <Link

          to={`/post/${post._id}`}
          className="font-bold text-primary transition-colors hover:text-primary-hover hover:underline"
        >
          View details
        </Link>
      </div>
    </div>
  );
}

