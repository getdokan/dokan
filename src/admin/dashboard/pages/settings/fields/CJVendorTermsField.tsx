import { __, sprintf } from '@wordpress/i18n';
import { Button, useSettings, type SettingsElement } from '@wedevs/plugin-ui';

// Vendor terms as one row per point; saved as one point per line (E8).
export default function CJVendorTermsField( {
    element,
}: {
    element: SettingsElement;
} ) {
    const { updateValue } = useSettings();
    const fallback = String( element.default ?? '' );
    const saved = String( element.value ?? '' );
    // An empty value means vendors see the default points, so show those.
    const points = ( saved.trim() ? saved : fallback ).split( '\n' );

    const save = ( next: string[] ) =>
        updateValue( element.dependency_key ?? element.id, next.join( '\n' ) );

    const change = ( index: number, text: string ) =>
        save(
            points.map( ( point, i ) =>
                // A line break would split the point in two.
                i === index ? text.replace( /\s*[\r\n]+\s*/g, ' ' ) : point
            )
        );

    return (
        <div className="flex flex-col gap-3 p-4" data-testid="cj-vendor-terms">
            <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold">{ element.title }</span>
                { element.description && (
                    <span className="text-xs text-muted-foreground leading-relaxed">
                        { element.description }
                    </span>
                ) }
            </div>

            <ol className="m-0 flex list-none flex-col gap-2 p-0">
                { points.map( ( point, index ) => (
                    <li key={ index } className="flex items-start gap-2">
                        <span className="w-5 shrink-0 pt-2 text-right text-sm text-muted-foreground">
                            { index + 1 }.
                        </span>
                        <textarea
                            className="min-h-10 flex-1 resize-y rounded-md border px-3 py-2 text-sm leading-relaxed [field-sizing:content]"
                            rows={ 2 }
                            value={ point }
                            aria-label={ sprintf(
                                /* translators: %d: point number */
                                __( 'Point %d', 'dokan-lite' ),
                                index + 1
                            ) }
                            onChange={ ( e ) =>
                                change( index, e.target.value )
                            }
                            data-testid={ `cj-vendor-terms-${ index }` }
                        />
                        <Button
                            variant="outline"
                            onClick={ () =>
                                save( points.filter( ( _, i ) => i !== index ) )
                            }
                            disabled={ points.length < 2 }
                        >
                            { __( 'Remove', 'dokan-lite' ) }
                        </Button>
                    </li>
                ) ) }
            </ol>

            <div className="flex gap-2">
                <Button
                    variant="outline"
                    onClick={ () => save( [ ...points, '' ] ) }
                    data-testid="cj-vendor-terms-add"
                >
                    { __( 'Add point', 'dokan-lite' ) }
                </Button>
                { saved.trim() && saved !== fallback && (
                    <Button
                        variant="outline"
                        onClick={ () =>
                            updateValue(
                                element.dependency_key ?? element.id,
                                fallback
                            )
                        }
                        data-testid="cj-vendor-terms-reset"
                    >
                        { __( 'Reset to default', 'dokan-lite' ) }
                    </Button>
                ) }
            </div>
        </div>
    );
}
