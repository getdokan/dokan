// Client-side mirror of includes/VendorRegistration/FormSetup.php: saved attributes <-> a complete setup.
import type {
    BlockAttributes,
    EditorData,
    FieldOption,
    RegistryRow,
    Row,
    SavedRow,
    SavedSection,
    Section,
    Setup,
    Step,
} from './types';

const fromRegistry = ( registry: RegistryRow ): Row => ( {
    id: registry.id,
    custom: false,
    type: registry.type,
    label: registry.label,
    placeholder: '',
    help: '',
    required: registry.required,
    hidden: registry.hidden,
    locked: registry.locked,
    metaKey: '',
    options: [],
    labels: {},
    registry,
} );

// Mirror of the PHP: values are unique and an empty label shows the value. An option still being typed
// (no value yet) stays, so "Add option" works; the server drops it if it's saved empty.
const uniqueOptions = ( options: FieldOption[] ): FieldOption[] => {
    const seen = new Set< string >();

    return options
        .filter(
            ( option ) =>
                !! option &&
                ( ! option.value ||
                    ( ! seen.has( option.value ) &&
                        !! seen.add( option.value ) ) )
        )
        .map( ( option ) => ( {
            label: option.label?.trim() ? option.label : option.value,
            value: option.value,
        } ) );
};

// Same rule as FormSetup: only the parts a row declares, and only filled in. Kept as typed; the server trims.
const cleanLabels = (
    labels: Record< string, string > | undefined,
    editLabels: Record< string, string > | undefined
): Record< string, string > => {
    const clean: Record< string, string > = {};

    Object.keys( editLabels || {} ).forEach( ( key ) => {
        const label = typeof labels?.[ key ] === 'string' ? labels[ key ] : '';

        if ( label.trim() ) {
            clean[ key ] = label;
        }
    } );

    return clean;
};

const resolveSavedRow = (
    saved: SavedRow,
    rows: Record< string, RegistryRow >,
    reserved: Set< string >,
    data: EditorData
): Row | null => {
    if ( ! saved?.id ) {
        return null;
    }

    if ( saved.custom ) {
        const key = saved.metaKey || '';
        const type = saved.type || 'text';

        if (
            reserved.has( saved.id ) ||
            ! key.startsWith( data.metaPrefix ) ||
            key === data.metaPrefix ||
            // Same rule as the server: only what sanitize_key() keeps.
            ! /^[a-z0-9_-]+$/.test( key ) ||
            data.reservedKeys.includes( key ) ||
            ! data.customTypes.includes( type )
        ) {
            return null;
        }

        return {
            id: saved.id,
            custom: true,
            type,
            label: saved.label || '',
            placeholder: saved.placeholder || '',
            help: saved.help || '',
            required: !! saved.required,
            hidden: !! saved.hidden,
            locked: false,
            metaKey: key,
            options: data.optionTypes.includes( type )
                ? uniqueOptions( saved.options || [] )
                : [],
            labels: {},
        };
    }

    const registry = rows[ saved.id ];

    // A row whose module is off, or that no longer exists, is dropped.
    if ( ! registry ) {
        return null;
    }

    const row = fromRegistry( registry );

    // Kept as typed, so a space between words survives; the server trims.
    row.label = saved.label?.trim() ? saved.label : row.label;
    row.placeholder = saved.placeholder || '';
    row.help = saved.help || '';
    row.labels = cleanLabels( saved.labels, registry.edit_labels );

    if ( ! row.locked ) {
        row.required = saved.required ?? row.required;
        // Rows Dokan settings switch on show whenever their setting is on; WooCommerce decides username and password.
        if (
            ! registry.keeps_section_visible &&
            ! registry.woocommerce_setting
        ) {
            row.hidden = saved.hidden ?? row.hidden;
        }
    }

    return row;
};

