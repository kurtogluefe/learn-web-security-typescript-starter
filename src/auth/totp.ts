import { verifySync } from "otplib";
import type { DatabaseSync } from "node:sqlite";

export function verifyTotpCode(code: string, secret: string): boolean {
  if (!code) {
    return false;
  }

  try {
    return verifySync({
      secret,
      token: code,
    }).valid;
  } catch {
    return false;
  }
}

export function consumeTotpTimeStep(
  db: DatabaseSync,
  userId: number,
  timeStep: number,
): boolean {
  const result = db
    .prepare(
      `UPDATE users
       SET last_totp_step = ?
       WHERE id = ?
         AND (last_totp_step IS NULL OR last_totp_step < ?)`,
    )
    .run(timeStep, userId, timeStep);

  return result.changes === 1;
}

export function verifyAndConsumeTotpCode(
  db: DatabaseSync,
  userId: number,
  code: string,
  secret: string,
): boolean {

  const verified = verifyTotpCode(code, secret);
  if (!verified) return false;

  const now = Date.now() / 1000;
  const timeStep = Math.floor(now / 30);

  return consumeTotpTimeStep(db, userId, timeStep);
}
