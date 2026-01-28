import Link from "next/link";
import { forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md";

type ButtonBaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
};

const baseClasses =
  "inline-flex items-center justify-center rounded-full font-semibold uppercase tracking-[0.2em] transition motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-emerald-400 text-emerald-950 hover:bg-emerald-300 focus-visible:outline-emerald-400",
  secondary:
    "bg-zinc-900 text-white hover:bg-zinc-800 focus-visible:outline-zinc-500",
  outline:
    "border border-zinc-700 text-zinc-200 hover:border-emerald-400 hover:text-emerald-300 focus-visible:outline-emerald-400",
  ghost:
    "text-emerald-300 hover:text-emerald-200 focus-visible:outline-emerald-400",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-xs",
  md: "px-6 py-3 text-sm",
};

export function getButtonClasses({
  variant = "primary",
  size = "sm",
  fullWidth,
  className,
}: ButtonBaseProps) {
  return [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? "w-full" : "",
    className ?? "",
  ]
    .join(" ")
    .trim();
}

type ButtonProps = ButtonBaseProps &
  React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant, size, fullWidth, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={getButtonClasses({ variant, size, fullWidth, className })}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

type ButtonLinkProps = ButtonBaseProps & {
  href: string;
  children: React.ReactNode;
  prefetch?: boolean;
};

export function ButtonLink({
  href,
  children,
  prefetch,
  variant,
  size,
  fullWidth,
  className,
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      prefetch={prefetch}
      className={getButtonClasses({ variant, size, fullWidth, className })}
    >
      {children}
    </Link>
  );
}
