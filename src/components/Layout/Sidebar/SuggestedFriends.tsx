import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@heroui/react";
import { Search, UserPlus, UsersRound } from "lucide-react";
import { toast } from "react-toastify";
import { getSuggestions, toggleFollow } from "../../../services/user.service";
import { errorMessage } from "../../../services/api";
import { useAuth } from "../../../context/AuthContext";
import UserAvatar from "../../Shared/UserAvatar";
import { Loader } from "../../Shared/Loader/Loader";
import Pagination from "../../Shared/Pagination";

export default function SuggestedFriends() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { user } = useAuth();
  const client = useQueryClient();
  const query = useQuery({ queryKey: ["suggestions", page, search], queryFn: () => getSuggestions(page, search) });
  const follow = useMutation({
    mutationFn: toggleFollow,
    onSuccess: (result, id) => {
      client.setQueriesData<Awaited<ReturnType<typeof getSuggestions>>>({ queryKey: ["suggestions"] }, (cached) => {
        if (!cached) return cached;
        return { ...cached, data: { users: cached.data.users.map((person) => {
          if (person._id !== id) return person;
          const following = result.following;
          return { ...person, isFollowing: following, followersCount: Math.max(0, (person.followersCount ?? 0) + (following === Boolean(person.isFollowing) ? 0 : following ? 1 : -1)) };
        }) } };
      });
      void client.invalidateQueries({ queryKey: ["profile"] });
      void client.invalidateQueries({ queryKey: ["session"] });
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
  const users = query.data?.data.users?.filter((person) => person._id !== user?._id) ?? [];
  return <section className="social-panel p-4">
    <h2 className="flex items-center gap-2 font-extrabold text-slate-900"><UsersRound size={21} className="text-primary/60" />Suggested Friends<span className="ml-auto rounded-full bg-slate-50 px-2 py-1 text-xs text-slate-500">{users.length}</span></h2>
    <label className="relative mt-4 block"><Search size={17} className="absolute left-3 top-3 text-slate-400" /><input aria-label="Search friends" className="app-input pl-9" placeholder="Search friends..." value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} /></label>
    {query.isPending && <Loader />}
    {query.isError && <div className="py-4 text-sm text-slate-500"><p>{errorMessage(query.error)}</p><button onClick={() => void query.refetch()} className="mt-2 font-bold text-primary">Retry</button></div>}
    <div className="mt-4 space-y-3">{users.map((person) => <div key={person._id} className="rounded-2xl border border-slate-200 p-3">
      <div className="flex items-center gap-2">
        <Link to={`/profile/${person._id}`}><UserAvatar user={person} className="size-10" /></Link>
        <Link to={`/profile/${person._id}`} className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{person.name}</p><p className="truncate text-xs text-slate-500">@{person.username || "user"}</p></Link>
        <Button size="sm" className="h-8 gap-1 rounded-full bg-primary-bg px-2 text-xs font-bold text-primary" isDisabled={follow.isPending} onPress={() => follow.mutate(person._id)}><UserPlus size={14} />{person.isFollowing ? "Following" : "Follow"}</Button>
      </div>
      <p className="mt-4 text-xs text-slate-500"><span className="rounded bg-slate-50 px-1.5 py-1">{person.followersCount ?? 0} followers</span></p>
    </div>)}</div>
    {query.isSuccess && !users.length && <p className="py-5 text-center text-sm text-slate-500">No people found.</p>}
    <Pagination page={page} hasMore={Boolean(query.data?.meta?.pagination?.nextPage)} onChange={setPage} />
  </section>;
}
