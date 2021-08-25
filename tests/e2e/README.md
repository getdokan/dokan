## CODECPTJS END2END TESTING

## Step 1:
## JAVA INSTALLATION
```sh
Go: https://java.com/en/download/
```
## Step 2
## SELENIUM SERVER CONFIGURATION
```sh
npm install selenium-standalone@latest -g
selenium-standalone install
selenium-standalone start
```

## Step 3

# Create a test folder and under this run :
```sh
git clone https://github.com/weDevsOfficial/dokan.git
cd dokan
composer install
composer dump autoload -o
git checkout test/automation
```
## Step 4

## Configuration

**Open that test folder on visual studio code or your favourite Code Editor!**
**Open example.codecept.conf.js file under dokan>tests>e2e**

```sh
Create codecept.conf.js & Copy code from example.codecept.conf.js
```
```sh
Under codecept.conf.js file
Add your Admin, Multiple Vendors, Customer credentials (Username & Password).
```

```sh
npm install
```

## Step 5

## Running Test:

**Inside e2e you can find a folder core-tests.**

**Inside Core-test you can find one folder modules & another scripts are based on dokan features**

**if you want to run your script based on Dokan module**
```sh
npx codeceptjs run core-tests/modules/auction_product_01_admin_settings_test.js
  ```
 
**if you want to run test script based on feature .you have to run**
```sh
npx codeceptjs run core-tests/explore_01_frontend_menu_test.js
  ```
