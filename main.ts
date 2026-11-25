// Warung Api — the hand-in program (Node 22, standard library only).
// It gathers this folder's game/ and screenshots/ into the output directory
// the grader hands it and writes the dossier the judge reads, using the
// vendored make.fun library. Run it locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { readdirSync, readFileSync, existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? '/output');

function copyTree(srcDir, dstDir) {
  mkdirSync(dstDir, { recursive: true });
  for (const name of readdirSync(srcDir)) {
    const src = join(srcDir, name);
    const dst = join(dstDir, name);
    if (statSync(src).isDirectory()) {
      copyTree(src, dst);
    } else {
      writeFileSync(dst, readFileSync(src));
    }
  }
}

function handIn() {
  mkdirSync(outDir, { recursive: true });
  copyTree(join(repoRoot, 'game'), join(outDir, 'game'));
  const shots = join(repoRoot, 'screenshots');
  if (existsSync(shots)) copyTree(shots, join(outDir, 'screenshots'));

  // The scorer's own caps: only text_max_bytes shapes the bytes; the rest
  // refuse an entry the scorer would refuse anyway.
  const dossier = buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  });
  writeFileSync(join(outDir, 'dossier.json'), dossier);
  console.log('Warung Api handed in to ' + outDir);
}

handIn();
