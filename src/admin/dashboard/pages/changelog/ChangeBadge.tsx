import { Hammer, TrendingUp, Rocket } from 'lucide-react';

const ChangeBadge = ( { type }: { type: string } ) => {
    const getBadgeStyles = () => {
        switch ( type ) {
            case 'New':
            case 'New Module':
            case 'New Feature':
                return 'bg-teal-500 text-white';
            case 'Fix':
                return 'bg-red-500 text-white';
            case 'Improvement':
            case 'Improvements':
            case 'Update':
                return 'bg-purple-500 text-white';
            default:
                return 'bg-blue-500 text-white';
        }
    };
    const renderIcon = () => {
        // New Features / Modules
        if ( [ 'New', 'New Module', 'New Feature' ].includes( type ) ) {
            return <Rocket size={ 12 } />;
        }
        // Bug Fixes
        if ( type === 'Fix' ) {
            return <Hammer size={ 12 } />;
        }
        if ( [ 'Improvement', 'Improvements', 'Update' ].includes( type ) ) {
            return <TrendingUp size={ 12 } />;
        }
        return null;
    };

    return (
        <span
            className={ `inline-flex items-center px-2 py-1 gap-[6px] rounded-[20px] text-xs font-semibold ${ getBadgeStyles() }` }
        >
            { renderIcon() }
            { type }
        </span>
    );
};

export default ChangeBadge;
