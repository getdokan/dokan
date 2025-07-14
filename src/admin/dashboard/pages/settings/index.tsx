import { __ } from '@wordpress/i18n';

const SettingsPage = () => {
    return (
        <>
            <h3 className="text-3xl font-bold">
                { __( 'Settings', 'dokan-lite' ) }
            </h3>
        </>
    );
};

export default SettingsPage;
