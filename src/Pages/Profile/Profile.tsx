import { useRef, useState, type ChangeEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@heroui/react";
import { Camera, ImagePlus, Settings, UserPlus } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { getMyProfile, getUserProfile, toggleFollow, uploadCoverPhoto, uploadProfilePhoto } from "../../services/user.service";
import { errorMessage } from "../../services/api";
import UserAvatar from "../../components/Shared/UserAvatar";
import ErrorMessage from "../../components/Shared/ErrorMessage/ErrorMessage";
import { Loader } from "../../components/Shared/Loader/Loader";
import PostListing from "../../components/Posts/PostListing";
import PostComposer from "../../components/Posts/components/PostComposer";

export default function Profile() {
  const { userId } = useParams();
  const { token, user } = useAuth();
  const client = useQueryClient();
  const photoInput = useRef<HTMLInputElement>(null);
  const coverInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<"photo" | "cover" | null>(null);
  const query = useQuery({ queryKey: ["profile", userId || "me"], queryFn: () => userId ? getUserProfile(userId) : getMyProfile() });
  const follow = useMutation({
    mutationFn: toggleFollow,
    onSuccess: () => { void client.invalidateQueries({ queryKey: ["profile"] }); void client.invalidateQueries({ queryKey: ["suggestions"] }); void client.invalidateQueries({ queryKey: ["session"] }); },
    onError: (error) => toast.error(errorMessage(error)),
  });
  const updateProfile = (updatedProfile: typeof user) => {
    if (!updatedProfile) return;
    if (token) client.setQueryData(["session", token], updatedProfile);
    client.setQueryData(["profile", "me"], updatedProfile);
    client.setQueryData(["profile", updatedProfile._id], updatedProfile);
    void client.invalidateQueries({ queryKey: ["posts"] });
  };
  const photoUpload = useMutation({
    mutationFn: uploadProfilePhoto,
    onMutate: () => setUploading("photo"),
    onSuccess: (updatedProfile) => { updateProfile(updatedProfile); toast.success("Profile photo updated"); },
    onError: (error) => toast.error(errorMessage(error)),
    onSettled: () => setUploading(null),
  });
  const coverUpload = useMutation({
    mutationFn: uploadCoverPhoto,
    onMutate: () => setUploading("cover"),
    onSuccess: (updatedProfile) => { updateProfile(updatedProfile); toast.success("Cover photo updated"); },
    onError: (error) => toast.error(errorMessage(error)),
    onSettled: () => setUploading(null),
  });
  const selectImage = (event: ChangeEvent<HTMLInputElement>, type: "photo" | "cover") => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please choose an image file."); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error("Please choose an image smaller than 10 MB."); return; }
    if (type === "photo") photoUpload.mutate(file);
    else coverUpload.mutate(file);
  };
  if (query.isPending) return <Loader />;
  if (query.isError) return <div className="space-y-3"><ErrorMessage status="danger" error={errorMessage(query.error)} /><Button onPress={() => void query.refetch()}>Retry</Button></div>;
  const profile = query.data;
  if (!profile) return <ErrorMessage status="warning" error="This profile could not be found." />;
  const own = profile._id === user?._id;
  return <div className="space-y-5">
    <section className="social-panel overflow-hidden">
      <div className="relative h-32 bg-linear-to-r from-slate-900 via-slate-700 to-slate-400 sm:h-44">
        {profile.cover && <img src={profile.cover} alt="Profile cover" className="h-full w-full object-cover" />}
        {own && <><input ref={coverInput} aria-label="Change cover photo" className="sr-only" type="file" accept="image/*" onChange={(event) => selectImage(event, "cover")} />
          <button type="button" onClick={() => coverInput.current?.click()} disabled={uploading !== null} className="absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-lg bg-white/95 px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"><ImagePlus size={16} />{uploading === "cover" ? "Uploading..." : "Change cover photo"}</button></>}
      </div>
      <div className="px-5 pb-6">
        <div className="-mt-10 flex flex-wrap items-end justify-between gap-3">
          <div className="relative rounded-full bg-white p-1"><UserAvatar user={profile} className="size-24" />
            {own && <><input ref={photoInput} aria-label="Change profile photo" className="sr-only" type="file" accept="image/*" onChange={(event) => selectImage(event, "photo")} />
              <button type="button" aria-label="Upload profile photo" onClick={() => photoInput.current?.click()} disabled={uploading !== null} className="absolute bottom-0 right-0 grid size-8 place-items-center rounded-full border-2 border-white bg-primary text-white shadow-sm transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-70"><Camera size={15} /></button></>}
          </div>
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
