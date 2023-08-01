module.exports = {
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: 'tsconfig.json',
		sourceType: 'module',
	},
	plugins: ['@typescript-eslint/eslint-plugin'],
	extends: ['plugin:@typescript-eslint/recommended'],
	root: true,
	env: {
		node: true,
		jest: true,
	},
	ignorePatterns: ['.eslintrc.js', '^import\\s.+\\sfrom\\s.+;$'],
	rules: {
		'no-console': 1,
		'@typescript-eslint/interface-name-prefix': 'off',
		'@typescript-eslint/explicit-function-return-type': 'off',
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		semi: [2, 'always'],
		'eol-last': ['error', 'always'],
		curly: 2,
		'max-len': [
			'error',
			{
				code: 160,
				tabWidth: 4,
				ignorePattern: '^import\\s.+\\sfrom\\s.+;$',
			},
		],
	},
};
