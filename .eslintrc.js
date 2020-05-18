const fs = require("original-fs");
const content = fs.readFileSync(
  __dirname + "/node_modules/typescript/lib/typescript.d.ts",
  { encoding: "utf8" }
);
const restrictedRE = /(const|enum|function)\s+(\w+)/g;

let match = null;
const restricted = [];
while ((match = restrictedRE.exec(content)) !== null) {
  restricted.push(match[2]);
}

module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier/@typescript-eslint",
    "plugin:prettier/recommended",
  ],
  rules: {
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/no-inferrable-types": "off",
    "no-empty": ["error", { allowEmptyCatch: true }],
    "no-restricted-imports": [
      "error",
      {
        paths: [
          {
            name: "typescript",
            importNames: restricted,
            message:
              "Please use 'import { tsModule } from \"./vscodeModules\";' instead.",
          },
        ],
      },
    ],
  },
};
