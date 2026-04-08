// set-webhook.js
import dotenv from 'dotenv';

dotenv.config();



const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.log('❌ TELEGRAM_BOT_TOKEN tidak ditemukan di .env');
  process.exit(1);
}

const webhookUrl = 'http://localhost:3000/api/telegram';

console.log('🔄 Mengatur webhook ke:', webhookUrl);

fetch(`https://api.telegram.org/bot${token}/setWebhook?url=${webhookUrl}`)
  .then(res => res.json())
  .then(data => {
    if (data.ok) {
      console.log('✅ Webhook berhasil diatur!');
      console.log('🤖 Bot Telegram siap menerima pesan di:', webhookUrl);
      console.log('\n📝 Instruksi:');
      console.log('1. Jalankan: npm run dev');
      console.log('2. Buka Telegram dan kirim pesan ke bot Anda');
      console.log('3. Bot akan merespons!');
    } else {
      console.log('❌ Gagal mengatur webhook:', data.description);
      console.log('\n💡 Tips:');
      console.log('- Pastikan BOT_TOKEN benar');
      console.log('- Untuk production, gunakan HTTPS URL');
      console.log('- Untuk development lokal, gunakan ngrok atau tunnel service');
    }
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    console.log('\n🔧 Solusi: Pastikan koneksi internet stabil');
  });