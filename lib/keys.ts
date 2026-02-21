import { randomBytes } from "crypto";

export function generateKey(): string {
  return "0x" + randomBytes(32).toString("hex");
}
