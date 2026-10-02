interface PageHeaderProps {
  title: string
  subtitle?: string
  description?: string
  actions?: React.ReactNode
  action?: React.ReactNode
}

export function PageHeader({ title, subtitle, description, actions, action }: PageHeaderProps) {
  const displaySubtitle = subtitle || description
  const displayActions = actions || action

  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {displaySubtitle && (
          <p className="mt-1 text-sm text-muted-foreground">{displaySubtitle}</p>
        )}
      </div>
      {displayActions && <div className="flex items-center gap-2 shrink-0">{displayActions}</div>}
    </div>
  )
}