import {Slot} from "@wordpress/components";

const Header = ( { title = '' } ) => {

    return (
        <div className="flex items-center sm:flex-wrap md:flex-nowrap">
            <Slot name="dokan-before-header" />
            <div className="dokan-header-title flex-1">
                { title && (<h1 className="mb-4 text-3xl font-extrabold text-gray-900 dark:text-white md:text-5xl lg:text-6xl">{title}</h1>)}
            </div>
            <div className="dokan-header-actions flex flex-1 gap-2.5 md:justify-end">
                <Slot name="dokan-header-actions"/>
            </div>
            <Slot name="dokan-after-header"/>
        </div>
    );
};

export default Header;
