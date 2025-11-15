import type { PropsWithChildren, ReactNode } from 'react'

type EmptyStateProps = {
  title: string
  description?: string
  icon?: ReactNode
}

export const EmptyState = ({
  title,
  description,
  icon,
  children,
}: PropsWithChildren<EmptyStateProps>) => {
  return (
    <div className="rounded-2xl border border-dashed border-slate-700 bg-surface-900/40 p-6 text-center text-sm text-slate-300">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-800/60 text-brand-200">
        {icon ?? <span>ℹ</span>}
      </div>
      <h3 className="mt-3 text-base font-semibold text-white">{title}</h3>
      {description && <p className="mt-2 text-xs text-slate-400">{description}</p>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  )
}


