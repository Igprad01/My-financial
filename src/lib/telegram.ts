const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const BASE_URL = `https://api.telegram.org/bot${TOKEN}`;
async function callApi(method: string, payload: object) {
  if (!TOKEN) {
    console.error("❌ ERROR: TELEGRAM_BOT_TOKEN tidak ditemukan di .env");
    return null;
  }

  try {
    const response = await fetch(`${BASE_URL}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!data.ok) {
      console.error(`⚠️ Telegram API Error [${method}]:`, data.description);
    }

    return data;
  } catch (error) {
    console.error(`🔥 Network Error [${method}]:`, error);
    return null;
  }
}


export const telegram = {
  async sendMessage(chatId: number | string, text: string, options?: object) {
    return await callApi("sendMessage", {
      chat_id: chatId,
      text: text,
      parse_mode: "HTML",
      ...options,
    });
  },

  async sendChatAction(chatId: number | string, action: "typing" | "upload_photo" | "upload_document" = "typing") {
    return await callApi("sendChatAction", {
      chat_id: chatId,
      action: action,
    });
  },

  async deleteMessage(chatId: number | string, messageId: number) {
    return await callApi("deleteMessage", {
      chat_id: chatId,
      message_id: messageId,
    });
  },

  async sendDocument(chatId: number | string, file: Blob | File, filename: string, caption?: string) {
    if (!TOKEN) return null;
    const formData = new FormData();
    formData.append("chat_id", chatId.toString());
    formData.append("document", file, filename);
    if (caption) {
      formData.append("caption", caption);
      formData.append("parse_mode", "HTML");
    }

    try {
      const response = await fetch(`${BASE_URL}/sendDocument`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!data.ok) console.error(`⚠️ Telegram API Error [sendDocument]:`, data.description);
      return data;
    } catch (error) {
      console.error(`🔥 Network Error [sendDocument]:`, error);
      return null;
    }
  }
};