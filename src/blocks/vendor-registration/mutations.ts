// Pure changes to a setup; the editor saves the result with toAttributes().
import { __ } from '@wordpress/i18n';
import { orderedSections, uniqueId } from './setup';
import type { EditorData, Row, Section, Setup, Step } from './types';

const mapSections = (
    setup: Setup,
    fn: ( s: Section ) => Section
): Setup => ( {
    ...setup,
    sections: setup.sections.map( fn ),
} );

export const findRow = ( setup: Setup, rowId: string ): Row | undefined =>
    setup.sections.flatMap( ( s ) => s.rows ).find( ( r ) => r.id === rowId );

export const sectionOfRow = (
    setup: Setup,
    rowId: string
): Section | undefined =>
    setup.sections.find( ( s ) => s.rows.some( ( r ) => r.id === rowId ) );

// A section holding a locked row, or one that must stay visible, can't be hidden.
const relock = ( section: Section, base?: { locked: boolean } ): Section => {
    const pinned = section.rows.some(
        ( row ) => row.locked || row.registry?.keeps_section_visible
    );

    return {
        ...section,
        locked: pinned || !! base?.locked,
        hidden: pinned ? false : section.hidden,
    };
};

export const updateRow = (
    setup: Setup,
    rowId: string,
    patch: Partial< Row >
): Setup =>
    mapSections( setup, ( section ) => ( {
        ...section,
        rows: section.rows.map( ( row ) =>
            row.id === rowId ? { ...row, ...patch } : row
        ),
    } ) );

export const removeRow = ( setup: Setup, rowId: string ): Setup =>
    mapSections( setup, ( section ) => ( {
        ...section,
        rows: section.rows.filter( ( row ) => row.id !== rowId ),
    } ) );

export const addRow = (
    setup: Setup,
    sectionId: string,
    row: Row,
    data: EditorData
): Setup =>
    mapSections( setup, ( section ) =>
        section.id === sectionId
            ? relock(
                  { ...section, rows: [ ...section.rows, row ] },
                  data.sections.find( ( base ) => base.id === section.id )
              )
            : section
    );

// Move a row to an index in a section; a hidden section takes no rows.
export const moveRow = (
    setup: Setup,
    rowId: string,
    toSectionId: string,
    index: number,
    data: EditorData
): Setup => {
    const row = findRow( setup, rowId );
    const target = setup.sections.find( ( s ) => s.id === toSectionId );

    if ( ! row || ! target || target.hidden ) {
        return setup;
    }

    const from = sectionOfRow( setup, rowId );
    let at = index;

    // Removing the row first shifts later rows of the same section up.
    if ( from?.id === toSectionId ) {
        const current = from.rows.findIndex( ( r ) => r.id === rowId );
        at = current < index ? index - 1 : index;
    }

    const removed = removeRow( setup, rowId );

    return mapSections( removed, ( section ) => {
        const base = data.sections.find( ( s ) => s.id === section.id );

        if ( section.id !== toSectionId ) {
            return section.id === from?.id ? relock( section, base ) : section;
        }

        const rows = [ ...section.rows ];
        rows.splice( Math.max( 0, Math.min( at, rows.length ) ), 0, row );

        return relock( { ...section, rows }, base );
    } );
};

export const setSectionHidden = (
    setup: Setup,
    sectionId: string,
    hidden: boolean
): Setup =>
    mapSections( setup, ( section ) =>
        section.id === sectionId && ! section.locked
            ? { ...section, hidden }
            : section
    );

export const renameSection = (
    setup: Setup,
    sectionId: string,
    title: string
): Setup =>
    mapSections( setup, ( section ) =>
        section.id === sectionId ? { ...section, title } : section
    );

