/**
 * Removes middleware.ts/js files to avoid conflict with proxy.ts in Next.js 16+.
 * Next.js throws: "Both middleware file and proxy file are detected. Please use proxy.ts only."
 */
const fs = require("fs");
const path = require("path");
const root = process.cwd();
const files = [
  "middleware.ts",
  "middleware.js",
  "src/middleware.ts",
  "src/middleware.js",
];
for (const f of files) {
  const filePath = path.join(root, f);
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Removed ${f} (use proxy.ts instead)`);
    }
  } catch (e) {
    // ignore
  }
}
