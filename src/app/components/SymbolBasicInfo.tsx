import { CompanyInfoTypes } from "../types"
import Card from "./Card"

const fmtNum = (n?: number) => n == null ? "—" : new Intl.NumberFormat().format(n);

export function CompanyInfo({ info }: { info: CompanyInfoTypes }) {
  return (
    <Card header={
      <div className="flex items-center justify-between text-xs uppercase tracking-wide text-white/50">
        <span>Company</span>
        {(info?.symbol || info?.exchange || info?.currency) && (
          <span className="font-mono text-[10px] rounded-full bg-black/[0.06] px-2 py-0.5 text-white/70">
            {[info?.symbol, info?.exchange, info?.currency].filter(Boolean).join(" · ")}
          </span>
        )}
      </div>
    }>
      {!info ? (
        <div className="h-[360px] w-full animate-pulse rounded-xl bg-white/10" />
      ) : (
        <div className="px-4 pb-4 pt-2 text-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-lg font-semibold leading-snug">
                {info.longName || info.shortName || "—"}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {info.sector && (
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                    {info.sector}
                  </span>
                )}
                {info.industry && (
                  <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700">
                    {info.industry}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Key facts */}
          <div className="my-4 h-px bg-black/10" />
          <dl className="grid grid-cols-1 gap-y-2 gap-x-6 sm:grid-cols-2 [font-variant-numeric:tabular-nums]">
            <div className="contents">
              <dt className="text-white/60">Employees</dt>
              <dd>{fmtNum(info.employees)}</dd>
            </div>
            <div className="contents">
              <dt className="text-white/60">Phone</dt>
              <dd>
                {info.phone ? <a href={`tel:${info.phone}`} className="hover:underline">{info.phone}</a> : "—"}
              </dd>
            </div>
            <div className="contents">
              <dt className="text-white/60">Website</dt>
              <dd className="truncate">
                {info.website ? (
                  <a href={info.website} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
                    {info.website.replace(/^https?:\/\//, "")}
                  </a>
                ) : "—"}
              </dd>
            </div>
          </dl>
          <div className="my-4 h-px bg-black/10" />
          <div className="rounded-lg border border-black/10 bg-black/[0.03] p-3">
            <div className="text-[12px] uppercase tracking-wide text-white/50">Headquarters</div>
            <div className="mt-1 truncate">
              {[
                info.address,
                info.city,
                info.state,
                info.zip,
                info.country,
              ].filter(Boolean).join(", ") || "—"}
            </div>
          </div>
          {info.website && (
            <div className="mt-7 flex justify-center">
              <a
                href={info.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-lg border border-black/10 px-4 py-1.5 text-[13px] hover:bg-black/[0.04]"
              >
                View
              </a>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}