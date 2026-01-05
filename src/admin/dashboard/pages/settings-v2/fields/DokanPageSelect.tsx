/**
 * Dokan Page Select Field
 *
 * A custom field component for selecting WordPress pages.
 * Demonstrates how to create custom field types for the plugin-settings package.
 */

import { __ } from '@wordpress/i18n';
import { SelectControl } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import type { FieldProps } from '@wedevs/plugin-settings/types';

interface PageOption {
    label: string;
    value: string;
}

export const DokanPageSelect = ( { element, value, onChange }: FieldProps ) => {
    // Fetch pages from WordPress
    const pages = useSelect( ( select ) => {
        const { getEntityRecords, isResolving } = select( 'core' );

        const pageRecords = getEntityRecords( 'postType', 'page', {
            per_page: -1,
            orderby: 'title',
            order: 'asc',
        } );

        const loading = isResolving( 'getEntityRecords', [
            'postType',
            'page',
            { per_page: -1, orderby: 'title', order: 'asc' },
        ] );

        return {
            records: pageRecords || [],
            isLoading: loading,
        };
    }, [] );

    const options: PageOption[] = [
        { label: __( '— Select a page —', 'dokan-lite' ), value: '' },
        ...pages.records.map(
            ( page: { id: number; title: { rendered: string } } ) => ( {
                label: page.title.rendered,
                value: String( page.id ),
            } )
        ),
    ];

    return (
        <div className="dokan-page-select-field">
            <SelectControl
                label={ element.title }
                help={ element.description }
                value={ String( value || '' ) }
                options={ options }
                onChange={ ( newValue ) => onChange( newValue ) }
                disabled={ pages.isLoading }
            />
            { pages.isLoading && (
                <span className="dokan-loading-pages">
                    { __( 'Loading pages...', 'dokan-lite' ) }
                </span>
            ) }
        </div>
    );
};

export default DokanPageSelect;

