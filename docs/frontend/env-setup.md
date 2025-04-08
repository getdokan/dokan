# Dokan Pro Environment Setup

## Overview
This documentation describes how to set up the development environment for Dokan Pro. The Dokan Lite path utility provides a function to dynamically determine the correct path to the Dokan Lite installation, ensuring compatibility between Dokan Pro and Lite versions.

## Installation Paths
Dokan (Lite and Pro) can be installed in these locations:
- `wp-content/plugins/dokan-lite` (for Dokan Lite)
- `wp-content/plugins/dokan` (another path can be for Dokan Lite)
- `wp-content/plugins/dokan-pro` (for Dokan Pro)

## Usage

### Import the Utility Function
```javascript
const { getDokanLitePath } = require('./src/utils/dokan-path');
```

### Get the Dokan Path
```javascript
const liteLocation = getDokanLitePath();
```

## Function Details

### `getDokanLitePath()`
Returns the correct Dokan installation path.

**Returns:**
- `string`: The path to the Dokan installation ('dokan-lite' or 'dokan')

**Throws:**
- `Error`: If neither 'dokan-lite' nor 'dokan' directory exists

## Error Handling
The function includes error handling to ensure a valid Dokan installation exists:
1. First checks for 'dokan-lite' directory
2. If not found, checks for 'dokan' directory
3. If neither exists, throws an error with the message "Dokan or Dokan Lite not found"

## Common Use Cases
- Loading configuration files
- Setting up build paths
- Managing asset locations
- Configuring development environments

## Development Environment Setup
1. Ensure you have the required dependencies installed:
   - Node.js (>= 16.x)
   - npm
   - WordPress development environment

2. Install dependencies:
```bash
npm install
```

3. Build assets:
```bash
# For development with watch mode
npm run start

# For production build
npm run build
```

4. Configure your development environment:
   - Set up WordPress debugging mode in `wp-config.php`
   - Configure your database settings
   - Set up any required API keys or credentials
