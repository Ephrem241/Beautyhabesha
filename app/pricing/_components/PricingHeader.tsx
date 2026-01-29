export default function PricingHeader() {
  return (
    <header className="text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-300">
        Membership Plans
      </p>
      <h1 className="mt-4 text-2xl font-semibold text-white sm:text-3xl lg:text-4xl">
        Premium visibility for every profile
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-sm text-zinc-400 sm:text-base">
        Choose a plan that matches your goals. Paid plans route you to payment
        instructions and activate after admin approval.
      </p>
    </header>
  );
}
