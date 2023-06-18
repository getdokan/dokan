## Installation Guide for Developers

**Step 1: Prerequisites**

- Make sure you have the following software installed on your machine:
    - PHP (>= 7.2.0)
    - MySQL (>= 5.0)
    - Composer
    - Node.js (>= 16.x)


**Step 2: Setup wordpress development environment**

1. Set wordpress debugging mode values in your wordpress directory`wp-config.php`:

```
define( 'WP_DEBUG', true );
define( 'WP_DEBUG_LOG', true );
define( 'SCRIPT_DEBUG', true );
```

**Step 3: Clone the Repository**

1. Open your terminal or command prompt.
2. Change the current working directory to the location where you want to clone the repository.
3. [Fork](https://docs.github.com/en/get-started/quickstart/fork-a-repo) the dokan weDevs official github repository.
3. Run the following command to clone your forked repository:

```bash
git clone https://github.com/YOUR-USERNAME/dokan.git
```

**Step 4: Install Dependencies**

1. Navigate to the cloned repository:

```bash
cd dokan
```

2. Install PHP dependencies using Composer:

```bash
composer install && composer du -o
```

3. Install JavaScript dependencies using npm:

```
npm install
```

**Step 5: Build Assets**

1. Build the frontend assets using the following command:

```bash
npm run build
```

2. Build the frontend assets for development (webpack watch mode):

```bash
npm run start
```

#### 🎉 Congratulations! You have successfully installed Dokan on your development environment.

****

## Dokan lite Guide for Developers

**All avaialable commands**

1. Build assets ( watch mode )

```
npm run start
```

2. Build assets ( Watch mode with hot reload )

```
npm run start:hot
```

3. Build assets for production

```
npm run build
```

4. Update all npm packages

```
npm run packages-update
```

5. Replace all `DOKAN_SINCE` version into current version from package.json.
```
npm run version
```

6. Make or regenerate pot file

```
npm run makepot
```

7. Converts WordPress readme.txt file to markdown (readme.md )

```
npm run readme
```

8. Removes all the unnecessery files in dokan.

```
npm run clean-files
```

9. Creates zip file

```
npm run zip
```

10. Formats all the .js files in dokan lite but you can also formte any .js file by providing it's path when running the command.

```
npm run format
```

11. Makes a product build zip of dokan lite.

```
npm run release
```

**Building assets**

1. Always add `.js` file into `src` ro `assets/src` folder, never add files directly into `assets/js` folder and less files into `assets/src/less`.
2. If any jquery plugin is needed to add, you can add it into `assets/vendor` directory.
3. When you `add` js or `less` files into `src` ro `assets/src` add that js or less as entry in `webpack.config.js` in `entryPoint` object
4. For unnecessery file cleaning or any file you don't in production you can add it in `bin/clean-useless-files.js`. Add the file dir in `targetFiles` object. The path is not absolute path, it is after the dokan plugin directory, Ex: `'assets/js/dokan-admin-product-style.js'` 
