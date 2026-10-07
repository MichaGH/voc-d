/** Slovak plural forms: [1, 2–4, 0/5+]. */
export function plural(count: number, forms: [string, string, string]) {
  if (count === 1) return forms[0];
  if (count >= 2 && count <= 4) return forms[1];
  return forms[2];
}

export const EDITION_FORMS: [string, string, string] = ["vydanie", "vydania", "vydaní"];
export const INSERT_FORMS: [string, string, string] = ["vkladačka", "vkladačky", "vkladačiek"];
export const SHEET_FORMS: [string, string, string] = ["list", "listy", "listov"];
