import { DataViews } from '@wordpress/dataviews/wp';
import { Slot } from "@wordpress/components";
import { ViewportDimensions } from '@/Hooks/ViewportDimensions';
import type { Action, Field, SupportedLayouts, View } from "@wordpress/dataviews/src/types";
import { kebabCase, snakeCase } from './../index';
import { useEffect } from "@wordpress/element";
import { useWindowDimensions } from "../index";
import type { ReactNode } from "react";
import './style.scss';

type ItemWithId = { id: string };

type DataViewsProps< Item > = {
    view: View;
    namespace: string;
    responsive?: boolean;
    onChangeView: ( view: View ) => void;
    fields: Field< Item >[];
    search?: boolean;
    searchLabel?: string;
    actions?: Action< Item >[];
    data: Item[];
    isLoading?: boolean;
    paginationInfo: {
        totalItems: number;
        totalPages: number;
    };
    ViewportDimensions?: typeof ViewportDimensions;
    defaultLayouts: SupportedLayouts;
    selection?: string[];
    onChangeSelection?: ( items: string[] ) => void;
    onClickItem?: ( item: Item ) => void;
    isItemClickable?: ( item: Item ) => boolean;
    header?: ReactNode;
} & ( Item extends ItemWithId
    ? { getItemId?: ( item: Item ) => string }
    : { getItemId: ( item: Item ) => string } );

const applyFiltersToTableElements = (namespace: string, elementName: string, element) => {
    return wp.hooks.applyFilters( `dokan_${ snakeCase( namespace ) }_dataviews_${elementName}`, element );
};

const DataViewTable = ( props: DataViewsProps< Item > ) => {
    const { width: windowWidth } = useWindowDimensions();
    const {
        responsive = true,
        onChangeView,
        namespace,
        actions,
        fields,
        view,
        data,
    } = props;

    const filteredProps = {
        ...props,
        data: applyFiltersToTableElements( namespace, 'data', data ),
        view: applyFiltersToTableElements( namespace, 'view', view ),
        fields: applyFiltersToTableElements( namespace, 'fields', fields ),
        actions: applyFiltersToTableElements( namespace, 'actions', actions ),
    };

    const tableNameSpace = kebabCase( namespace );
    if ( responsive ) { // Set view type `list` for mobile device.
        useEffect(() => onChangeView({
            ...view,
            type: windowWidth <= 768 ? 'list' : 'table',
        }), [ windowWidth ]);
    }

    return (
        <div id={ tableNameSpace }>
            {/* Before dokan data table rendered slot */}
            <Slot name={ `dokan-before-vendor-data-table-${ tableNameSpace }` } fillProps={{ ...filteredProps }} />
            <DataViews { ...filteredProps } />
            {/* After dokan data table rendered slot */}
            <Slot name={ `dokan-before-vendor-data-table-${ tableNameSpace }` } fillProps={{ ...filteredProps }} />
        </div>
    );
};

export default DataViewTable;
