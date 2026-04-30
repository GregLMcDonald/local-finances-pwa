interface EmptyStateProps {
  message: string
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center py-16">
      <p className="text-muted text-sm">{message}</p>
    </div>
  )
}
