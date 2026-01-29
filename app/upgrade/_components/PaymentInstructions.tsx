export default function PaymentInstructions() {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-black p-4 sm:rounded-3xl sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
        Payment instructions
      </p>
      <p className="mt-3 text-sm text-zinc-400">
        Send your payment and upload proof. Admin approval is required to
        activate your subscription.
      </p>
      <div className="mt-4 grid gap-3 sm:mt-6 sm:gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 sm:rounded-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
            Bank transfer
          </p>
          <p className="mt-3 text-sm text-zinc-300">
            Account name: Beautyhabesha
          </p>
          <p className="text-sm text-zinc-300">Account number: 000-000-0000</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 sm:rounded-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
            Mobile money
          </p>
          <p className="mt-3 text-sm text-zinc-300">Provider: TeleBirr</p>
          <p className="text-sm text-zinc-300">Number: 0912 000 000</p>
        </div>
      </div>
    </section>
  );
}
