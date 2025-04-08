import FaqIcon from '../icons/FaqIcon';
import CustomIcon from '../icons/CustomIcon';
import SupportIcon from '../icons/SupportIcon';
import WhatsNewIcon from '../icons/WhatsNewIcon';
import FacebookIcon from '../icons/FacebookIcon';
import SettingsIcon from '../icons/SettingsIcon';
import ImportDataIcon from '../icons/ImportDataIcon';
import SetupWizardIcon from '../icons/SetupWizardIcon';
import DocumentationIcon from '../icons/DocumentationIcon';
import FeatureRequestIcon from '../icons/FeatureRequestIcon';

// Map of icon keys to icon components.
const iconMap = {
    'whats-new'       : WhatsNewIcon,
    'support'         : SupportIcon,
    'facebook'        : FacebookIcon,
    'documentation'   : DocumentationIcon,
    'faq'             : FaqIcon,
    'settings'        : SettingsIcon,
    'feature-request' : FeatureRequestIcon,
    'setup-wizard'    : SetupWizardIcon,
    'import-data'     : ImportDataIcon,
    'custom-icon'     : CustomIcon,
};

/**
 * Renders an icon based on the provided key
 *
 * @param {Object} props           Component props
 * @param {string} props.iconKey   The key for the icon in the map
 * @param {string} props.className CSS classes to apply to the icon
 *
 * @returns {JSX.Element|null} The icon component or null if not found
 */
const IconMapping = (
    {
        iconKey,
        className = ''
    }: {
        iconKey: string,
        className?: string
    }
) => {
    const IconComponent = iconMap[ iconKey ] || null;

    if ( ! IconComponent ) {
        console.warn( `Icon with key "${ iconKey }" not found in icon map` );
        return null;
    }

    return <IconComponent className={ className } />;
};

export default IconMapping;
