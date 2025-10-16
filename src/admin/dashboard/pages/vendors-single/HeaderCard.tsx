import { Card } from '@getdokan/dokan-ui';
import { __ } from '@wordpress/i18n';
import { Vendor } from '../../../../definitions/dokan-vendors';
import Rating from './Rating';
import StoreCategories from './StoreCategories';
import { DokanBadge } from '@dokan/components';
import Banner from './Banner';
import StoreAvatar from './StoreAvatar';
import { applyFilters } from "@wordpress/hooks";
import { Star } from "lucide-react";

export interface HeaderCardProps {
    vendor: Vendor;
}

const HeaderCard = ( { vendor }: HeaderCardProps ) => {
    const StoreName = () => {
        return (
            <div className="font-bold text-lg text-black mb-1">
                { vendor.store_name
                    ? vendor.store_name
                    : __( 'No Name', 'dokan-lite' ) }
            </div>
        );
    };

    // @ts-ignore
    const StoreNameComponent: JSX.Element = applyFilters(
        'dokan.dashboard.vendor.header.storeName',
        StoreName,
        vendor
    );

    return (
        <Card className="w-full overflow-visible">
            { /* Banner */ }
            <Banner banner={ vendor?.banner } />
            { /* Store Info */ }
            <div className="flex flex-col md:!flex-row items-center px-6 py-4 bg-white rounded-b-md">
                { /* Store Icon on the left */ }
                <StoreAvatar gravatar={ vendor?.gravatar } />
                { /* Store Details */ }
                <div className="ml-6 flex-1">
                    { /* @ts-ignore */ }
                    <StoreNameComponent />
                    { vendor?.rating && (
                        <div className="flex items-center space-x-1 text-gray-400 text-sm mb-1">
                            <Rating
                                rating={
                                    parseFloat( vendor.rating.rating ) || 0
                                }
                            />
                            <span className="text-gray-500 ml-2">
                                ({ vendor.rating.count || '0' })
                            </span>
                        </div>
                    ) }

                    { vendor?.categories && (
                        <StoreCategories categories={ vendor.categories } />
                    ) }
                </div>
                { /* Disabled badge */ }

                <div className="flex items-center mt-2 md:!mt-0 gap-2">
                    { vendor?.featured && (
                        <DokanBadge
                            label={
                                <span className="flex justify-center items-center gap-1">
                                    { __( 'Featured', 'dokan-lite' ) }
                                    <Star size="12" />
                                </span>
                            }
                            variant={ 'warning' }
                        />
                    ) }
                    <DokanBadge
                        label={
                            vendor?.enabled
                                ? __( 'Enabled', 'dokan-lite' )
                                : __( 'Disabled', 'dokan-lite' )
                        }
                        variant={ vendor?.enabled ? 'success' : 'secondary' }
                    />
                </div>
            </div>
        </Card>
    );
};

export default HeaderCard;
