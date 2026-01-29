import Link from "next/link";
import { hasFeature } from "@/lib/feature-access";

type FeatureGateProps = {
  userId: string;
  featureKey: string;
  children: React.ReactNode;
  /** Shown when user lacks access. Default: upgrade CTA. */
  fallback?: React.ReactNode;
};

export async function FeatureGate({
  userId,
  featureKey,
  children,
  fallback,
}: FeatureGateProps) {
  const allowed = await hasFeature(userId, featureKey);

  if (allowed) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-4">
      <p className="text-sm text-zinc-400">
        This feature is not included in your current plan.
      </p>
      <Link
        href="/pricing"
        className="mt-3 inline-block rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-400"
      >
        Upgrade to unlock
      </Link>
    </div>
  );
}
