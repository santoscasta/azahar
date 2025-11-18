import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render } from '@testing-library/react'
import MobileFab from '../../mobile/MobileFab'

describe('MobileFab', () => {
  it('invokes home handler when showing creation sheet', () => {
    const onHome = vi.fn()
    const onDetail = vi.fn()
    const { rerender } = render(
      <MobileFab isHomeView onTapHome={onHome} onTapDetail={onDetail} />
    )
    fireEvent.click(document.querySelector('button')!)
    expect(onHome).toHaveBeenCalled()
    expect(onDetail).not.toHaveBeenCalled()

    rerender(<MobileFab isHomeView={false} onTapHome={onHome} onTapDetail={onDetail} />)
    fireEvent.click(document.querySelector('button')!)
    expect(onDetail).toHaveBeenCalled()
  })
})
