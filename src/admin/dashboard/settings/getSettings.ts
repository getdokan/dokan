/**
 * Get settings from the global `dokanAdminDashboardSettings` object.
 * This object is available in the admin dashboard pages.
 *
 * @since 4.0.0
 *
 * @param {string} settingsKey Settings key to get the value from the object.
 */
const getSettings = ( settingsKey: string ) => {
    // @ts-ignore
    const allSettings = dokanAdminDashboardSettings || {};

    return allSettings[ settingsKey ];
};

export default getSettings;
