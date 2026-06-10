module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        'fe-corporate',
        'fe-hub',
        'fe-identity',
        'be-api',
        'nostr',
        'types',
        'ui',
        'design-system',
        'config-ts',
        'config-eslint',
        'repo',
        'deps',
        'deps-dev'
      ]
    ]
  }
};
