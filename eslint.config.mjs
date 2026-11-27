import eslintConfigCodely from "eslint-config-codely";

export default [
	...eslintConfigCodely.ts,
	{
		ignores: ["dist/**", "node_modules/**", "data/**", "data-copy/**", "coverage/**"],
	},
	{
		files: ["**/*.ts", "**/*.tsx"],
		languageOptions: {
			parserOptions: {
				projectService: false,
				project: "./tsconfig.lint.json",
			},
		},
	},
	{
		files: ["features/**/*.ts"],
		rules: {
			"@typescript-eslint/no-unused-expressions": "off",
			"no-console": "off",
		},
	},
	{
		files: ["src/seed.ts"],
		rules: {
			"no-console": "off",
		},
	},
	{
		files: [
			"src/index.ts",
			"src/auth/infrastructure/auth.routes.ts",
			"src/shared/infrastructure/mailjet-email.service.ts",
		],
		rules: {
			"no-console": ["error", { allow: ["error", "log"] }],
		},
	},
	{
		rules: {
			"prettier/prettier": ["error", { printWidth: 100, useTabs: true, singleQuote: false }],
			"@typescript-eslint/member-ordering": "off",
			"no-await-in-loop": "off",
		},
	},
];
