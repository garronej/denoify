module.exports = {
    env: {
        es2021: true,
        node: true
    },
    root: true,
    extends: ["prettier"],
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint"],
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: true,
        tsconfigRootDir: __dirname
    },
    rules: {
        "no-restricted-imports": ["error", "fs/promises"],
        "func-style": ["error", "declaration", { "allowArrowFunctions": true }],
        "max-params": ["error", 1]
    },
    ignorePatterns: ["node_modules", "dist"]
};
