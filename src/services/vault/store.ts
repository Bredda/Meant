import fs from "node:fs";
import path from "node:path";
import { app, safeStorage } from "electron";

const VAULT_PATH = path.join(app.getPath("userData"), "secrets.enc.json");

function loadAll(): Record<string, string> {
  if (!fs.existsSync(VAULT_PATH)) {
    return {};
  }
  const raw = fs.readFileSync(VAULT_PATH);
  const decrypted = safeStorage.decryptString(raw);
  return JSON.parse(decrypted);
}

function saveAll(secrets: Record<string, string>) {
  const encrypted = safeStorage.encryptString(JSON.stringify(secrets));
  fs.writeFileSync(VAULT_PATH, encrypted);
}

export function getSecret(key: string): string | null {
  return loadAll()[key] ?? null;
}

export function setSecret(key: string, value: string) {
  const secrets = loadAll();
  secrets[key] = value;
  saveAll(secrets);
}

export function deleteSecret(key: string) {
  const secrets = loadAll();
  delete secrets[key];
  saveAll(secrets);
}

export function hasSecret(key: string): boolean {
  return key in loadAll();
}

export function listKeys(prefix?: string): string[] {
  const keys = Object.keys(loadAll());
  return prefix ? keys.filter((key) => key.startsWith(prefix)) : keys;
}
