# Dokan Pro Environment Setup

## Overview
This documentation describes how to set up the development environment for Dokan Pro. The Dokan Pro plugin relies on Dokan Lite for its base configuration and components. This setup ensures consistency between Pro and Lite versions while allowing Pro-specific customizations.

## Installation Requirements

### Required Software
- Node.js (>= 16.x)
- npm

### Plugin Installation
Dokan Pro requires both Dokan Pro and Dokan Lite to be installed:

#### Dokan Lite Installation
Dokan Lite must be installed in one of these locations:
- `wp-content/plugins/dokan-lite`
- `wp-content/plugins/dokan`

#### Dokan Pro Installation
Dokan Pro should be installed in:
- `wp-content/plugins/dokan-pro`

## Development Setup

### 1. Install Dependencies
```bash
# Navigate to the Dokan Pro plugin directory
cd wp-content/plugins/dokan-pro

# Install npm dependencies
npm install
```

### 2. Build Assets
```bash
# Development mode with watch
npm run start

# Production build
npm run build
```
