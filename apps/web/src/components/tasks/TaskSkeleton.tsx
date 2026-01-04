export default function TaskSkeleton() {
    return (
        <div className="flex animate-pulse items-center gap-4 px-4 py-3 rounded-[var(--radius-card)] bg-[var(--color-surface)] border border-transparent">
            <div className="h-6 w-6 rounded-full bg-[var(--color-primary-100)]" />
            <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-[var(--color-primary-100)]" />
                <div className="h-3 w-1/2 rounded bg-[var(--color-primary-50)]" />
            </div>
            <div className="h-6 w-16 rounded-[var(--radius-chip)] bg-[var(--color-primary-50)]" />
        </div>
    )
}

export function TaskListSkeleton({ count = 5 }: { count?: number }) {
    return (
        <div className="space-y-1">
            {Array.from({ length: count }).map((_, i) => (
                <TaskSkeleton key={i} />
            ))}
        </div>
    )
}
