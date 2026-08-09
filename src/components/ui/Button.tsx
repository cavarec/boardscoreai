import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "lg" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-felt text-paper-raised hover:opacity-90 active:opacity-80",
  secondary:
    "bg-transparent border border-line-strong text-ink hover:bg-paper-raised active:bg-paper-sunken",
  ghost: "bg-transparent text-ink-soft hover:text-ink",
  danger: "bg-brick text-paper-raised hover:opacity-90",
};

const SIZE_CLASSES: Record<Size, string> = {
  lg: "text-base py-4 px-5 rounded-2xl",
  md: "text-sm py-2.5 px-4 rounded-xl",
};

/**
 * Bouton unique de l'app : gros par défaut ("lg"), pensé pour être tapé
 * autour d'une table sans viser précisément — pas de petits liens texte
 * pour les actions principales.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "lg", className = "", ...props }, ref) => (
    <button
      ref={ref}
      className={`font-semibold text-center transition-colors disabled:opacity-40 disabled:pointer-events-none ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...props}
    />
  )
);
Button.displayName = "Button";
