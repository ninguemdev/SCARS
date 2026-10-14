import { SCARS } from "./config.mjs";

Hooks.once("init", () => {
  game.scars = { config: SCARS };
});
