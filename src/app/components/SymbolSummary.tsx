import { useState } from "react";
import Card from "./Card";

function Summary({ text }: { text: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="relative">
            <div
                className={`text-white/80 leading-7  ${open ? "" : "max-h-40 overflow-hidden"
                    }`}
            >
                {text}
            </div>
            {!open && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent rounded-b-xl" />
            )}

            <div className="mt-2 flex justify-center">
                <button
                    onClick={() => setOpen(v => !v)}
                    className="rounded-lg border border-black/10 px-3 py-1.5 text-[13px] hover:bg-black/[0.04]"
                >
                    {open ? "Show less" : "Read more"}
                </button>
            </div>
        </div>
    );
}

export function Notes({ summary }) {
    return (
        <Card header={<div className="text-sm text-white/70">Notes</div>}>
            {summary ? (
                <Summary text={summary} />
            ) : (
                <div className="text-white/50">No summary available yet.</div>
            )}
        </Card>
    )
}

