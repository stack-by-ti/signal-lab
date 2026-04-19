import { appendFile, mkdir } from 'fs/promises';
import { dirname, join } from 'path';

const LOG_FILE = join(process.cwd(), 'logs', 'app.log');

export async function appendScenarioLog(entry: {
  level: string;
  scenario: string;
  status: string;
}): Promise<void> {
  const line =
    JSON.stringify({ ...entry, ts: new Date().toISOString() }) + '\n';
  try {
    await mkdir(dirname(LOG_FILE), { recursive: true });
    await appendFile(LOG_FILE, line, { flag: 'a' });
  } catch {
    // avoid breaking scenario flow if log volume is unavailable
  }
}
