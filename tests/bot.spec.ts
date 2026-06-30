import { test, expect } from '@playwright/test';

test.describe('API Testing - Telegram Bot Webhook', () => {
  
  test('Akses Endpoint Webhook via GET (Pengecekan Server Aktif)', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/webhook');
    
    // Ekspektasi respons berhasil (Status 200)
    expect(response.ok()).toBeTruthy();
    
    const body = await response.json();
    expect(body).toEqual({ status: 'ok' });
  });

  test('Simulasi Telegram Kirim Pesan ke Webhook (POST API)', async ({ request }) => {
    // Ini adalah simulasi (Struktur Data Asli) yang dikirimkan oleh server Telegram
    // ketika ada user yang mengetik sesuatu di bot Anda.
    const mockTelegramUpdate = {
      update_id: 123456789,
      message: {
        message_id: 1,
        from: {
          id: 999999999,
          is_bot: false,
          first_name: "Tester",
          username: "test_user"
        },
        chat: {
          id: 999999999,
          first_name: "Tester",
          username: "test_user",
          type: "private"
        },
        date: Math.floor(Date.now() / 1000),
        text: "/start" // Ini contoh simulasi user mengirim "/start"
      }
    };

    // Kita kirimkan payload palsu ini ke aplikasi Next.js Anda (menggantikan peran server API Telegram)
    const response = await request.post('http://localhost:3000/api/webhook', {
      data: mockTelegramUpdate,
    });

    // Aplikasi kita harus selalu merespons status 200 agar bot tidak error
    expect(response.status()).toBe(200);

    const result = await response.json();
    // Karena di route.ts Anda menulis return NextResponse.json({ status: 'ok' })
    expect(result).toHaveProperty('status', 'ok');
  });

});
