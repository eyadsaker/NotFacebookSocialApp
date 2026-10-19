import { useLocation } from "react-router-dom";
import PostListing from "../../components/Posts/PostListing";
import PostComposer from "../../components/Posts/components/PostComposer";
import SuggestedFriends from "../../components/Layout/Sidebar/SuggestedFriends";

export default function Feed() {
  const { pathname } = useLocation();
  if (pathname === "/community") return <SuggestedFriends />;
  const saved = pathname === "/saved";
  return <div className="space-y-5">
    {saved ? <h1 className="text-xl font-extrabold text-slate-900">Saved posts</h1> : <PostComposer />}
    <PostListing key={saved ? "saved" : "feed"} saved={saved} />
  </div>;
}