export const buildSetup = (
    attributes: Partial< BlockAttributes >,
    data: EditorData
): Setup => {
    const rows: Record< string, RegistryRow > = {};
    data.rows.forEach( ( row ) => ( rows[ row.id ] = row ) );

    const reserved = new Set( [
        ...data.registeredRowIds,
        ...data.rows.map( ( row ) => row.id ),
    ] );
    const defaults = data.sections;
    const saved = attributes.sections || [];
    let sections: Section[] = [];

    if ( saved.length ) {
        const placed = new Set< string >();

        saved.forEach( ( savedSection: SavedSection ) => {
            const base = defaults.find( ( s ) => s.id === savedSection.id );

            if (
                ! savedSection?.id ||
                sections.some( ( s ) => s.id === savedSection.id ) ||
                ( ! base && ! savedSection.custom )
            ) {
                return;
            }

            const section: Section = base
                ? { ...base, custom: false, step: '', rows: [] }
                : {
                      id: savedSection.id,
                      title: savedSection.title || '',
                      hidden: false,
                      locked: false,
                      custom: true,
                      step: '',
                      rows: [],
                  };

            if ( ! section.locked && savedSection.hidden !== undefined ) {
                section.hidden = !! savedSection.hidden;
            }

            section.step = savedSection.step || '';

            ( savedSection.rows || [] ).forEach( ( savedRow ) => {
                if ( placed.has( savedRow?.id ) ) {
                    return;
                }

                const row = resolveSavedRow( savedRow, rows, reserved, data );

                if (
                    row &&
                    ( ! row.custom || ! placed.has( 'meta:' + row.metaKey ) )
                ) {
                    section.rows.push( row );
                    placed.add( row.id );

                    if ( row.metaKey ) {
                        placed.add( 'meta:' + row.metaKey );
                    }
                }
            } );

            sections.push( section );
        } );
    }

    // Put back built-in sections after the section that precedes them by default.
    let previous: string | null = null;
    defaults.forEach( ( base ) => {
        if ( ! sections.some( ( s ) => s.id === base.id ) ) {
            const index =
                previous === null
                    ? 0
                    : sections.findIndex( ( s ) => s.id === previous ) + 1;
            sections.splice( index, 0, {
                ...base,
                custom: false,
                step: '',
                rows: [],
            } );
        }
        previous = base.id;
    } );

    // Place available rows the saved setup doesn't have, by position.
    const placedIds = new Set(
        sections.flatMap( ( s ) => s.rows.map( ( r ) => r.id ) )
    );
    data.rows.forEach( ( registry ) => {
        const section = sections.find( ( s ) => s.id === registry.section );

        if ( placedIds.has( registry.id ) || ! section ) {
            return;
        }

        // Right after the last row that comes before it by default, wherever the owner moved that one.
        let insert = 0;
        section.rows.forEach( ( existing, index ) => {
            if (
                existing.registry &&
                existing.registry.position < registry.position
            ) {
                insert = index + 1;
            }
        } );
        section.rows.splice( insert, 0, fromRegistry( registry ) );
    } );

    // A section holding a locked row, or one that must stay visible, can't be hidden.
    sections = sections.map( ( section ) => {
        const keeps = ( row: Row ) =>
            row.locked || !! row.registry?.keeps_section_visible;

        if ( ! section.rows.some( keeps ) ) {
            return section;
        }

        // Rows the owner hid by hiding the section stay hidden.
        const sectionRows = section.hidden
            ? section.rows.map( ( row ) =>
                  keeps( row ) ? row : { ...row, hidden: true }
              )
            : section.rows;

        return { ...section, rows: sectionRows, hidden: false, locked: true };
    } );

    const splitSteps = !! attributes.splitSteps;
    // Kept while steps are off, so turning them back on restores the owner's split.
    let steps: Step[] = ( attributes.steps || [] ).filter(
        ( step, index, all ) =>
            step?.id &&
            all.findIndex( ( other ) => other?.id === step.id ) === index
    );

    if ( splitSteps ) {
        steps = steps.length ? steps : data.suggestedSteps.steps;

        const ids = steps.map( ( step ) => step.id );
        const last = ids[ ids.length - 1 ];

        sections = sections.map( ( section ) => {
            if ( ids.includes( section.step ) ) {
                return section;
            }

            const suggested = data.suggestedSteps.sections[ section.id ];

            return {
                ...section,
                step: ids.includes( suggested ) ? suggested : last,
            };
        } );
    }

    return { splitSteps, steps, sections };
};

const toSavedRow = ( row: Row ): SavedRow => {
    if ( row.custom ) {
        return {
            id: row.id,
            custom: true,
            type: row.type,
            label: row.label,
            placeholder: row.placeholder,
            help: row.help,
            required: row.required,
            hidden: row.hidden,
            metaKey: row.metaKey,
            options: row.options,
        };
    }

    const saved: SavedRow = { id: row.id };

    if ( row.registry && row.label !== row.registry.label ) {
        saved.label = row.label;
    }

    if ( row.placeholder ) {
        saved.placeholder = row.placeholder;
    }

    if ( row.help ) {
        saved.help = row.help;
    }

    if ( ! row.locked ) {
        saved.required = row.required;
        saved.hidden = row.hidden;
    }

    const labels = cleanLabels( row.labels, row.registry?.edit_labels );

    if ( Object.keys( labels ).length ) {
        saved.labels = labels;
    }

    return saved;
};

// The attributes that store a setup.
export const toAttributes = (
    setup: Setup
): Pick< BlockAttributes, 'splitSteps' | 'steps' | 'sections' > => ( {
    splitSteps: setup.splitSteps,
    // Saved even while steps are off; the server ignores them until they're on.
    steps: setup.steps,
    sections: setup.sections.map( ( section ) => {
        const saved: SavedSection = {
            id: section.id,
            hidden: section.hidden,
            rows: section.rows.map( toSavedRow ),
        };

        if ( section.custom ) {
            saved.custom = true;
            saved.title = section.title;
        }

        if ( section.step ) {
            saved.step = section.step;
        }

        return saved;
    } ),
} );

// Sections in display order: grouped by step when steps are on.
export const orderedSections = ( setup: Setup ): Section[] => {
    if ( ! setup.splitSteps ) {
        return setup.sections;
    }

    return setup.steps.flatMap( ( step ) =>
        setup.sections.filter( ( section ) => section.step === step.id )
    );
};

export const uniqueId = ( prefix: string ): string =>
    prefix + '-' + Math.random().toString( 36 ).slice( 2, 8 );
