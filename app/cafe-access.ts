import { env } from 'cloudflare:workers';
import { getChatGPTUser } from './chatgpt-auth';
import { defaultSettings } from './data';
import type { Role } from './access-policy';

export function cafeDb() {
  if (!env.DB) throw new Error('Database unavailable');
  return env.DB;
}
export async function readRecord(id: string) {
  const row = await cafeDb().prepare('SELECT data FROM records WHERE id=?').bind(id).first<{data: string}>();
  return row ? JSON.parse(row.data) : null;
}
export async function cafeContext() {
  const [user, settings, owner] = await Promise.all([getChatGPTUser(), readRecord('settings'), readRecord('owner')]);
  const s = {...defaultSettings, ...settings};
  const role: Role = user && owner?.id === user.userId ? 'admin'
    : user && s.managerEmail && user.email.toLowerCase() === s.managerEmail.toLowerCase() ? 'manager' : 'customer';
  return {user, s, owner, role};
}
