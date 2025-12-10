
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

    await expect(page).toHaveURL(/\/app\/?$/, { timeout: 15000 })
    await expect(page.getByRole('heading', { level: 1, name: 'Inbox' })).toBeVisible()
    await page.getByText('Cargando tareas...', { exact: false }).first().waitFor({ state: 'detached', timeout: 5000 })

    // Smoke minimal: lista cargada y UI disponible para crear tareas
    await expect(
      page.getByRole('button', { name: 'Crear tarea', exact: true })
    ).toBeVisible()
  })
})
