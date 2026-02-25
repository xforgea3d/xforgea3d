export default function BlogLoading() {
    return (
        <div className="py-10 space-y-6 animate-in fade-in duration-300 w-full">
            <div className="space-y-2 mb-6">
                <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-800 rounded-md animate-pulse" />
                <div className="h-4 w-64 bg-neutral-200 dark:bg-neutral-800 rounded-md animate-pulse" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="rounded-xl border overflow-hidden animate-pulse">
                        <div className="h-48 bg-neutral-200 dark:bg-neutral-700" />
                        <div className="p-4 space-y-3">
                            <div className="h-3 w-20 rounded bg-neutral-200 dark:bg-neutral-700" />
                            <div className="h-4 w-full rounded bg-neutral-200 dark:bg-neutral-700" />
                            <div className="h-4 w-3/4 rounded bg-neutral-200 dark:bg-neutral-700" />
                            <div className="h-3 w-24 rounded bg-neutral-200 dark:bg-neutral-700 mt-4" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
