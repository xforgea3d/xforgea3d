'use client'

export default function GlobalError({
   error,
   reset,
}: {
   error: Error & { digest?: string }
   reset: () => void
}) {
   return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
         <h2 className="text-2xl font-bold">Bir hata olustu</h2>
         <p className="text-muted-foreground max-w-md">
            Sayfa yuklenirken beklenmeyen bir hata meydana geldi.
         </p>
         <button
            onClick={reset}
            className="rounded-lg bg-foreground px-6 py-3 text-background font-medium hover:opacity-90 transition-opacity"
         >
            Tekrar Dene
         </button>
      </div>
   )
}
