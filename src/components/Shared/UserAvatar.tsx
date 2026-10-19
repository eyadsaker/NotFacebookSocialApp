import { Avatar } from "@heroui/react";
import type { User } from "../../interface/user";

export default function UserAvatar({ user, className = "size-11" }: { user?: User | null; className?: string }) {
  const name = user?.name || "User";
  return <Avatar className={`shrink-0 bg-primary-bg text-primary ${className}`}>
    {user?.photo && <Avatar.Image src={user.photo} alt={name} />}
    <Avatar.Fallback>{name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</Avatar.Fallback>
  </Avatar>;
}
