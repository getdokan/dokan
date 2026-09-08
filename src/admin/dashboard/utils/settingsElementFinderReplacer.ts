import { SettingsElement } from './settingsTypes';

const settingsElementFinderReplacer = (
    settings: SettingsElement[],
    item: SettingsElement
) => {
    const found = settings.find(
        ( settingsItem ) => settingsItem.hook_key === item.hook_key
    );

    if ( found ) {
        return [
            ...settings.map( ( settingsItem ) =>
                settingsItem.hook_key === item.hook_key ? item : settingsItem
            ),
        ];
    }

    return [
        ...settings.map( ( settingsItem ) => {
            if ( settingsItem.children.length > 0 ) {
                settingsItem.children = [
                    ...settingsElementFinderReplacer(
                        [ ...settingsItem.children ],
                        item
                    ),
                ];
            }
            return { ...settingsItem };
        } ),
    ];
};

export default settingsElementFinderReplacer;
