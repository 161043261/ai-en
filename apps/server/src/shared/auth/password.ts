import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const HASH_PREFIX = "scrypt";
const HASH_VERSION = "1";
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

const deriveKey = (password: string, salt: string) =>
  new Promise<Buffer>((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, (err, key) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(key);
    });
  });

export const isPasswordHash = (storedPassword: string) =>
  storedPassword.startsWith(`${HASH_PREFIX}$${HASH_VERSION}$`);

export const hashPassword = async (password: string) => {
  const salt = randomBytes(SALT_LENGTH).toString("base64url");
  const key = await deriveKey(password, salt);
  return `${HASH_PREFIX}$${HASH_VERSION}$${salt}$${key.toString("base64url")}`;
};

export const verifyPassword = async (
  password: string,
  storedPassword: string,
) => {
  if (!isPasswordHash(storedPassword)) {
    return {
      valid: password === storedPassword,
      needsRehash: password === storedPassword,
    };
  }

  const [, version, salt, storedKey] = storedPassword.split("$");
  if (version !== HASH_VERSION || !salt || !storedKey) {
    return { valid: false, needsRehash: false };
  }

  const key = await deriveKey(password, salt);
  const storedBuffer = Buffer.from(storedKey, "base64url");
  const valid =
    storedBuffer.length === key.length && timingSafeEqual(storedBuffer, key);

  return { valid, needsRehash: false };
};
