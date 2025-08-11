import clsx from "clsx";

export default function Card({
  children,
  className,
  header,
  footer,
}: {
  children?: React.ReactNode;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div
      className={clsx(
        "min-w-0 rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_10px_30px_rgba(0,0,0,0.25)]",
        "backdrop-blur supports-[backdrop-filter]:bg-white/[0.05]",
        "hover:border-white/20 transition-transform duration-200 hover:-translate-y-[1px]",
        className
      )}
    >
      {header && <div className="px-5 pt-4 pb-2">{header}</div>}
      <div className="px-5 py-4">{children}</div>
      {footer && <div className="px-5 pt-2 pb-4">{footer}</div>}
    </div>
  );
}
