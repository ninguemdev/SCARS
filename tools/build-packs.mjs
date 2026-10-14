import fs from "node:fs";
import path from "node:path";
import { compilePack } from "@foundryvtt/foundryvtt-cli";

/**
 * Compiles each folder of packs/_source into the LevelDB compendium Foundry reads, at packs/<name>.
 * The world must not have the compendium open while it is rebuilt, since LevelDB locks the folder.
 */
const SOURCE_ROOT = path.join("packs", "_source");

for (const entry of fs.readdirSync(SOURCE_ROOT, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const source = path.join(SOURCE_ROOT, entry.name);
  const destination = path.join("packs", entry.name);
  await compilePack(source, destination, { recursive: true });
  process.stdout.write(`Compiled ${source} -> ${destination}\n`);
}
