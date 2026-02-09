import { SkeletonCardStack } from "@/app/_components/ui/SkeletonCard";

export default function BrowseLoading() {
  return (
    <div className="fixed inset-0 browse-panel-top flex flex-col bg-black">
      <div className="h-14 shrink-0" />
      <div className="min-h-0 flex-1 flex items-center justify-center px-4">
        <SkeletonCardStack />
      </div>
    </div>
  );
}
