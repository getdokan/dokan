import { useEffect, useMemo, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import {
    Button,
    Input,
    useSettings,
    type SettingsElement,
} from '@wedevs/plugin-ui';

type Category = { id: string; name: string; parent: string };
type Blocked = { id: string; name: string; mode: 'imports' | 'existing' };

const MAX_MATCHES = 20;

// Block CJ categories from import; per category, the admin decides what happens to products already imported (B8).
export default function CJBlockedCategoriesField( {
    element,
}: {
    element: SettingsElement;
} ) {
    const { updateValue } = useSettings();
    const [ categories, setCategories ] = useState< Category[] | null >( null );
    const [ error, setError ] = useState( '' );
    const [ search, setSearch ] = useState( '' );

    const blocked: Blocked[] = useMemo(
        () =>
            Array.isArray( element.value )
                ? ( element.value as Blocked[] )
                : [],
        [ element.value ]
    );
    const save = ( next: Blocked[] ) =>
        updateValue( element.dependency_key ?? element.id, next );

    useEffect( () => {
        apiFetch< Category[] >( {
            path: 'dokan/v1/admin/cj-dropshipping/categories',
        } )
            .then( setCategories )
            .catch( ( e ) =>
                setError(
                    e?.message ||
                        __(
                            "CJ's categories couldn't be loaded.",
                            'dokan-lite'
                        )
                )
            );
    }, [] );

    const matches = useMemo( () => {
        const term = search.trim().toLowerCase();

        if ( ! term || ! categories ) {
            return [];
        }

        return categories
            .filter(
                ( category ) =>
                    ! blocked.some( ( row ) => row.id === category.id ) &&
                    `${ category.parent } › ${ category.name }`
                        .toLowerCase()
                        .includes( term )
            )
            .slice( 0, MAX_MATCHES );
    }, [ search, categories, blocked ] );

    const add = ( category: Category ) => {
        save( [
            ...blocked,
            { id: category.id, name: category.name, mode: 'imports' },
        ] );
        setSearch( '' );
    };

    return (
        <div
            className="flex flex-col gap-3 p-4"
            data-testid="cj-blocked-categories"
        >
            <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold">{ element.title }</span>
                { element.description && (
                    <span className="text-xs text-muted-foreground leading-relaxed">
                        { element.description }
                    </span>
                ) }
            </div>

            { blocked.length > 0 && (
                <ul className="m-0 flex flex-col gap-2 p-0">
                    { blocked.map( ( row ) => (
                        <li
                            key={ row.id }
                            className="flex flex-wrap items-center gap-2 rounded-md border p-2 text-sm"
                            data-testid={ `cj-blocked-${ row.id }` }
                        >
                            <span className="min-w-40 flex-1 font-medium">
                                { row.name }
                            </span>
                            <select
                                className="min-w-80 rounded-md border py-1 pl-2 pr-8 text-sm"
                                aria-label={ sprintf(
                                    /* translators: %s: CJ category name */
                                    __(
                                        'Products already imported from %s',
                                        'dokan-lite'
                                    ),
                                    row.name
                                ) }
                                value={ row.mode }
                                onChange={ ( e ) =>
                                    save(
                                        blocked.map( ( item ) =>
                                            item.id === row.id
                                                ? {
                                                      ...item,
                                                      mode: e.target
                                                          .value as Blocked[ 'mode' ],
                                                  }
                                                : item
                                        )
                                    )
                                }
                            >
                                <option value="imports">
                                    { __(
                                        'Block new imports only',
                                        'dokan-lite'
                                    ) }
                                </option>
                                <option value="existing">
                                    { __(
                                        'Also move imported products to Draft',
                                        'dokan-lite'
                                    ) }
                                </option>
                            </select>
                            <Button
                                variant="outline"
                                onClick={ () =>
                                    save(
                                        blocked.filter(
                                            ( item ) => item.id !== row.id
                                        )
                                    )
                                }
                            >
                                { __( 'Unblock', 'dokan-lite' ) }
                            </Button>
                        </li>
                    ) ) }
                </ul>
            ) }

            { error && <span className="text-sm text-red-600">{ error }</span> }

            { categories && (
                <div className="flex flex-col gap-1">
                    <Input
                        value={ search }
                        placeholder={ __(
                            'Search CJ categories to block',
                            'dokan-lite'
                        ) }
                        onChange={ (
                            e: React.ChangeEvent< HTMLInputElement >
                        ) => setSearch( e.target.value ) }
                        data-testid="cj-blocked-search"
                    />
                    { matches.length > 0 && (
                        <ul className="m-0 flex max-h-64 flex-col overflow-auto rounded-md border p-0">
                            { matches.map( ( category ) => (
                                <li key={ category.id } className="list-none">
                                    <button
                                        type="button"
                                        className="w-full cursor-pointer border-0 bg-transparent px-3 py-2 text-left text-sm hover:bg-muted"
                                        onClick={ () => add( category ) }
                                    >
                                        <span className="font-medium">
                                            { category.name }
                                        </span>{ ' ' }
                                        <span className="text-muted-foreground">
                                            { category.parent }
                                        </span>
                                    </button>
                                </li>
                            ) ) }
                        </ul>
                    ) }
                    { search.trim() && 0 === matches.length && (
                        <span className="text-xs text-muted-foreground">
                            { __( 'No CJ category matches.', 'dokan-lite' ) }
                        </span>
                    ) }
                </div>
            ) }
        </div>
    );
}
