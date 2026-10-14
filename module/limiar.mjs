import { LIMIAR } from "./config.mjs";

Hooks.once("init", () => {
  game.limiar = { config: LIMIAR };
});
