import { __ } from '@wordpress/i18n';
import { ArrowLeft } from 'lucide-react';
import { Slot } from '@wordpress/components';
import { DokanButton } from '@dokan/components';
import {
    createSearchParams,
    redirect,
    replace,
    useLocation,
    useMatches,
    useNavigate,
    useNavigation,
    useParams,
} from 'react-router-dom';

const Header = ( { title = '', backUrl = '' } ) => {
    const navigate = useNavigate();
    const params = useParams();
    const location = useLocation();
    const matches = useMatches();
    const navigation = useNavigation();

    const routerProps = {
        navigate,
        params,
        location,
        redirect,
        replace,
        matches,
        navigation,
        createSearchParams,
    };

    // @ts-ignore
    title = wp.hooks.applyFilters(
        'dokan-vendor-dashboard-header-title',
        title
    );

    /**
     * Parse url from `backUrl` query params.
     *
     * @param urlString
     *
     * @return string
     */
    const parseBackUrl = ( urlString: string ) => {
        // get all the parts where it starts with `:`  and replace then from `params`
        const url = urlString.replace( /:(\w+)/g, ( match, key ) => {
            return params[ key ];
        } );

        return url;
    };

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
                                fillProps={ { title, ...routerProps } }
                            />
                        </>
                    ) }
                </div>
                <div className="dokan-header-actions grid grid-cols-2 flex-wrap gap-2.5 md:justify-end">
                    { backUrl && (
                        <DokanButton
                            variant="secondary"
                            className={ `col-span-2 flex items-center` }
                            onClick={ () =>
                                navigate( parseBackUrl( backUrl ) )
                            }
                        >
                            <ArrowLeft
                                className={ `text-dokan-link` }
                                size={ 16 }
                            />
                            { __( 'Back', 'dokan-lite' ) }
                        </DokanButton>
                    ) }
                    <Slot
                        name="dokan-header-actions"
                        fillProps={ { ...routerProps } }
                    />
                </div>
            </div>
            <div className="@container/after-header grid grid-cols-4 gap-4">
                <Slot
                    name="dokan-after-header"
                    fillProps={ { ...routerProps } }
                />
            </div>
        </div>
    );
};

export default Header;
