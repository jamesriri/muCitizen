import { customAlphabet } from "nanoid";

const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
const generateRandomCode = customAlphabet(chars, 5);

export function generateReferenceCode(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const randomSuffix = generateRandomCode();

  return `SR-${year}${month}-${randomSuffix}`;
}
