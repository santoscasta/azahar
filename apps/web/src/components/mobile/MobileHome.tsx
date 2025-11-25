import type { ReactNode } from 'react'

interface MobileHomeProps {
  renderSearch(): ReactNode
  renderHeader(): ReactNode
  renderFilters(): ReactNode
  renderError(): ReactNode
  renderTaskBoard(): ReactNode
  renderDraftCard?: () => ReactNode
  showDraft: boolean
  showSettingsInSearch?: boolean
}

export function MobileHome({
  renderSearch,
  renderHeader,
  renderFilters,
  renderError,
  renderTaskBoard,
  renderDraftCard,
  showDraft,
  showSettingsInSearch = false,
}: MobileHomeProps) {
  return (
    <div className={`space-y-6 pb-28 ${showSettingsInSearch ? 'pt-2' : ''}`}>
      {showDraft && renderDraftCard ? renderDraftCard() : null}
      <div className="relative">
        {renderSearch()}
      </div>
      {renderHeader()}
      {renderFilters()}
      {renderError()}
      <div className="space-y-4">{renderTaskBoard()}</div>
    </div>
  )
}

export default MobileHome
