
const PLATE_PATTERN: Array<"letter" | "digit" | "alnum"> = [
  "letter", "letter", "letter", "digit", "alnum", "digit", "digit",
];

export function maskPlate(value: string): string {
  const candidates = value.toUpperCase().replace(/[^A-Z0-9]/g, "").split("");

  let raw = "";
  for (const char of candidates) {
    if (raw.length >= PLATE_PATTERN.length) break;

    const expected = PLATE_PATTERN[raw.length];
    const isLetter = /[A-Z]/.test(char);
    const isDigit = /[0-9]/.test(char);

    if (expected === "letter" && !isLetter) continue;
    if (expected === "digit" && !isDigit) continue;

    raw += char;
  }

  if (raw.length <= 3) return raw;

  return `${raw.slice(0, 3)}-${raw.slice(3)}`;
}

