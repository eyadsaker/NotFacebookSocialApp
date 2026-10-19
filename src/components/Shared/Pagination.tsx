import { Button } from "@heroui/react";

export default function Pagination({ page, hasMore, onChange, pending = false }: {
  page: number; hasMore: boolean; onChange: (page: number) => void; pending?: boolean;
}) {
  if (page === 1 && !hasMore) return null;
  return <nav aria-label="Pagination" className="flex items-center justify-center gap-4 py-4">
    <Button variant="secondary" isDisabled={page <= 1 || pending} onPress={() => onChange(page - 1)}>Previous</Button>
    <span className="text-sm text-slate-500">Page {page}</span>
    <Button variant="secondary" isDisabled={!hasMore || pending} onPress={() => onChange(page + 1)}>Next</Button>
  </nav>;
}
