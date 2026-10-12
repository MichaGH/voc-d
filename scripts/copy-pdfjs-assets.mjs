/**
 * Copies the PDF.js worker and runtime data files of the *installed*
 * pdfjs-dist into public/pdfjs/<version>/ so the reader loads them from our
 * own origin, always matching the bundled library version. The versioned
 * folder is served with an immutable cache header (next.config.ts).
 *
 * Runs before `next dev` and `next build`; the output is generated, not
 * committed (.gitignore).
 */
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = join(root, "node_modules", "pdfjs-dist");
const { version } = JSON.parse(readFileSync(join(source, "package.json"), "utf8"));
const publicDir = join(root, "public", "pdfjs");
const target = join(publicDir, version);

// Legacy build: polyfills recent JS APIs that current Safari/Android versions lack.
const files = [["legacy/build/pdf.worker.min.mjs", "pdf.worker.min.mjs"]];
// CMaps for non-embedded CJK fonts, standard fonts for non-embedded base-14
// fonts (Slovak diacritics), WebAssembly decoders for JPEG 2000/JBIG2/ICC.
const folders = ["cmaps", "standard_fonts", "iccs"];
const wasm = ["openjpeg.wasm", "openjpeg_nowasm_fallback.js", "jbig2.wasm", "jbig2_nowasm_fallback.js", "qcms_bg.wasm"];

if (existsSync(publicDir)) {
  for (const entry of readdirSync(publicDir)) {
    if (entry !== version) rmSync(join(publicDir, entry), { recursive: true, force: true });
  }
}
mkdirSync(join(target, "wasm"), { recursive: true });

for (const [from, to] of files) cpSync(join(source, from), join(target, to));
for (const folder of folders) cpSync(join(source, folder), join(target, folder), { recursive: true });
for (const file of wasm) cpSync(join(source, "wasm", file), join(target, "wasm", file));

console.log(`pdf.js ${version} assets → public/pdfjs/${version}/`);
