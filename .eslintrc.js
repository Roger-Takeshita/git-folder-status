module.exports = {
    env: {
        commonjs: true,
        es2021: true,
        node: true,
    },
    extends: ['airbnb-base'],
    parserOptions: {
        ecmaVersion: 12,
    },
    rules: {
        indent: ['error', 4, { SwitchCase: 1 }],
        'no-console': 'off',
        'operator-linebreak': 'off',
        'no-continue': 'off',
        'implicit-arrow-linebreak': 'off',
        'function-paren-newline': 'off',
        'no-restricted-syntax': 'off',
    },
};
