// set-webhook.js
import dotenv from 'dotenv';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.log('❌ TELEGRAM_BOT_TOKEN tidak ditemukan di .env');
  process.exit(1);
}

async function setWebhook() {
  try {
    let publicUrl = process.argv[2]; // Ambil URL dari argumen (misal untuk Vercel)

    if (!publicUrl) {
      // Ambil URL dari ngrok lokal yang sedang berjalan di port 4040
      try {
        const ngrokRes = await fetch('http://127.0.0.1:4040/api/tunnels');
        const ngrokData = await ngrokRes.json();
        if (ngrokData.tunnels && ngrokData.tunnels.length > 0) {
          publicUrl = ngrokData.tunnels[0].public_url;
        }
      } catch (e) {
        console.log('⚠️ Ngrok tidak terdeteksi berjalan, menggunakan URL default localhost (tidak disarankan).');
        publicUrl = 'http://localhost:3000';
      }
    }

    if (!publicUrl.includes("https")) {
       console.log('❌ URL webhook harus HTTPS! Jalankan ngrok terlebih dahulu.');
       publicUrl = publicUrl.replace("http://", "https://");
    }

    const webhookUrl = `${publicUrl}/api/webhook`;
    console.log('🔄 Mengatur webhook ke:', webhookUrl);

    const telegramRes = await fetch(`https://api.telegram.org/bot${token}/setWebhook?url=${webhookUrl}`);
    const data = await telegramRes.json();

    if (data.ok) {
      console.log('✅ Webhook berhasil diatur!');
      console.log('🤖 Bot Telegram siap menerima pesan di:', webhookUrl);
      console.log('\n📝 Instruksi:');
      console.log('1. Pastikan Next.js berjalan di production atau dev (npm run dev / npm run start)');
      console.log('2. Buka Telegram dan kirim pesan ke bot Anda');
    } else {
      console.log('❌ Gagal mengatur webhook:', data.description);
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

setWebhook();