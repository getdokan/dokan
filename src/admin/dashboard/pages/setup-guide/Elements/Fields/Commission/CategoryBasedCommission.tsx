import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Button, SimpleInput } from '@getdokan/dokan-ui';
import { debounce } from '@wordpress/compose';
import { SettingsProps } from '../../../StepSettings';
// import Switches from '../../../components/Switches';

const CategoryBasedCommission = ({ element, onValueChange }: SettingsProps) => {
    const [ categories, setCategories ] = useState( [] );
    const [ renderCategories, setRenderCategories ] = useState( [] );
    const [ openRows, setOpenRows ] = useState( [] );
    const [ allCategoryEnabled, setAllCategoryEnabled ] = useState( true );
    const [ commission, setCommission ] = useState( {} );
    const [ resetSubCategory, setResetSubCategory ] = useState( true );

    const { currency } = adminWithdrawData;
    const getCurrencySymbol = currency?.symbol;

    useEffect(() => {
        // Initialize commission data from element
        if ( element?.commission ) {
            setCommission( { ...element?.commission } );
        }

        if ( element?.reset_subcategory ) {
            setResetSubCategory( element.reset_subcategory );
        }

        setCategories( element.categories );
        setRenderCategories( Object.values( getCategories( element.categories ) ) );

        if ( element?.commission?.items && Object.values( element.commission.items ).length ) {
            setAllCategoryEnabled(false);
        }
    }, [element]);

    // Get hierarchical categories
    const getCategories = (categoriesData) => {
        const result = [];
        const categoryMap = {};

        // First, create a map of categories using term_id as the key
        for (const term_id in categoriesData) {
            categoryMap[term_id] = categoriesData[term_id];
        }

        // Iterate through the categories to rearrange them
        for (const term_id in categoryMap) {
            const category = categoryMap[term_id];

            // If the category has a parent (parent_id is not 0), find its parent and insert it after the parent
            if (category.parent_id !== '0') {
                const parent = categoryMap[category.parent_id];
                const parentIndex = result.indexOf(parent);

                // Insert the child category right after its parent
                result.splice(parentIndex + 1, 0, category);
            } else {
                // If it's a top-level category (parent_id is 0), add it to the result
                result.push(category);
            }
        }

        return result;
    };

    // Toggle category row
    const catRowClick = (item) => {
        const termId = Number(item.term_id);

        if (openRows.includes(termId)) {
            // Remove the parent
            setOpenRows(prevRows => {
                const newRows = [...prevRows];
                const index = newRows.indexOf(termId);
                newRows.splice(index, 1);

                // Remove all children
                getChildren(item.term_id).forEach(child => {
                    const childIndex = newRows.indexOf(Number(child));
                    if (childIndex !== -1) {
                        newRows.splice(childIndex, 1);
                    }
                });

                return newRows;
            });
        } else {
            setOpenRows(prevRows => [...prevRows, termId]);
        }
    };

    // Get children of a category
    const getChildren = (parentId) => {
        const categoriesArray = Object.values(categories);

        const children = categoriesArray.filter(item => {
            return item.parents.includes(Number(parentId));
        });

        return children.map(item => item.term_id);
    };

    // Check if a category row should be shown
    const showCatRow = (item) => {
        if (Number(item.parent_id) === 0) {
            return true;
        }

        return openRows.includes(Number(item.parent_id));
    };

    // Get commission value for a category
    const getCommissionValue = ( commissionType, termId ) => {
        if ( commission?.items?.hasOwnProperty( termId ) ) {
            return commission?.items[ termId ][ commissionType ];
        }

        return commission?.all?.[ commissionType ];
    };

    // Handle commission change for a specific category
    const handleCommissionItemChange = debounce((value, commissionType, termId) => {
        if (commissionType === 'percentage') {
            value = validatePercentage(unFormatValue(value));
        } else {
            value = unFormatValue(value);
        }

        setCommission( prevCommission => {
            const newCommission = { ...prevCommission };
            const commissions = { ...newCommission?.items };

            let data = resetSubCategory
                ? { ...newCommission?.all }
                : { flat: '', percentage: '' };

            if (commissions.hasOwnProperty(termId)) {
                data = { ...commissions[termId] };
            }

            data[commissionType] = value;
            commissions[termId] = data;

            newCommission.items = commissions;

            // Update child categories if resetSubCategory is true
            if (resetSubCategory) {
                const allNestedChildrenIds = getChildren(termId);
                allNestedChildrenIds.forEach(id => {
                    newCommission.items[id] = { ...data };
                });
            }

            // Remove categories with same values as 'all'
            Object.keys(newCommission?.items).forEach(key => {
                if (isEqual(newCommission?.items[key], newCommission?.all)) {
                    delete newCommission?.items[key];
                }
            });

            return newCommission;
        });

        // Emit change to parent component
        onValueChange({
            ...element,
            commission: {
                ...commission,
                items: { ...commission?.items, [termId]: {
                    ...commission?.items?.[termId] || commission?.all,
                    [commissionType]: value
                }}
            }
        });
    }, 700);

    // Handle all category commission change
    const handleAllCategoryChange = debounce((value, commissionType) => {
        if (commissionType === 'percentage') {
            value = validatePercentage(unFormatValue(value));
        } else {
            value = unFormatValue(value);
        }

        setCommission(prevCommission => {
            const newCommission = { ...prevCommission };
            newCommission.all = { ...newCommission?.all, [commissionType]: value };

            // Clear items if resetSubCategory is true
            if (resetSubCategory) {
                newCommission.items = {};
            }

            return newCommission;
        });

        // Emit change to parent component
        onValueChange({
            ...element,
            commission: {
                ...commission,
                all: { ...commission?.all, [commissionType]: value },
                items: resetSubCategory ? {} : commission?.items
            }
        });
    }, 700);

    // Handle reset subcategory toggle
    const handleResetToggle = (value) => {
        const confirmTitle = value
            ? __("Enable Commission Inheritance Setting?", "dokan-lite")
            : __("Disable Commission Inheritance Setting?", "dokan-lite");

        const htmlText = value
            ? __("Parent category commission changes will automatically update all subcategories. Existing rates will remain unchanged until parent category is modified.", "dokan-lite")
            : __("Subcategories will maintain their independent commission rates when parent category rates are changed.", "dokan-lite");

        const confirmBtnText = value ? __("Enable", "dokan-lite") : __("Disable", "dokan-lite");

        // In a real implementation, you'd use a confirmation dialog here
        // For now, we'll just update the state
        setResetSubCategory(value);

        // Emit change to parent component
        onValueChange({
            ...element,
            reset_subcategory: value
        });
    };

    // Format and unformat values
    const unFormatValue = (value) => {
        if ( value === '' ) {
            return value;
        }

        // Use accounting.js if available, otherwise simple conversion
        if ( window.accounting ) {
            return String( window.accounting.unformat( value, currency?.decimal || '.' ) );
        }

        return String(value).replace(/[^0-9.-]/g, '');
    };

    const formatValue = ( value ) => {
        if ( value === '' ) {
            return value;
        }

        return window.accounting.formatNumber( value, currency?.precision, currency?.thousand, currency?.decimal );
    };

    // Validate percentage value
    const validatePercentage = (percentage) => {
        if (percentage === '') {
            return percentage;
        }

        const numVal = Number(percentage);
        if (numVal < 0 || numVal > 100) {
            return '';
        }

        return percentage;
    };

    // Check if two objects are equal
    const isEqual = ( value1, value2 ) => {
        // Check if the values are strictly equal
        if (value1 === value2) return true;

        // Check if either value is null or undefined
        if (value1 == null || value2 == null) return false;

        // Check if the types are different
        if (typeof value1 !== typeof value2) return false;

        // Handle plain objects
        if (typeof value1 === 'object' && typeof value2 === 'object') {
            const keys1 = Object.keys(value1);
            const keys2 = Object.keys(value2);

            if (keys1.length !== keys2.length) return false;

            for (let key of keys1) {
                if (!keys2.includes(key)) return false;
                if (!isEqual(value1[key], value2[key])) return false;
            }

            return true;
        }

        // For all other types, return false
        return false;
    };

    if ( ! element.display ) {
        return null;
    }

    // const [ number, setNumber ] = useState( `10.0000` );

    return (
        <div className="p-4 flex flex-col gap-y-4">
            {/*<div className="flex justify-between mb-4 p-0 m-0">*/}
            {/*    <label className="p-0 m-0 mb-[6px] block">*/}
            {/*        {__("Apply Parent Category Commission to All Subcategories", "dokan-lite")}*/}
            {/*    </label>*/}
            {/*    /!*<input type={`text`} value={ number } onChange={ ( e ) => ( setNumber(e.target.value) ) } />*!/*/}
            {/*    <SimpleInput*/}
            {/*        value={ number }*/}
            {/*        onChange={ ( e ) => ( setNumber(e.target.value) ) }*/}
            {/*    />*/}
            {/*    /!*<Switches enabled={resetSubCategory} onChange={handleResetToggle} />*!/*/}
            {/*</div>*/}

            { ( element?.title || element?.description ) && (
                <div className="flex-col flex gap-1">
                    <h2 className="text-sm leading-6 font-semibold text-gray-900">
                        {element?.title}
                    </h2>
                    <p className="text-sm font-normal text-[#828282]">
                        {element?.description}
                    </p>
                </div>
            )}

            <div className="relative">
                <div className="hidden md:flex bg-gray-100 min-h-[3rem] text-gray-500 border-[0.957434px] border-b-0 items-center">
                    <div className="w-1/2 pl-3 flex h-[3rem] items-center border-r-[0.957434px]">
                        <p className="text-xs">{__("Category", "dokan-lite")}</p>
                    </div>
                    <div className="flex w-1/2">
                        <div className="w-1/2 mr-20">
                            <p className="text-xs text-center">{__("Percentage", "dokan-lite")}</p>
                        </div>
                        <div className="w-1/2">
                            <p className="text-xs text-center">{__("Flat", "dokan-lite")}</p>
                        </div>
                    </div>
                </div>

                <div className={ `flex flex-col max-h-[500px] overflow-y-auto border-[1px] text-[14px] border-[#e9e9ea] border-solid ${ !allCategoryEnabled ? 'border-b-[1px]': 'border-b-0' }` }>
                    {/* All Categories Row */}
                    <div className="flex flex-row">
                        <div className="flex flex-row w-1/2 items-center min-h-[3rem] border-0 border-r-[1px] border-b-[1px] border-[#e9e9ea] border-solid pl-[5px]">
                            <button
                                type="button"
                                className="p-1 bg-transparent border-none cursor-pointer"
                                onClick={() => setAllCategoryEnabled(!allCategoryEnabled)}
                            >
                                <i className={`far ${!allCategoryEnabled ? "fa-minus-square text-black" : "fa-plus-square text-[#4C19E6]"}`}></i>
                            </button>
                            <p className="text-[14px] m-0">{
                                __( "All Categories", "dokan-lite" ) }
                            </p>
                        </div>

                        <div className="flex flex-row w-1/2 border-0 border-b-[1px] border-[#e9e9ea] border-solid">
                            <div className="w-1/2 flex justify-start items-center box-border">
                                <SimpleInput
                                    value={ formatValue( commission?.all?.percentage ) }
                                    onChange={ ( e ) => handleAllCategoryChange( e.target.value, 'percentage' ) }
                                    className="wc_input_decimal min-h-full !border-0 w-[100%] pl-[5px] pr-0 pt-0 pb-0 ring-0 focus:ring-0 focus:!outline-none"
                                />
                                <div className="h-full border-l-[1px] border-r-[1px] flex justify-center items-center bg-gray-100">
                                    <span className="pl-2 pr-2">{__("%", "dokan-lite")}</span>
                                </div>
                            </div>
                            <div className="h-full border-l-[1px] border-r-[1px] md:border-0 bg-transparent flex justify-center items-center">
                                <span className="p-2">{__("+" , "dokan-lite")}</span>
                            </div>
                            <div className="w-1/2 flex justify-start items-center box-border">
                                <div className="h-full border-r-[1px] border-l-[1px] flex justify-center items-center bg-gray-100">
                                    <span className="pl-2 pr-2">{ getCurrencySymbol }</span>
                                </div>
                                <SimpleInput
                                    value={ formatValue( commission?.all?.flat ) }
                                    onChange={ ( e ) => handleAllCategoryChange( e.target.value, 'flat' ) }
                                    className="wc_input_price min-h-full !border-0 w-[100%] pl-[5px] pr-0 pt-0 pb-0 ring-0 focus:ring-0 focus:!outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Category Rows */}
                    { ! allCategoryEnabled && renderCategories.map( ( item, index ) => (
                        showCatRow( item ) && (
                            <div
                                key={ item.term_id }
                                className="flex flex-row border-0 border-b-[1px] last:border-b-0 border-[#e9e9ea] border-solid"
                            >
                                <div className="w-1/2 flex flex-row items-center min-h-[3rem] border-0 border-r-[1px] border-[#e9e9ea] border-solid pl-[5px]">
                                    <div className="flex h-1/2">
                                        { item.parents.map( parentId => (
                                            <span
                                                key={ parentId }
                                                className="bg-transparent block h-full w-[1px] ml-1"
                                            ></span>
                                        ) ) }
                                    </div>
                                    <button
                                        type="button"
                                        className={ `p-1 bg-transparent border-none cursor-pointer ${ ! item.children.length ? "disabled:cursor-not-allowed text-gray-300" : "cursor-pointer text-[#4C19E6]" }` }
                                        disabled={ ! item.children.length }
                                        onClick={ () => catRowClick( item ) }
                                    >
                                        <i className={`far ${ openRows.includes( Number( item.term_id ) ) ? "fa-minus-square text-black" : "fa-plus-square" }` }></i>
                                    </button>
                                    <p className="text-[14px] text-black m-0">
                                        <span title={item.name} dangerouslySetInnerHTML={{ __html: item.name }}></span>
                                        <span className="text-[12px] text-gray-500 ml-1" title={__("Category ID", "dokan")}>#{item.term_id}</span>
                                    </p>
                                </div>

                                <div className="w-1/2 flex min-h-[3rem] border-0 border-solid border-[#e9e9ea]">
                                    <div className="w-1/2 flex justify-start items-center box-border">
                                        <SimpleInput
                                            className="wc_input_price min-h-full focus:shadow-none border-0 pl-[5px] pr-0 pt-0 pb-0 w-[100%] ring-0 focus:ring-0 focus:!outline-none"
                                            value={ formatValue( getCommissionValue( 'percentage', item.term_id ) ) }
                                            onChange={ ( e ) => handleCommissionItemChange( e.target.value, 'percentage', item.term_id ) }
                                        />
                                        <div className="h-full border-l-[1px] border-r-[1px] flex justify-center items-center bg-gray-100">
                                            <span className="pl-2 pr-2">{__("%", "dokan-lite")}</span>
                                        </div>
                                    </div>
                                    <div className="h-full border-l-[1px] border-r-[1px] md:border-0 bg-transparent flex justify-center items-center">
                                        <span className="p-2">{__("+" , "dokan-lite")}</span>
                                    </div>
                                    <div className="w-1/2 flex justify-start items-center box-border">
                                        <div className="h-full border-r-[1px] border-l-[1px] flex justify-center items-center bg-gray-100">
                                            <span className="pl-2 pr-2">{ getCurrencySymbol }</span>
                                        </div>
                                        <SimpleInput
                                            className="wc_input_price min-h-full focus:shadow-none border-0 pl-[5px] pr-0 pt-0 pb-0 w-[100%] ring-0 focus:ring-0 focus:!outline-none"
                                            value={ formatValue( getCommissionValue( 'flat', item.term_id ) ) }
                                            onChange={ ( e ) => handleCommissionItemChange( e.target.value, 'flat', item.term_id ) }
                                        />
                                    </div>
                                </div>
                            </div>
                        )
                    ) ) }
                </div>
            </div>
        </div>
    );
};

export default CategoryBasedCommission;
