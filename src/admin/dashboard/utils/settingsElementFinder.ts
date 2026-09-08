import { SettingsElement } from './settingsTypes';

const settingsElementFinder = (
    settings: SettingsElement[],
    hookKey: string
): SettingsElement | undefined => {
    for ( const item of settings ) {
        if ( item.hook_key === hookKey ) {
            return item;
        }
        if ( item.children && item.children.length > 0 ) {
            const found = settingsElementFinder( item.children, hookKey );
            if ( found ) {
                return found;
            }
        }
    }
    return undefined;
};

export default settingsElementFinder;
