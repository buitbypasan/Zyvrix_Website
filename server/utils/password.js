import bcrypt from "bcryptjs";
import { config } from "../config.js";

function getRounds() {
  const rounds = Number(config.auth?.bcryptRounds || 12);
  return Number.isFinite(rounds) && rounds >= 4 ? Math.min(rounds, 15) : 12;
}

export function createPasswordHash(password) {
  const rounds = getRounds();
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(rounds, (saltError, salt) => {
      if (saltError) {
        reject(saltError);
        return;
      }
      bcrypt.hash(password, salt, (hashError, hash) => {
        if (hashError) {
          reject(hashError);
          return;
        }
        resolve({ salt, hash });
      });
    });
  });
}

export function verifyPassword(password, hash) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, hash, (error, same) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(Boolean(same));
    });
  });
}
