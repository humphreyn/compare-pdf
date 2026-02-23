import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import globals from "globals";
import markdown from "eslint-plugin-markdown";
import pluginJs from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import tseslint from "typescript-eslint";

const config = [
	{
		// ignores added here
		ignores: [
			"**/.editorconfig",
			"**/.eslintcache",
			"**/.husky/",
			"**/.idea/",
			"**/node_modules/",
			"**/reports/",
			"**/logs",
			"**/package-lock.json",
			"**/examples/",
			"**/*.d.ts",
			"**/*.pdf",
			"**/*.MP4",
			"**/*.png"
		]
	},
	{
		languageOptions: {
			ecmaVersion: "latest",
			globals: globals.node,
			sourceType: "module"
		}
	},
	{
		files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
		plugins: {
			"@stylistic": stylistic
		},
		rules: {
			"comma-dangle": ["error", "never"]
		}
	},
	{
		// "files": ["**/*.js", "**/*.cjs", "**/*.mjs"],
		rules: {
			"no-constant-binary-expression": "error",
			"no-unused-vars": [
				"error",
				{
					caughtErrors: "none",
					argsIgnorePattern: "ignore",
					caughtErrorsIgnorePattern: "ignore"
				}
			],
			"prefer-const": [
				"error",
				{
					destructuring: "any",
					ignoreReadBeforeAssign: false
				}
			]
		}
	},
	{
		files: ["**/*.ts"],
		plugins: {
			"@typescript-eslint": tseslint.plugin
		},
		languageOptions: {
			parser: tseslint.parser,
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname
			}
		},
		rules: {
			"@typescript-eslint/no-unsafe-argument": "error",
			"@typescript-eslint/no-unsafe-assignment": "error",
			"@typescript-eslint/no-unsafe-call": "error",
			"@typescript-eslint/no-unsafe-member-access": "error",
			"@typescript-eslint/no-unsafe-return": "error"
		}
	},
	...markdown.configs.recommended,
	pluginJs.configs.recommended,
	eslintPluginPrettierRecommended
];

export default config;
