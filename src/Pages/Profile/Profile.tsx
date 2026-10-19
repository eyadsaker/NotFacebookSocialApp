import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@heroui/react";
import { Settings, UserPlus } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { getMyProfile, getUserProfile, toggleFollow } from "../../services/user.service";
import { errorMessage } from "../../services/api";
import UserAvatar from "../../components/Shared/UserAvatar";
import ErrorMessage from "../../components/Shared/ErrorMessage/ErrorMessage";
import { Loader } from "../../components/Shared/Loader/Loader";
import PostListing from "../../components/Posts/PostListing";
import PostComposer from "../../components/Posts/components/PostComposer";

export default function Profile() {
  const { userId } = useParams();
  const { user } = useAuth();
  const client = useQueryClient();
  const query = useQuery({ queryKey: ["profile", userId || "me"], queryFn: () => userId ? getUserProfile(userId) : getMyProfile() });
  const follow = useMutation({
    mutationFn: toggleFollow,
    onSuccess: () => { void client.invalidateQueries({ queryKey: ["profile"] }); void client.invalidateQueries({ queryKey: ["suggestions"] }); void client.invalidateQueries({ queryKey: ["session"] }); },
    onError: (error) => toast.error(errorMessage(error)),
  });
  if (query.isPending) return <Loader />;
  if (query.isError) return <div className="space-y-3"><ErrorMessage status="danger" error={errorMessage(query.error)} /><Button onPress={() => void query.refetch()}>Retry</Button></div>;
  const profile = query.data;
  if (!profile) return <ErrorMessage status="warning" error="This profile could not be found." />;
  const own = profile._id === user?._id;
  return <div className="space-y-5">
    <section className="social-panel overflow-hidden">
      <div className="h-32 bg-linear-to-r from-slate-900 via-slate-700 to-slate-400 sm:h-44">{profile.cover && <img src={profile.cover} alt="Profile cover" className="h-full w-full object-cover" />}</div>
      <div className="px-5 pb-6">
        <div className="-mt-10 flex flex-wrap items-end justify-between gap-3">
          <div className="rounded-full bg-white p-1"><UserAvatar user={profile} className="size-24" /></div>
          {own ? <Link to="/settings" className="mb-1 inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700"><Settings size={17} />Settings</Link> : <Button className="gap-2 bg-primary text-white" isDisabled={follow.isPending} onPress={() => follow.mutate(profile._id)}><UserPlus size={17} />{profile.isFollowing ? "Unfollow" : "Follow"}</Button>}
        </div>
        <h1 className="mt-3 text-2xl font-extrabold text-slate-900">{profile.name}</h1>
        <p className="text-sm text-slate-500">@{profile.username || "user"}</p>
        <div className="mt-4 flex flex-wrap gap-5 text-sm text-slate-500"><span><strong className="text-slate-900">{profile.followersCount ?? 0}</strong> followers</span><span><strong className="text-slate-900">{profile.followingCount ?? 0}</strong> following</span></div>
        {own && profile.email && <p className="mt-3 text-sm text-slate-500">{profile.email}</p>}
      </div>
    </section>
    {own && <PostComposer />}
    <h2 className="text-lg font-extrabold">{own ? "My posts" : `${profile.name.split(" ")[0]}'s posts`}</h2>
    <PostListing key={profile._id} userId={profile._id} />
  </div>;
}
