
import { expect, test } from '@playwright/test'

const credentials = {
  email: 'test@azahar.app',
  password: 'password123',
}

const seedTaskTitle = 'SMOKE - Inbox abierta'

test.describe('Smoke Test', () => {
  test('login, ver inbox y togglear tarea seeded', async ({ page }) => {
    await page.goto('/login')

    await page.fill('input[type="email"]', credentials.email)
    await page.fill('input[type="password"]', credentials.password)
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL(/\/app\/?$/)
    await expect(page.getByText('Inbox')).toBeVisible()

    const taskItem = page.locator('li', { hasText: seedTaskTitle }).first()
    await expect(taskItem.getByText(seedTaskTitle)).toBeVisible()

    const toggleToDone = taskItem.getByRole('button', { name: /Marcar como completada/i })
    await toggleToDone.click()
    await expect(taskItem.getByRole('button', { name: /Marcar como pendiente/i })).toBeVisible()

    const toggleToOpen = taskItem.getByRole('button', { name: /Marcar como pendiente/i })
    await toggleToOpen.click()
    await expect(taskItem.getByRole('button', { name: /Marcar como completada/i })).toBeVisible()
  })
})
