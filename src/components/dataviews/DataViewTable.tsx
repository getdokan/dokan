import { DataViews } from '@wordpress/dataviews/wp';
import { Slot } from '@wordpress/components';
import { ViewportDimensions } from '@dokan/hooks/ViewportDimensions';
import type {
    Action,
    Field,
    SupportedLayouts,
    View,
} from '@wordpress/dataviews/src/types';
import { kebabCase, snakeCase } from '@dokan/utilities';
import { useEffect } from '@wordpress/element';
import { useWindowDimensions } from '@dokan/hooks';
import { setLocaleData } from '@wordpress/i18n';
import { getTranslatedStrings } from '@src/utilities/getTranslatedStrings';

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
    defaultLayouts?: SupportedLayouts;
    selection?: string[];
    onChangeSelection?: ( items: string[] ) => void;
    onClickItem?: ( item: Item ) => void;
    isItemClickable?: ( item: Item ) => boolean;
    header?: JSX.Element;
} & ( Item extends ItemWithId
    ? { getItemId?: ( item: Item ) => string }
    : { getItemId: ( item: Item ) => string } );

const applyFiltersToTableElements = (
    namespace: string,
    elementName: string,
    element,
    props: DataViewsProps
) => {
    const snakeCaseNamespace = snakeCase( namespace );
    return wp.hooks.applyFilters(
        `dokan_${ snakeCaseNamespace }_dataviews_${ elementName }`,
        element,
        { ...props }
    );
};

const DataViewTable = ( props: DataViewsProps< Item > ) => {
    if ( ! props.namespace ) {
        throw new Error(
            'Namespace is required for the DataViewTable component'
        );
    }

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
    /**
     * Disable sorting & column hiding globally
     */
    const normalizedFields = fields.map( ( field ) => ( {
        enableSorting: false,
        enableHiding: false,
        ...field,
    } ) );
    const getDefaultLayouts = ( customLayout: SupportedLayouts ) => {
        const keys = Object?.keys( customLayout );
        const defaultLayout = {
            table: { density: 'comfortable' },
            list: {},
            grid: {},
        } as SupportedLayouts;

        // TODO: After the next major release, we need to remove this `density` property check. We'll use custom layout otherwise default directly.
        // Currently, we are checking this `density` props for backward version compatibility.
        return ! keys.includes( 'density' ) ? customLayout : defaultLayout;
    };

    // Apply default layouts if not provided.
    const defaultLayouts = getDefaultLayouts(
        props?.defaultLayouts as SupportedLayouts
    );

    // TODO: We should use the `props?.actions?.label` as actionable button, from dokan pro version 4.1.5 it will be working accordingly.
    // Currently, we are using this hardcoded logic for backward version compatibility. After the next major release, we can remove this line.
    const normalizedActions = actions?.map( ( action ) => {
        if ( ! action?.label ) {
            return { ...action, label: action?.icon || '' };
        }
        return action;
    } );

    const filteredProps = {
        ...props,
        data: applyFiltersToTableElements( namespace, 'data', data, props ),
        view: applyFiltersToTableElements( namespace, 'view', view, props ),
        fields: applyFiltersToTableElements(
            namespace,
            'fields',
            normalizedFields,
            props
        ),
        actions: applyFiltersToTableElements(
            namespace,
            'actions',
            normalizedActions,
            props
        ),
        defaultLayouts: applyFiltersToTableElements(
            namespace,
            'layouts',
            defaultLayouts,
            props
        ),
    };

    const tableNameSpace = kebabCase( namespace );
    if ( responsive ) { // Set view type `list` for mobile device.
        useEffect(() => onChangeView({
            ...view,
            type: windowWidth <= 768 ? 'list' : 'table',
        }), [ windowWidth ]);
    }

    useEffect( () => {
        setLocaleData( getTranslatedStrings(), 'default' );
    }, [] );

    return (
        <div id={ tableNameSpace } className={ `dokan-dashboard-datatable` }
             data-filter-id={ `dokan_${snakeCase(namespace)}_dataviews_{item_name}` }>
            {/* Before dokan data table rendered slot */}
            <Slot name={ `dokan-before-vendor-data-table-${ tableNameSpace }` } fillProps={{ ...filteredProps }} />
            <DataViews { ...filteredProps } />
            {/* After dokan data table rendered slot */}
            <Slot name={ `dokan-before-vendor-data-table-${ tableNameSpace }` } fillProps={{ ...filteredProps }} />
        </div>
    );
};

export default DataViewTable;
