import path from 'path';

// ============================================================================
// Absolute paths to the storage-state files written by tests/e2e/_auth.setup.ts
// (NEW_UI_HOUSE_STYLE.md §4). Import these instead of hand-building
// `path.join(__dirname, '../../../playwright/.auth/…')` in every spec.
// ============================================================================

const AUTH_DIR = path.resolve(__dirname, '../playwright/.auth');

export const ADMIN_STORAGE_STATE = path.join(AUTH_DIR, 'adminStorageState.json');
export const VENDOR_STORAGE_STATE = path.join(AUTH_DIR, 'vendorStorageState.json');
export const VENDOR2_STORAGE_STATE = path.join(AUTH_DIR, 'vendor2StorageState.json');
export const CUSTOMER_STORAGE_STATE = path.join(AUTH_DIR, 'customerStorageState.json');
export const CUSTOMER2_STORAGE_STATE = path.join(AUTH_DIR, 'customer2StorageState.json');
