import { Vendor } from '@dokan/definitions/dokan-vendors';
import InfoCard from './InfoCard';
import TabSections from './TabSections';

export interface InfoSectionProps {
    vendor: Vendor;
}
const InfoSection = ( { vendor }: InfoSectionProps ) => {
    return (
        <div className="flex flex-col md:!flex-row gap-6">
            <InfoCard vendor={ vendor } />
            <TabSections vendor={ vendor } />
        </div>
    );
};

export default InfoSection;
