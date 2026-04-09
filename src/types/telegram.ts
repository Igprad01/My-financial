// src/types/telegram.ts (atau taruh di atas file bot-commands.ts)
export interface TelegramUpdate {
  message?: {
    chat: { id: number };
    text?: string;
    from?: {
      id: number;
      first_name: string;
      username?: string;
    };
  };
  callback_query?: {
    id: string;
    data: string;
    message: { chat: { id: number } };
  };
}
