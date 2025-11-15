type SkeletonProps = {
  className?: string
}

export const Skeleton = ({ className = '' }: SkeletonProps) => {
  return (
    <div className={`animate-pulse rounded-lg bg-surface-800/60 ${className}`}>
      <span className="sr-only">Loading...</span>
    </div>
  )
}


