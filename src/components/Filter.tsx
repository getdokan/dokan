import { Button } from '@getdokan/dokan-ui';
import { __ } from '@wordpress/i18n';
import { twMerge } from 'tailwind-merge';
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import { snakeCase, kebabCase } from '../utilities';

interface FilterProps {
    /** Namespace for the filter, used to generate unique IDs */
    namespace: string;
    /** Array of React nodes representing the filter fields */
    fields?: React.ReactNode[];
    /** Whether to show the reset button */
    showReset?: boolean;
    /** Whether to show the filter button */
    showFilter?: boolean;
    /** Callback function to handle filter action */
    onFilter?: () => void;
    /** Callback function to handle reset action */
    onReset?: () => void;
    /** Additional class names for the filter container */
    className?: string;
    /** Additional class names for the filter button */
    filterBtnClassName?: string;
    /** Additional class names for the reset button */
    resetBtnClassName?: string;
}

const Filter = ( {
    namespace = '',
    fields = [],
    showReset = true,
    showFilter = true,
    onFilter = () => {},
    onReset = () => {},
    className = '',
    filterBtnClassName = '',
    resetBtnClassName = '',
}: FilterProps ) => {
    const snakeCaseNamespace = snakeCase( namespace );
    const filterId = `dokan_${ snakeCaseNamespace }_filters`;

    // @ts-ignore
    const filteredFields = wp.hooks.applyFilters( filterId, fields );

    return (
        <div
            className={ twMerge(
                'flex gap-4 flex-row flex-wrap pb-5 items-end dokan-dashboard-filters',
                className
            ) }
            id={ kebabCase( filterId ) }
            data-filter-id={ filterId }
        >
            { filteredFields.map( ( fieldNode: React.ReactNode, index ) => {
                return (
                    <div className="dokan-dashboard-filter-item" key={ index }>
                        { fieldNode }
                    </div>
                );
            } ) }

            { showFilter && (
                <Button
                    color="primary"
                    className={ twMerge(
                        'bg-dokan-btn hover:bg-dokan-btn-hover focus:bg-dokan-btn h-10',
                        filterBtnClassName
                    ) }
                    label={ __( 'Filter', 'dokan' ) }
                    onClick={ onFilter }
                />
            ) }

            { showReset && (
                <Button
                    color="primary"
                    className={ twMerge(
                        'bg-dokan-btn hover:bg-dokan-btn-hover focus:bg-dokan-btn h-10',
                        resetBtnClassName
                    ) }
                    label={ __( 'Reset', 'dokan' ) }
                    onClick={ onReset }
                />
            ) }
        </div>
    );
};

export default Filter;
