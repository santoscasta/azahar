# AZAHAR UI Governance Checklist

Source: AZAHAR_Manual_Identidad_UI_Things_v2.1.pdf
Last updated: 2026-01-03

## Tokens
- Colors: bg/surface/text/accent defined in the manual only.
- Typography scale: H1, H2, Body, Meta, Micro.
- Spacing: 4/8/12/16/24.
- Radii: 8/12.
- Shadows: levels 1/2 only.

## Terminology
- Use "Cuando" for scheduled date.
- Use "Fecha limite" for deadline.
- Avoid "Prioridad" in UI; use "Importante" label.

## Core UI components
- Sidebar navigation.
- Task list.
- Chips and badges.
- Popovers/modals anchored to the action origin.
- Draggable FAB (mobile).
- Quick Find dropdown.
- Fixed action bar (desktop).

## PR checklist (before merging)
1) "Cuando" and "Fecha limite" are used correctly and consistently.
2) Labels stay neutral; color is reserved for deadlines/alerts.
3) Popover or modal is anchored to the source control.
4) Drag & drop and multi-select behave consistently across equivalent views.
5) Desktop/iPad/mobile breakpoints keep full functionality.
