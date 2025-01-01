import { DataViews } from '@wordpress/dataviews/wp';
import { Slot } from "@wordpress/components";
import { ViewportDimensions } from '@/Hooks/ViewportDimensions';
import type {Action, Field, SupportedLayouts, View} from "@wordpress/dataviews/src/types";
import type { ReactNode } from "react";
import './style.scss';

type ItemWithId = { id: string };

type DataViewsProps< Item > = {
    view: View;
    namespace: string;
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
    return wp.hooks.applyFilters( `${namespace}.${elementName}`, element );
};

const DataViewTable = ( props: DataViewsProps< Item > ) => {
    const filteredProps = {
        ...props,
        data: applyFiltersToTableElements( props?.namespace, 'data', props.data ),
        view: applyFiltersToTableElements( props?.namespace, 'view', props.view ),
        fields: applyFiltersToTableElements( props?.namespace, 'fields', props.fields ),
        actions: applyFiltersToTableElements( props?.namespace, 'actions', props.actions ),
    };

    return (
        <div className="dokan-dashboard-datatable">
            {/* Before dokan data table rendered slot */}
            <Slot name={ `dokan-before-vendor-data-table-${ props?.namespace }` } fillProps={{ ...filteredProps }} />
            <DataViews { ...filteredProps } />
            {/* After dokan data table rendered slot */}
            <Slot name={ `dokan-before-vendor-data-table-${ props?.namespace }` } fillProps={{ ...filteredProps }} />
        </div>
    );
};

export default DataViewTable;
