import { DataViews } from '@wordpress/dataviews/wp';
import { Slot } from '@wordpress/components';
import { ViewportDimensions, useWindowDimensions } from '@dokan/hooks';
import type {
    Action,
    Field,
    SupportedLayouts,
    View,
} from '@wordpress/dataviews/src/types';
import { kebabCase, snakeCase } from '@dokan/utilities';
import { useEffect, useState } from '@wordpress/element';
import './style.scss';
import { AdminFilterProps } from '@src/components/AdminFilter';
import { AdminTabProps } from '@src/components/AdminTab';
import { AdminTab, AdminFilter } from '@src/components';
import { __ } from '@wordpress/i18n';
import { twMerge } from 'tailwind-merge';
import { Funnel } from 'lucide-react';
import { Item } from '@wordpress/components/build-types/navigation/types';
import ListEmpty from '@src/components/dataviews/ListEmpty';

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
    empty?: JSX.Element;
    emptyIcon?: JSX.Element;
    emptyTitle?: string;
    emptyDescription?: string;
    header?: JSX.Element;
    filter?: Omit< AdminFilterProps, 'namespace' >;
    tabs?: Omit< AdminTabProps, 'variant' | 'namespace' | 'orientation' >;
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

const AdminDataViewTable = ( props: DataViewsProps< Item > ) => {
    if ( ! props.namespace ) {
        throw new Error(
            'Namespace is required for the DataViewTable component'
        );
    }

    const { width: windowWidth } = useWindowDimensions();
    const [ showFilters, setShowFilters ] = useState( false );
    const [ openSelectorSignal, setOpenSelectorSignal ] = useState( 0 );
    const [ buttonRef, setButtonRef ] = useState< HTMLButtonElement | null >();
    const [ hasActiveFilters, setHasActiveFilters ] = useState( false );
    const {
        responsive = true,
        onChangeView,
        namespace,
        actions,
        fields,
        view,
        data,
        empty,
        emptyIcon,
        emptyTitle,
        emptyDescription,
    } = props;

    const filteredProps = {
        ...props,
        data: applyFiltersToTableElements( namespace, 'data', data, props ),
        view: applyFiltersToTableElements( namespace, 'view', view, props ),
        fields: applyFiltersToTableElements(
            namespace,
            'fields',
            fields,
            props
        ),
        actions: applyFiltersToTableElements(
            namespace,
            'actions',
            actions,
            props
        ),

        empty: empty || (
            <ListEmpty
                icon={ emptyIcon }
                title={ emptyTitle }
                description={ emptyDescription }
            />
        ),
    };

    const tableNameSpace = kebabCase( namespace );
    if ( responsive ) {
        // Set view type `list` for mobile device.
        useEffect(
            () =>
                onChangeView( {
                    ...view,
                    type: windowWidth <= 768 ? 'list' : 'table',
                } ),
            [ windowWidth ]
        );
    }

    // Auto-hide filter area when there are no active filters
    useEffect( () => {
        if ( ! hasActiveFilters ) {
            setShowFilters( false );
        }
    }, [ hasActiveFilters ] );

    const tabsWithFilterButton =
        filteredProps.filter?.fields &&
        filteredProps.tabs &&
        filteredProps.filter.fields.length > 0
            ? ( () => {
                  const existing =
                      filteredProps.tabs?.additionalComponents || [];
                  const hasButton = existing.some(
                      ( comp: any ) =>
                          comp &&
                          comp.key === 'dokan_admin_dashboard_filter_button'
                  );

                  if ( hasButton ) {
                      // Button already exists in additionalComponents; do not add another one
                      return filteredProps.tabs;
                  }

                  const newButton = (
                      <button
                          type="button"
                          ref={ setButtonRef }
                          key="dokan_admin_dashboard_filter_button"
                          title={ __( 'Filter', 'dokan-lite' ) }
                          className={ twMerge(
                              'inline-flex items-center gap-2 rounded-md bg-white px-3 py-1.5 text-sm hover:text-[#7047EB]',
                              showFilters ? 'text-[#7047EB]' : 'text-[#828282]'
                          ) }
                          onClick={ () => {
                              if ( hasActiveFilters ) {
                                  setShowFilters( ( prev ) => ! prev );
                              } else {
                                  setOpenSelectorSignal( ( s ) => s + 1 );
                              }
                          } }
                      >
                          <Funnel size={ 20 } />
                      </button>
                  );

                  return {
                      ...filteredProps.tabs,
                      additionalComponents: [ ...existing, newButton ],
                  };
              } )()
            : filteredProps.tabs;

    return (
        <div
            id={ tableNameSpace }
            className={ `dokan-admin-dashboard-datatable` }
            data-filter-id={ `dokan_admin_${ snakeCase(
                namespace
            ) }_dataviews_{item_name}` }
        >
            { /* Before dokan data table rendered slot */ }
            <Slot
                name={ `dokan-before-admin-data-table-${ tableNameSpace }` }
                fillProps={ { ...filteredProps } }
            />
            <DataViews { ...filteredProps }>
                <div className="dokan-admin-dashboard-datatable-header w-full flex items-center flex-col justify-between rounded-tr-md rounded-tl-md">
                    { filteredProps.tabs &&
                        filteredProps.tabs.tabs &&
                        filteredProps.tabs.tabs.length > 0 && (
                            <AdminTab
                                { ...( tabsWithFilterButton ||
                                    filteredProps.tabs ) }
                                namespace={ tableNameSpace }
                                onSelect={ ( tabName ) => {
                                    filteredProps.tabs?.onSelect?.( tabName );
                                    filteredProps.selection = [];
                                    filteredProps.onChangeSelection?.( [] );
                                } }
                            />
                        ) }
                    { filteredProps.filter &&
                        filteredProps.filter.fields &&
                        filteredProps.filter.fields.length > 0 && (
                            <div
                                className={ `dokan-admin-dashboard-filters transition-all border-t flex w-full justify-between border-gray-200 p-4 bg-white ${
                                    showFilters ? '' : '!hidden'
                                }` }
                            >
                                <AdminFilter
                                    { ...filteredProps.filter }
                                    namespace={ tableNameSpace }
                                    openSelectorSignal={ openSelectorSignal }
                                    onFirstFilterAdded={ () =>
                                        setShowFilters( true )
                                    }
                                    onReset={ () => {
                                        if ( filteredProps.filter?.onReset ) {
                                            filteredProps.filter.onReset();
                                        }
                                        setShowFilters( false );
                                    } }
                                    onActiveFiltersChange={ ( count ) =>
                                        setHasActiveFilters( count > 0 )
                                    }
                                    buttonPopOverAnchor={ buttonRef }
                                />
                            </div>
                        ) }

                    <div
                        className={ twMerge(
                            'dokan-admin-dashboard-datatable-bulkaction transition-opacity -mb-[65px] flex items-center bg-white z-[1] border-t px-5 py-4 justify-between border-gray-200 w-full',
                            filteredProps.selection &&
                                filteredProps.selection.length > 0
                                ? 'opacity-100 visible'
                                : 'opacity-0 invisible '
                        ) }
                    >
                        <DataViews.BulkActionToolbar />
                    </div>
                </div>
                { /*<DataViews.BulkActionToolbar />*/ }
                <DataViews.Layout />
                <div className="dokan-admin-dashboard-datatable-footer flex items-center justify-between">
                    <DataViews.Pagination className="flex items-center justify-between p-4" />
                </div>
            </DataViews>
            { /* After dokan data table rendered slot */ }
            <Slot
                name={ `dokan-after-admin-data-table-${ tableNameSpace }` }
                fillProps={ { ...filteredProps } }
            />
        </div>
    );
};

export default AdminDataViewTable;
