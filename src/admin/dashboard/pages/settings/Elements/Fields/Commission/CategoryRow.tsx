import React from 'react';
import { __, sprintf } from '@wordpress/i18n';
import SquarePlus from '../../../../../../../components/Icons/SquarePlus';
import SquareMinus from '../../../../../../../components/Icons/SquareMinus';
import CommissionInputs from './CommissionInputs';
import { CategoryRowProps } from './types';

const CategoryRow: React.FC< CategoryRowProps > = ( {
    category,
    level = 0,
    isExpanded,
    hasChildren,
    onToggle,
    commissionInputsProps,
} ) => {
    const isAllCategory = category.term_id === 'all';

    const renderIcon = () => {
        if ( isAllCategory ) {
            return isExpanded ? (
                <SquareMinus color="#7047EB" />
            ) : (
                <SquarePlus />
            );
        }

        if ( hasChildren ) {
            if ( isExpanded ) {
                return <SquareMinus color="#7047EB" />;
            }
            return <SquarePlus />;
        }

        return <SquarePlus className={ 'opacity-50 cursor-not-allowed' } />;
    };

    return (
        <div
            key={ `${ category.term_id }-${ level }` }
            className="bg-white border-b border-[#E9E9E9] h-20"
        >
            <div className="h-20 w-full flex items-center px-5">
                <div
                    className="flex items-center"
                    style={ { paddingLeft: `${ level * 24 }px` } }
                >
                    <button
                        type="button"
                        className={ `mr-3 p-1 text-[#828282] hover:text-[#575757] focus:!outline-none rounded transition-colors duration-150 ${
                            ! hasChildren && ! isAllCategory
                                ? 'opacity-50 cursor-not-allowed'
                                : ''
                        }` }
                        onClick={ () => {
                            if ( isAllCategory || hasChildren ) {
                                onToggle( category.term_id );
                            }
                        } }
                        disabled={ ! hasChildren && ! isAllCategory }
                    >
                        { renderIcon() }
                    </button>
                    <div className="flex items-center">
                        <span className="font-semibold text-[14px] text-[#575757]">
                            { isAllCategory
                                ? __( 'All Category', 'dokan-lite' )
                                : category.name }
                        </span>
                        <span className="ml-2 text-xs text-[#A5A5AA] bg-[#F1F1F4] px-2 py-0.5 rounded">
                            { sprintf(
                                /* translators: %s: category ID */
                                __( '#%s', 'dokan-lite' ),
                                category.term_id
                            ) }
                        </span>
                    </div>
                </div>

                <div className="flex items-center ml-auto gap-3">
                    <CommissionInputs
                        { ...commissionInputsProps }
                        categoryId={ category.term_id }
                        isAllCategory={ isAllCategory }
                    />
                </div>
            </div>
        </div>
    );
};

export default CategoryRow;
