// https://github.com/airbnb/javascript
// https://github.com/airbnb/javascript/tree/master/packages/eslint-config-airbnb-base/rules
module.exports = {
	root: true,

	parserOptions: {
		parser: 'babel-eslint',
		ecmaVersion: 8,
		sourceType: 'module',
	},

	ignorePatterns: [ 'dist/', 'node_modules/', 'wordpress/', ],
	env: {
		browser: true,
		es6: true,
		node: true,
	},
	extends: [
		// 'airbnb-base',
	],
	globals: {
		'config': true,
		'$': true,
		'fetch': true,
	},
	parserOptions: {
		ecmaVersion: 2018,
		sourceType: 'module',
	},
	rules: {
		'semi': [ 'error', 'always', ],
		'global-require': 0,
		'import/no-dynamic-require': 0,
		"array-bracket-spacing": [ "error", "always", ],
		'linebreak-style': 0,
		'comma-dangle': [ 'error', {
			'arrays': 'always',
			'objects': 'always',
			'imports': 'never',
			'exports': 'never',
			'functions': 'never',
		}, ],
		// "space-in-parens": [ "error", "always", ],
		"object-curly-newline": 0,
		"max-len": 0,
		"no-tabs": 0,
		"no-underscore-dangle": 0,
		"import/no-extraneous-dependencies": 0,
		"indent": [ "error", "tab", ],
		"camelcase": 0,
		"class-methods-use-this": 0,
		"template-curly-spacing": [ "error", "always", ],
		"arrow-parens": 0,
		"no-console": 0,
	},
};
