import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(currentDir, '../..');

for (const filename of ['README.md', 'LICENSE']) {
  const sourcePath = path.join(rootDir, filename);
  const targetPath = path.join(currentDir, filename);
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, targetPath);
  }
}
