import { useQueryClient } from "@tanstack/react-query";

export function usePostRefresh() {
  const client = useQueryClient();
  return () => Promise.all([
    client.invalidateQueries({ queryKey: ["posts"] }),
    client.invalidateQueries({ queryKey: ["post"] }),
    client.invalidateQueries({ queryKey: ["comments"] }),
  ]);
}
