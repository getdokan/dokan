import { TabPanel } from '@wordpress/components';
import { twMerge } from 'tailwind-merge';

const MyTabPanel = ( {
    onSelect,
    tabs,
    defaultTab,
}: {
    onSelect: ( tabName: string ) => void;
    tabs: {
        name: string;
        title: string;
        className: string;
        content: string | React.ReactNode;
    }[];
    defaultTab?: string;
} ) => (
    <TabPanel
        initialTabName={ defaultTab }
        className="my-tab-panel"
        activeClass="bg-dokan-btn-hover"
        onSelect={ onSelect }
        tabs={ tabs.map( ( tab ) => ( {
            name: tab.name,
            title: tab.title,
            className: twMerge(
                'bg-dokan-btn text-dokan-btn hover:bg-dokan-btn-hover hover:hover:text-dokan-btn-hover h-10',
                tab.className
            ),
            content: tab.content,
        } ) ) }
    >
        { ( tab ) => <div>{ tab.content }</div> }
    </TabPanel>
);

export default MyTabPanel;
