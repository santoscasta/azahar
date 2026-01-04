import { useEffect, useRef, useState } from 'react'
import { useTranslations } from '../../App.js'
import SearchIcon from '../icons/SearchIcon.js'
import ProjectIcon from '../icons/ProjectIcon.js'
import AreaIcon from '../icons/AreaIcon.js'

export type QuickFindResultType = 'task' | 'project' | 'area' | 'view'

export interface QuickFindResult {
    id: string
    type: QuickFindResultType
    title: string
    subtitle?: string
    icon?: string | React.ReactNode
    payload?: any
}

interface QuickFindOverlayProps {
    open: boolean
    onClose: () => void
    onSelect: (result: QuickFindResult) => void
    results: QuickFindResult[]
    query: string
    onQueryChange: (query: string) => void
}

export default function QuickFindOverlay({
    open,
    onClose,
    onSelect,
    results,
    query,
    onQueryChange,
}: QuickFindOverlayProps) {
    const { t } = useTranslations()
    const [selectedIndex, setSelectedIndex] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (open) {
            setSelectedIndex(0)
            setTimeout(() => inputRef.current?.focus(), 50)
        }
    }, [open, query])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!open) return
            if (e.key === 'Escape') {
                onClose()
            } else if (e.key === 'ArrowDown') {
                e.preventDefault()
                setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev))
            } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev))
            } else if (e.key === 'Enter') {
                e.preventDefault()
                if (results[selectedIndex]) {
                    onSelect(results[selectedIndex])
                }
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [open, results, selectedIndex, onClose, onSelect])

    useEffect(() => {
        const selectedElement = scrollRef.current?.children[selectedIndex] as HTMLElement
        if (selectedElement) {
            selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
        }
    }, [selectedIndex])

    if (!open) return null

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-[var(--color-overlay)] backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="az-card w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[60vh]"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center gap-4 px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
                    <SearchIcon className="h-5 w-5 text-[var(--color-text-muted)]" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => onQueryChange(e.target.value)}
                        placeholder={t('search.placeholder')}
                        className="flex-1 bg-transparent border-none outline-none text-lg font-medium text-[var(--on-surface)] placeholder-[var(--color-text-subtle)]"
                    />
                    <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-[var(--radius-chip)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] opacity-60">
                        <span className="text-[10px] font-bold">ESC</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1 bg-[var(--color-surface)]" ref={scrollRef}>
                    {results.length === 0 ? (
                        <div className="py-12 px-6 text-center space-y-2">
                            <p className="text-[var(--on-surface)] font-medium">
                                {query ? `${t('search.noResults')} "${query}"` : t('search.title')}
                            </p>
                            <p className="text-sm text-[var(--color-text-muted)]">
                                {query ? t('search.suggestions.empty') : t('help.usage.capture')}
                            </p>
                        </div>
                    ) : (
                        results.map((result, index) => (
                            <button
                                key={`${result.type}-${result.id}`}
                                className={`w-full flex items-center gap-4 px-4 py-3 rounded-[var(--radius-card)] transition-colors text-left ${index === selectedIndex
                                    ? 'bg-[var(--color-action-500)] text-[var(--on-primary)]'
                                    : 'hover:bg-[var(--color-primary-100)] text-[var(--on-surface)]'
                                    }`}
                                onClick={() => onSelect(result)}
                                onMouseEnter={() => setSelectedIndex(index)}
                            >
                                <div className={`h-10 w-10 flex items-center justify-center rounded-[var(--radius-card)] ${index === selectedIndex ? 'bg-white/20' : 'bg-[var(--color-surface-elevated)] border border-[var(--color-border)]'
                                    }`}>
                                    {result.type === 'task' && <span className="text-lg">➔</span>}
                                    {result.type === 'project' && <ProjectIcon className="h-4 w-4" />}
                                    {result.type === 'area' && <AreaIcon className="h-4 w-4" />}
                                    {result.type === 'view' && <span className="text-lg">📌</span>}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="font-semibold truncate">{result.title}</p>
                                    {result.subtitle && (
                                        <p className={`text-xs truncate ${index === selectedIndex ? 'text-white/80' : 'text-[var(--color-text-muted)]'}`}>
                                            {result.subtitle}
                                        </p>
                                    )}
                                </div>
                                <div className={`text-[10px] font-bold px-2 py-0.5 rounded-[var(--radius-chip)] border ${index === selectedIndex ? 'border-white/40 bg-white/20' : 'border-[var(--color-border)] bg-[var(--color-surface-elevated)] text-[var(--color-text-muted)]'
                                    }`}>
                                    {t(`search.type.${result.type}`)}
                                </div>
                            </button>
                        ))
                    )}
                </div>

                {results.length > 0 && (
                    <div className="px-6 py-3 border-t border-[var(--color-border)] bg-[var(--color-surface-elevated)] flex items-center justify-between text-[11px] text-[var(--color-text-muted)]">
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                                <kbd className="px-1 py-0.5 rounded border border-[var(--color-border)] bg-[var(--color-surface)]">↑↓</kbd>
                                {t('search.title')}
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="px-1 py-0.5 rounded border border-[var(--color-border)] bg-[var(--color-surface)]">ENTER</kbd>
                                {t('search.navigate')}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
