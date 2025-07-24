import { SimpleCheckboxGroup } from '@getdokan/dokan-ui';
import { __, sprintf } from '@wordpress/i18n';
import { RawHTML, useState } from '@wordpress/element';
import Popover from '@dokan/components/Popover';

interface CategorySelectorProps {
    categories: Record< string, number >;
    onChange: ( categories: string[] ) => void;
    selectedCategories: string[];
}

const CategorySelector = ( {
    categories,
    onChange,
    selectedCategories,
}: CategorySelectorProps ) => {
    const options = Object.entries( categories ).map(
        ( [ category, count ] ) => ( {
            label: sprintf(
                // translators: %1$s: category name, %2$s: category count
                __( '%1$s (%2$s)', 'dokan-lite' ),
                category,
                count
            ),
            value: category,
        } )
    );

    const [ popoverAnchor, setPopoverAnchor ] = useState();
    const [ isVisible, setIsVisible ] = useState( false );

    return (
        <div>
            { /* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */ }
            <div
                className="inline-flex items-center gap-x-1 text-sm/6 text-gray-900"
                onClick={ () => {
                    setIsVisible( ! isVisible );
                } }
                // @ts-ignore
                ref={ setPopoverAnchor }
            >

                <p className="text-sm text-gray-500 cursor-pointer flex items-center gap-x-1">
                    <RawHTML>
                        { sprintf(
                            // translators: %1$s: opening tag, %2$s: closing tag
                            __( 'Select %1$s Category %2$s', 'dokan-lite' ),
                            '<span class="text-black">',
                            '</span>'
                        ) }
                    </RawHTML>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="size-5"
                    >
                        <path
                            fillRule="evenodd"
                            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                            clipRule="evenodd"
                        />
                    </svg>
                </p>
            </div>

            { isVisible && (
                <Popover
                    animate
                    anchor={ popoverAnchor }
                    focusOnMount={ true }
                    onClose={ () => {
                        setIsVisible( ! isVisible );
                    } }
                    onFocusOutside={ () => {
                        setIsVisible( ! isVisible );
                    } }
                    className="dokan-layout dokan-lite-module-select-category-popover"
                >
                    <div className="w-64 shrink rounded bg-white p-4 text-sm/6 font-semibold text-gray-900 shadow-lg ring-1 ring-gray-900/5">
                        <SimpleCheckboxGroup
                            label={ __( 'All Categories', 'dokan-lite' ) }
                            onChange={ ( changed ) => onChange( changed ) }
                            options={ options }
                            defaultValue={ selectedCategories }
                        />
                    </div>
                </Popover>
            ) }
        </div>
    );
};

export default CategorySelector;
