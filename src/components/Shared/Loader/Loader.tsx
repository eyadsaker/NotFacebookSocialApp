import {Spinner} from "@heroui/react";

export function Loader() {
  return (
    <div role="status" className="flex min-h-40 items-center justify-center gap-8">
      
      <div className="flex flex-col items-center gap-2">
        <Spinner />
        <span className="text-xs text-muted">Loading</span>
      </div>
      
    </div>
  );
}
