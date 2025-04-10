import { Slot } from '@wordpress/components';
import { useNavigate, useParams } from 'react-router-dom';

const Header = ( { title = '' } ) => {
    const params = useParams();
    const navigate = useNavigate();

    // @ts-ignore
    title = wp.hooks.applyFilters(
        'dokan-vendor-dashboard-header-title',
        title
    );

    return (
        <div className="@container/header flex flex-col gap-4">
            <div className="@container/before-header grid grid-cols-4 gap-4">
                <Slot name="dokan-before-header" />
            </div>
            <div className="dokan-header-title-section @container/header-title-section flex justify-between items-center flex-wrap">
                <div className="dokan-header-title flex flex-wrap">
                    { title && (
                        <>
                            <h3 className="text-2xl font-semibold text-gray-800  md:text-4xl lg:text-3xl">
                                { title }
                            </h3>{ ' ' }
                            <Slot
                                name="dokan-header-after-title"
                                fillProps={ { title, navigate } }
                            />
                        </>
                    ) }
                </div>
                <div className="dokan-header-actions grid grid-cols-2 flex-wrap gap-2.5 md:justify-end">
                    <Slot
                        name="dokan-header-actions"
                        fillProps={ { navigate, params } }
                    />
                </div>
            </div>
            <div className="@container/after-header grid grid-cols-4 gap-4">
                <Slot name="dokan-after-header" />
            </div>
        </div>
    );
};

export default Header;
