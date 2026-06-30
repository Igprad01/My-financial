import { test, expect } from '@playwright/test';

test.describe('UAT - Aplikasi Keuangan My-financial', () => {
  test('Flow Login dan Melihat Dashboard (Skenario)', async ({ page }) => {
    // 1. Kunjungi halaman utama
    await page.goto('http://localhost:3000/');

    // Karena ini adalah UAT simulasi dan kita butuh login spesifik:
    // User yang belum login secara otomatis akan diarahkan (redirect) ke halaman login
    // ketika mencoba mengakses dashboard karena ada proteksi di middleware.ts.
    
    // Test ini disediakan sebagai template apabila Anda ingin mengisi proses testing asli.
    // Uncomment blok di bawah untuk menguji form login asli:
    
    /*
    await page.goto('http://localhost:3000/login');
    await page.getByPlaceholder('Email').fill('user@example.com');
    await page.getByPlaceholder('Password').fill('password123');
    await page.getByRole('button', { name: 'Masuk' }).click();

    // Verifikasi berada di dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible();
    await expect(page.getByText('Total Balance')).toBeVisible();
    */
  });

  test('Mengecek Proteksi Route: Redirect ke Login tanpa Auth Token', async ({ page }) => {
    // Skenario memastikan user guest tidak bisa buka dashboard
    // Berdasarkan middleware.ts, akses ke /dashboard tanpa auth_token akan di redirect ke /login
    await page.goto('http://localhost:3000/dashboard');
    
    // Playwright ekspektasi untuk melihat URL berpindah ke halaman login
    await expect(page).toHaveURL(/.*\/login/);
  });
});
