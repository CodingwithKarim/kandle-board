import Card from "../Card";
import { Candle, Interval } from "../../types"
import { ChartBase } from "./ChartBase";

export default function SymbolChart({
    candles,
    interval,
    loading
}: {
    candles?: Candle[];
    interval?: Interval;
    loading?: boolean;
}) {
    return (
        <Card
            className="md:col-span-2"
            header={<div className="text-sm text-white/70">Price</div>}
        >
            <div className="relative h-[220px] sm:h-[280px] md:h-[360px] rounded-xl border border-white/10 bg-white/5">
                {!candles?.length && (
                    <div className="h-full w-full animate-pulse rounded-xl bg-white/10" />
                )}
                <div className="absolute inset-0">
                    {!loading && candles && candles.length > 0 && interval ? (
                        <ChartBase data={candles} interval={interval} />
                    ) : null}
                </div>
            </div>
        </Card>
    );
}