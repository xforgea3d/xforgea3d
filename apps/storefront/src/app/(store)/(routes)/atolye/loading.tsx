export default function AtolyeLoading() {
    return (
        <div className="max-w-2xl mx-auto py-10 px-4 animate-in fade-in duration-300">
            {/* Header skeleton */}
            <div className="mb-8 text-center space-y-3">
                <div className="h-5 w-40 rounded-full bg-orange-500/10 mx-auto animate-pulse" />
                <div className="h-8 w-64 rounded-lg bg-neutral-200 dark:bg-neutral-800 mx-auto animate-pulse" />
                <div className="h-4 w-80 rounded-lg bg-neutral-200 dark:bg-neutral-800 mx-auto animate-pulse" />
            </div>
            {/* Steps skeleton */}
            <div className="flex items-center gap-0 mb-10">
                {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center flex-1">
                        <div className="flex flex-col items-center flex-1 gap-1">
                            <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
                            <div className="h-2 w-10 rounded bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
                        </div>
                        {i < 3 && <div className="h-0.5 flex-1 mb-5 bg-neutral-200 dark:bg-neutral-700" />}
                    </div>
                ))}
            </div>
            {/* Upload area skeleton */}
            <div className="h-52 rounded-2xl border-2 border-dashed border-neutral-200 dark:border-neutral-700 animate-pulse" />
            <div className="h-20 rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse mt-4" />
        </div>
    )
}
