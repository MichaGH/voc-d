const NBSP = " ";

/** Keep spaced dashes attached to the preceding word so a line never starts with "–". */
export function bindDashes(text: string) {
  return text.replaceAll(" – ", `${NBSP}– `);
}
