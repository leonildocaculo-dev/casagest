import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
  interface Window {
    Pusher: typeof Pusher;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Echo: any;
  }
}

if (typeof window !== 'undefined') {
  window.Pusher = Pusher;

  try {
    window.Echo = new Echo({
      broadcaster: 'reverb',
      key: process.env.NEXT_PUBLIC_REVERB_APP_KEY || 'default-key-to-prevent-crash',
      wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || 'localhost',
      wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080),
      wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080),
      forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME ?? 'https') === 'https',
      enabledTransports: ['ws', 'wss'],
    });
  } catch (error) {
    console.warn('Echo initialization failed:', error);
    window.Echo = null;
  }
}

export default typeof window !== 'undefined' ? window.Echo : null;
