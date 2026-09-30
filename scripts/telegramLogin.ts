import { TelegramClient } from '@mtcute/bun';
import qrcode from 'qrcode-terminal';
import { telegramUserClientOptions } from '../services/telegramUserClient';
import credentials from '../telegramApiCredentials.json';

// One-time interactive login, stores the session in storage/telegramUser.session
// Pass --qr to log in by scanning a QR code instead of entering a code
const useQr = process.argv.includes('--qr');
const client = new TelegramClient(telegramUserClientOptions);

const user = await client.start(
    useQr
        ? {
              qrCodeHandler: (url) => {
                  console.log(
                      'Scan in Telegram: Settings > Devices > Link Desktop Device'
                  );
                  qrcode.generate(url, { small: true });
              },
              password: () => client.input('2FA password > ')
          }
        : {
              phone: credentials.phone || (() => client.input('Phone > ')),
              code: () => client.input('Code > '),
              password: () => client.input('2FA password > '),
              codeSentCallback: (sent) =>
                  console.log(`Code sent via ${sent.type}`)
          }
);

console.log(`Logged in as ${user.displayName} (${user.id})`);

// Walk the dialogs once so chats referenced by numeric id can be resolved later
let dialogs = 0;
for await (const _ of client.iterDialogs()) dialogs++;
console.log(`Cached ${dialogs} dialogs`);

await client.destroy();
