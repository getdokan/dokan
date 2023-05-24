const wpvuei18n = require('wp-vue-i18n');

wpvuei18n.makepot({
  exclude: [
    'build/.*',
    'node_modules/*',
    'assets/*',
    'tests/*',
    'bin/*',
    'vendor/*',
    '.github/*',
    '.php_cs'
  ],

  mainFile: 'dokan.php',
  domainPath: '/languages/',
  potFilename: 'dokan-lite.pot',
  type: 'wp-plugin',
  updateTimestamp: true,
  potHeaders: {
    'report-msgid-bugs-to': 'https://wedevs.com/account/tickets/',
    'language-team': 'LANGUAGE <EMAIL@ADDRESS>',
    'poedit': true,
    'x-poedit-keywordslist': true
  }
});
