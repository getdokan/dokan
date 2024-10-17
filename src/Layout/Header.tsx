import {Slot} from "@wordpress/components";

const Header = ( { title = '' } ) => {

    return (
        <>
            <Slot name="dokan-before-header" />
            <div className="dokan-header-title">
                <h1 className="mb-4 text-3xl font-extrabold text-gray-900 dark:text-white md:text-5xl lg:text-6xl"><span
                    className="text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400">{title}</span> </h1>
            </div>
            <div className="dokan-header-actions">
                <Slot name="dokan-header-actions"/>
            </div>
            <Slot name="dokan-after-header"/>
        </>
    );
};

export default Header;