// Move a section; at a step's edge it crosses into the neighbouring step.
export const moveSection = (
    setup: Setup,
    sectionId: string,
    direction: -1 | 1
): Setup => {
    const ordered = orderedSections( setup );
    const index = ordered.findIndex( ( s ) => s.id === sectionId );
    const section = ordered[ index ];

    if ( ! section ) {
        return setup;
    }

    if ( setup.splitSteps ) {
        const stepIndex = setup.steps.findIndex(
            ( step ) => step.id === section.step
        );
        const siblings = ordered.filter( ( s ) => s.step === section.step );
        const position = siblings.findIndex( ( s ) => s.id === sectionId );
        const atEdge =
            direction < 0 ? 0 === position : siblings.length - 1 === position;

        if ( atEdge ) {
            const neighbour = setup.steps[ stepIndex + direction ];

            if ( ! neighbour ) {
                return setup;
            }

            const rest = ordered.filter( ( s ) => s.id !== sectionId );
            const moved = { ...section, step: neighbour.id };
            const neighbours = rest.filter( ( s ) => s.step === neighbour.id );
            // Last of the step above, or first of the step below; any index works for an empty step since steps group the list.
            const anchor =
                direction < 0
                    ? neighbours[ neighbours.length - 1 ]
                    : neighbours[ 0 ];
            const at = anchor
                ? rest.indexOf( anchor ) + ( direction < 0 ? 1 : 0 )
                : rest.length;

            rest.splice( at, 0, moved );

            return { ...setup, sections: rest };
        }
    }

    const swapWith = index + direction;

    if ( swapWith < 0 || swapWith >= ordered.length ) {
        return setup;
    }

    const next = [ ...ordered ];
    [ next[ index ], next[ swapWith ] ] = [ next[ swapWith ], next[ index ] ];

    return { ...setup, sections: next };
};

export const addSectionBelow = (
    setup: Setup,
    sectionId: string
): { setup: Setup; id: string } => {
    const ordered = orderedSections( setup );
    const index = ordered.findIndex( ( s ) => s.id === sectionId );
    const id = uniqueId( 'section' );
    const section: Section = {
        id,
        title: __( 'New section', 'dokan-lite' ),
        custom: true,
        hidden: false,
        locked: false,
        step: ordered[ index ]?.step || '',
        rows: [],
    };
    const next = [ ...ordered ];
    next.splice( index + 1, 0, section );

    return { setup: { ...setup, sections: next }, id };
};

// Deleting a custom section drops its custom fields and returns built-in rows to their default section.
export const deleteSection = (
    setup: Setup,
    sectionId: string,
    data: EditorData
): Setup => {
    const section = setup.sections.find( ( s ) => s.id === sectionId );

    if ( ! section?.custom ) {
        return setup;
    }

    let next: Setup = {
        ...setup,
        sections: setup.sections.filter( ( s ) => s.id !== sectionId ),
    };

    section.rows
        .filter( ( row ) => ! row.custom && row.registry )
        .forEach( ( row ) => {
            const home = next.sections.find(
                ( s ) => s.id === row.registry?.section
            );

            if ( home ) {
                next = mapSections( next, ( s ) =>
                    s.id === home.id
                        ? relock(
                              { ...s, hidden: false, rows: [ ...s.rows, row ] },
                              data.sections.find( ( b ) => b.id === s.id )
                          )
                        : s
                );
            }
        } );

    return next;
};

export const setSplitSteps = (
    setup: Setup,
    on: boolean,
    data: EditorData
): Setup => {
    if ( ! on ) {
        return { ...setup, splitSteps: false };
    }

    const steps = setup.steps.length ? setup.steps : data.suggestedSteps.steps;
    const ids = steps.map( ( step ) => step.id );

    return {
        splitSteps: true,
        steps,
        sections: setup.sections.map( ( section ) => {
            if ( ids.includes( section.step ) ) {
                return section;
            }

            const suggested = data.suggestedSteps.sections[ section.id ];

            return {
                ...section,
                step: ids.includes( suggested )
                    ? suggested
                    : ids[ ids.length - 1 ],
            };
        } ),
    };
};

// A new step goes above the one holding Agreement, so Agreement stays last.
export const addStep = ( setup: Setup ): Setup => {
    const step: Step = {
        id: uniqueId( 'step' ),
        title: __( 'New step', 'dokan-lite' ),
    };
    const agreementStep = setup.sections.find( ( s ) => s.id === 'agreement' )
        ?.step;
    const index = setup.steps.findIndex( ( s ) => s.id === agreementStep );
    const steps = [ ...setup.steps ];

    steps.splice( index >= 0 ? index : steps.length, 0, step );

    return { ...setup, steps };
};

export const renameStep = (
    setup: Setup,
    stepId: string,
    title: string
): Setup => ( {
    ...setup,
    steps: setup.steps.map( ( step ) =>
        step.id === stepId ? { ...step, title } : step
    ),
} );

export const removeStep = ( setup: Setup, stepId: string ): Setup =>
    setup.sections.some( ( s ) => s.step === stepId ) || setup.steps.length < 2
        ? setup
        : {
              ...setup,
              steps: setup.steps.filter( ( step ) => step.id !== stepId ),
          };
