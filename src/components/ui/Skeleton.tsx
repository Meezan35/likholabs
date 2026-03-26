interface SkeletonProps {
  className?: string
  lines?: number
  height?: string
}

export function Skeleton({ className = '', height = 'h-4' }: SkeletonProps) {
  return (
    <div
      className={[
        'rounded-md bg-card animate-pulse',
        height,
        className,
      ].join(' ')}
      aria-hidden
    />
  )
}

export function ContentCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Skeleton className="w-24" height="h-5" />
        <Skeleton className="w-16" height="h-7" />
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton className="w-full" height="h-4" />
        <Skeleton className="w-full" height="h-4" />
        <Skeleton className="w-3/4" height="h-4" />
        <Skeleton className="w-full" height="h-4" />
        <Skeleton className="w-5/6" height="h-4" />
      </div>
      <div className="flex items-center justify-between pt-1">
        <Skeleton className="w-20" height="h-4" />
        <div className="flex gap-2">
          <Skeleton className="w-20" height="h-7" />
          <Skeleton className="w-24" height="h-7" />
        </div>
      </div>
    </div>
  )
}

export function ResultsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        {['LinkedIn', 'Twitter/X', 'Instagram'].map((p) => (
          <Skeleton key={p} className="w-28" height="h-9" />
        ))}
      </div>
      <ContentCardSkeleton />
      <ContentCardSkeleton />
      <ContentCardSkeleton />
    </div>
  )
}
