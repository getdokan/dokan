#!/bin/bash
npm run wp-env run tests-wordpress "chmod -c ugo+w /var/www/html"
npm run wp-env run tests-cli "wp rewrite structure '/%postname%/' --hard"