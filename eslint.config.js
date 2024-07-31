import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  {
    "languageOptions": { "globals": globals.node },
  },
  {
    "ignores": ["build/*"]
  },
  pluginJs.configs.recommended,
];