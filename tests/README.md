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

### Suit Configuration

First thing we need to configure `/tests/acceptance.suite.yml`. We need to create `.env` file in our plugin directory. Already shared a `.env.example` sample file so just copy & past source code `.env.example` to `.env` and update the configuration. 

### Database Configuration

We export our database and place it into the `_data` directory. we rename the databse like `dump.sql`.

### Server Configuration

 **Selenium Server Local Testing**
 
 To run Selenium Server we need Java as well as Chrome or Firefox browser installed.
 
 * Download [Selenium Standalone Server](https://docs.seleniumhq.org/download/)
 
        -Example: Download and place it in my e/selenium-server local directory.
 
 * To use Chrome, install [ChromeDriver](https://sites.google.com/a/chromium.org/chromedriver/getting-started).To use Firefox,    install [GeckoDriver](https://github.com/mozilla/geckodriver).
 
        -Example: Download and place it in my tests/vendor/bin test directory.
      
 * Launch the Selenium Server: `java -jar "/path/to/selenium-server-standalone-xxx.jar"`
 
        -Example: In `tests/vendor/bin` directory launch java -jar "/e/selenium-server/selenium-server-standalone-3.13.0.jar"
 
 Launch Selenium Server before executing tests.
 
 ## Running Test
 
Run The following command:

`vendor/bin/codecept run acceptance`
   
    
    
    
     
