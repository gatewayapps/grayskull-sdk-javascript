module.exports = {
	parser: '@typescript-eslint/parser', // Specifies the ESLint parser
	extends: [
		'prettier/@typescript-eslint',
		'plugin:@typescript-eslint/recommended', // Uses the recommended rules from @typescript-eslint/eslint-plugin
		'plugin:prettier/recommended'
	],

	plugins: ['@typescript-eslint'],
	overrides: [
		{
			files: ['**/*.js', '**/*.spec.*'],
			rules: {
				'@typescript-eslint/no-var-requires': 'off'
			}
		}
	],
	parserOptions: {
		ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
		sourceType: 'module', // Allows for the use of imports
		ecmaFeatures: {
			jsx: true // Allows for the parsing of JSX
		}
	},
	rules: {
		indent: ['error', 'tab', { SwitchCase: 1 }],
		'@typescript-eslint/array-type': ['warn', { default: 'array-simple' }],
		'@typescript-eslint/member-delimiter-style': [
			'warn',
			{
				multiline: {
					delimiter: 'comma',
					requireLast: false
				},
				singleline: {
					delimiter: 'comma',
					requireLast: false
				},
				overrides: {
					interface: {
						multiline: {
							delimiter: 'none',
							requireLast: false
						}
					},
					typeLiteral: {
						multiline: {
							delimiter: 'none',
							requireLast: false
						}
					}
				}
			}
		],
		'@typescript-eslint/camelcase': ['off'],
		'@typescript-eslint/interface-name-prefix': ['off'],
		'@typescript-eslint/explicit-function-return-type': ['off'],
		'no-console': ['error', { allow: ['warn', 'error'] }],
		'no-var': 'error',
		'prettier/prettier': [
			'error',
			{
				extends: 'prettier.config.js'
			}
		],
		'no-unused-vars': 'error',

		'sort-imports': [
			'off',
			{
				ignoreCase: false,
				ignoreDeclarationSort: false,
				ignoreMemberSort: false,
				memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single']
			}
		],
		'sort-keys': 'off',
		'sort-vars': 'off'
	},
	settings: {}
}
