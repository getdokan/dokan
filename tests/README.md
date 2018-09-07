# Codeception Acceptance Testing Configuration #

## Testing

We're starting to test with WebDriver and Codeception to run Selenium Server.

## Getting started

git clone from `acceptance_tests` branch

```
git clone https://github.com/user/repo.git
```

## Installation

To install simply require the package in the `composer.json` file.


Run composer in plugin directory.
```
composer require lucatume/wp-browser --dev
```

## Configuration

**Suit Configuration**

First thing we need to configure `/tests/acceptance.suite.yml` where we can configure our acceptance test suite.
We need to create `.env` file in our plugin directory. Already shared a `.env.example` sample file so just copy & past source code `.env.example` to `.env` and update the configuration. 

**Database Configuration**

WPDb is the WordPress Database settings, this requires details to the specific database we are setting up for testing. Now we export our database and place it into the _data directory. we rename the databse name like `dump.sql`.

**Server Configuration**

