import { defineConfig } from "eslint/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([{
    extends: compat.extends("./lint/eslintrc-gjs.yml", "./lint/eslintrc-shell.yml"),

    languageOptions: {
        sourceType: "module",
    },

    files: ["**/*.js"],

    rules: {
        "no-constant-binary-expression": "error",
        "no-constructor-return": "error",
        "no-duplicate-imports": "error",
        "no-new-native-nonconstructor": "error",
        "no-promise-executor-return": "error",
        "no-unmodified-loop-condition": "error",
        "no-unreachable-loop": "error",
        "no-unused-private-class-members": "error",
        "no-use-before-define": "error",
        "require-atomic-updates": "error",
        "default-case-last": "error",
        "default-param-last": "error",
        "dot-notation": "error",
        "func-names": ["error", "as-needed"],
        "logical-assignment-operators": "error",
        "no-confusing-arrow": "error",
        "no-else-return": "error",
        "no-eq-null": "error",
        "no-eval": "error",
        "no-extend-native": "error",
        "no-floating-decimal": "error",
        "no-implied-eval": "error",
        "no-labels": "error",
        "no-lone-blocks": "error",
        "no-new": "error",
        "no-new-func": "error",
        "no-param-reassign": "error",
        "no-script-url": "error",
        "no-var": "error",
        "no-multi-spaces": "error",
        "no-multiple-empty-lines": "error",
    },
}]);