import { convertCurrency, formatMoney, formatRange } from "../currency";

interface Props {
  amount: number | null;
  currency: string;
  /** Secondary conversion shown underneath (e.g. destination currency). */
  secondaryCurrency?: string;
  secondaryPrefix?: string;
  className?: string;
  secondaryClassName?: string;
}

/**
 * Centralized price display: primary amount in the listing currency,
 * optional secondary conversion. All formatting flows through the
 * currency layer — never hard-coded in callers.
 */
export default function CurrencyDisplay({
  amount,
  currency,
  secondaryCurrency,
  secondaryPrefix = "≈",
  className = "",
  secondaryClassName = "",
}: Props) {
  if (amount == null || !Number.isFinite(amount)) return null;
  const secondary =
    secondaryCurrency && secondaryCurrency !== currency
      ? convertCurrency(amount, currency, secondaryCurrency)
      : null;
  return (
    <span className={`inline-flex flex-col ${className}`}>
      <span>{formatMoney(amount, currency)}</span>
      {secondary != null && secondaryCurrency && (
        <span className={`text-xs font-normal text-fog ${secondaryClassName}`}>
          {secondaryPrefix} {formatMoney(Math.round(secondary), secondaryCurrency)}
        </span>
      )}
    </span>
  );
}

export function CurrencyRange({
  low,
  high,
  currency,
  className = "",
}: {
  low: number | null;
  high: number | null;
  currency: string;
  className?: string;
}) {
  const text = formatRange(low, high, currency);
  if (!text) return null;
  return <span className={className}>{text}</span>;
}
