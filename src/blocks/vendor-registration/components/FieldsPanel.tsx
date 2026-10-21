import { __, sprintf } from '@wordpress/i18n';
import { useEffect, useRef, useState } from '@wordpress/element';
import {
    Button,
    Dashicon,
    DropdownMenu,
    Modal,
    PanelBody,
    Tooltip,
} from '@wordpress/components';
import { useEditorContext } from '../context';
import { useCurrentPostId } from '../hooks';
import {
    addRow,
    addSectionBelow,
    addStep,
    deleteSection,
    moveRow,
    moveSection,
    removeRow,
    removeStep,
    renameSection,
    renameStep,
    setSectionHidden,
    updateRow,
} from '../mutations';
import { keyFromLabel, takenKeys } from '../metaKeys';
import { orderedSections, uniqueId } from '../setup';
import { offInWooCommerce } from '../visibility';
import FieldEditor from './FieldEditor';
import FieldRow from './FieldRow';
import type { DragEvent } from 'react';
import type { Row, Section } from '../types';

interface DropTarget {
    sectionId: string;
    index: number;
}

export default function FieldsPanel() {
    const { data, setup, updateSetup, savedFields } = useEditorContext();
    const [ open, setOpen ] = useState< Record< string, boolean > >( {} );
    const [ editing, setEditing ] = useState< string | null >( null );
    const [ adding, setAdding ] = useState< {
        sectionId: string;
        row: Row;
    } | null >( null );
    const [ renaming, setRenaming ] = useState< string | null >( null );
    const [ dragging, setDragging ] = useState< string | null >( null );
    const [ target, setTarget ] = useState< DropTarget | null >( null );
    const [ confirmReset, setConfirmReset ] = useState( false );

    const postId = useCurrentPostId();
    const sections = orderedSections( setup );
    const toggle = ( id: string ) =>
        setOpen( { ...open, [ id ]: ! open[ id ] } );

    const startAdding = ( sectionId: string ) => {
        setOpen( { ...open, [ sectionId ]: true } );
        setAdding( {
            sectionId,
            row: {
                id: uniqueId( 'field' ),
                custom: true,
                type: 'text',
                label: '',
                placeholder: '',
                help: '',
                required: false,
                hidden: false,
                locked: false,
                metaKey: keyFromLabel(
                    '',
                    takenKeys( setup, savedFields, undefined, postId ),
                    data
                ),
                options: [],
                labels: {},
            },
        } );
    };

    const endDrag = () => {
        setDragging( null );
        setTarget( null );
    };

    const overRow = (
        event: DragEvent< HTMLDivElement >,
        section: Section,
        index: number
    ) => {
        if ( ! dragging || section.hidden ) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        const rect = event.currentTarget.getBoundingClientRect();
        const after = event.clientY > rect.top + rect.height / 2;
        setTarget( {
            sectionId: section.id,
            index: after ? index + 1 : index,
        } );
    };

    // Over a header, or a collapsed or empty section: drop at the end.
    const overSection = (
        event: DragEvent< HTMLDivElement >,
        section: Section
    ) => {
        if ( ! dragging || section.hidden ) {
            return;
        }

        event.preventDefault();
        setTarget( { sectionId: section.id, index: section.rows.length } );
    };

    const drop = ( event: DragEvent< HTMLDivElement > ) => {
        event.preventDefault();

        if ( dragging && target ) {
            updateSetup(
                moveRow( setup, dragging, target.sectionId, target.index, data )
            );
        }

        endDrag();
    };

    const renderSection = ( section: Section, index: number ) => {
        const shown = section.rows.filter(
            ( row ) => ! row.hidden && ! offInWooCommerce( row, data )
        ).length;
        const isOpen = !! open[ section.id ];
        const pinnedBy = section.rows.find(
            ( row ) => row.registry?.keeps_section_visible
        );
        const isTarget = target?.sectionId === section.id;
        let eyeLabel: string = section.hidden
            ? __( 'Show section', 'dokan-lite' )
            : __( 'Hide section', 'dokan-lite' );

        if ( pinnedBy ) {
            eyeLabel = sprintf(
                /* translators: %s: row name, e.g. Subscription packs */
                __( 'Move %s out first to hide this section.', 'dokan-lite' ),
                pinnedBy.label
            );
        }

        return (
            <div
                key={ section.id }
                className={
                    'dokan-vreg-editor__section' +
                    ( section.hidden ? ' is-hidden' : '' ) +
                    ( isTarget && ! isOpen ? ' is-drop-target' : '' )
                }
                onDragOver={ ( event ) => overSection( event, section ) }
                onDrop={ drop }
            >
                <div className="dokan-vreg-editor__section-head">
                    <Button
                        size="small"
                        icon={ isOpen ? 'arrow-down-alt2' : 'arrow-right-alt2' }
                        label={
                            isOpen
                                ? __( 'Collapse', 'dokan-lite' )
                                : __( 'Expand', 'dokan-lite' )
                        }
                        onClick={ () => toggle( section.id ) }
                    />
                    { renaming === section.id ? (
                        <RenameInput
                            label={ __( 'Section title', 'dokan-lite' ) }
                            value={ section.title }
                            onChange={ ( title ) =>
                                updateSetup(
                                    renameSection( setup, section.id, title )
                                )
                            }
                            onDone={ () => setRenaming( null ) }
                        />
                    ) : (
                        <button
                            type="button"
                            className="dokan-vreg-editor__section-title"
                            onClick={ () => toggle( section.id ) }
                        >
                            { section.title ||
                                __( '(untitled section)', 'dokan-lite' ) }
                        </button>
                    ) }
                    <span className="dokan-vreg-editor__count">
                        { section.hidden
                            ? __( 'off', 'dokan-lite' )
                            : `${ shown }/${ section.rows.length }` }
                    </span>
                    { section.locked && ! pinnedBy ? (
                        <Tooltip
                            text={ __(
                                'Dokan needs this section to create the store.',
                                'dokan-lite'
                            ) }
                        >
                            <span className="dokan-vreg-editor__icon is-lock">
                                <Dashicon icon="lock" size={ 16 } />
                            </span>
                        </Tooltip>
                    ) : (
                        <Button
                            size="small"
                            icon={ section.hidden ? 'hidden' : 'visibility' }
                            disabled={ !! pinnedBy }
                            showTooltip
                            label={ eyeLabel }
                            onClick={ () =>
                                updateSetup(
                                    setSectionHidden(
                                        setup,
                                        section.id,
                                        ! section.hidden
                                    )
                                )
                            }
                        />
                    ) }
                    <DropdownMenu
                        icon="ellipsis"
                        label={ __( 'Section options', 'dokan-lite' ) }
                        toggleProps={ { size: 'small' } }
                        controls={ [
                            {
                                title: __( 'Move up', 'dokan-lite' ),
                                isDisabled: 0 === index,
                                onClick: () =>
                                    updateSetup(
                                        moveSection( setup, section.id, -1 )
                                    ),
                            },
                            {
                                title: __( 'Move down', 'dokan-lite' ),
                                isDisabled: sections.length - 1 === index,
                                onClick: () =>
                                    updateSetup(
                                        moveSection( setup, section.id, 1 )
                                    ),
                            },
                            {
                                title: __( 'Add section below', 'dokan-lite' ),
                                onClick: () => {
                                    const result = addSectionBelow(
                                        setup,
                                        section.id
                                    );
                                    updateSetup( result.setup );
                                    setOpen( { ...open, [ result.id ]: true } );
                                    setRenaming( result.id );
                                },
                            },
                            ...( section.custom
                                ? [
                                      {
                                          title: __( 'Rename', 'dokan-lite' ),
                                          onClick: () =>
                                              setRenaming( section.id ),
                                      },
                                      {
                                          title: __( 'Delete', 'dokan-lite' ),
                                          onClick: () =>
                                              updateSetup(
                                                  deleteSection(
                                                      setup,
                                                      section.id,
                                                      data
                                                  )
                                              ),
                                      },
                                  ]
                                : [] ),
                        ] }
                    />
                </div>

                { isOpen && (
                    <div className="dokan-vreg-editor__section-body">
                        { section.rows.map( ( row, rowIndex ) => {
                            let dropAt: 'before' | 'after' | null = null;

                            if ( isTarget && target?.index === rowIndex ) {
                                dropAt = 'before';
                            } else if (
                                isTarget &&
                                target?.index === rowIndex + 1 &&
                                rowIndex === section.rows.length - 1
                            ) {
                                dropAt = 'after';
                            }

                            return (
                                <FieldRow
                                    key={ row.id }
                                    row={ row }
                                    dropAt={ dropAt }
                                    onEdit={ () =>
                                        setEditing(
                                            editing === row.id ? null : row.id
                                        )
                                    }
                                    onChange={ ( patch ) =>
                                        updateSetup(
                                            updateRow( setup, row.id, patch )
                                        )
                                    }
                                    onRemove={ () =>
                                        updateSetup(
                                            removeRow( setup, row.id )
                                        )
                                    }
                                    onDragStart={ ( event ) => {
                                        event.dataTransfer.effectAllowed =
                                            'move';
                                        event.dataTransfer.setData(
                                            'text/plain',
                                            row.id
                                        );
                                        setDragging( row.id );
                                    } }
                                    onDragOver={ ( event ) =>
                                        overRow( event, section, rowIndex )
                                    }
                                    onDragEnd={ endDrag }
                                >
                                    { editing === row.id && (
                                        <FieldEditor
                                            mode="edit"
                                            row={ row }
                                            onChange={ ( next ) =>
                                                updateSetup(
                                                    updateRow(
                                                        setup,
                                                        row.id,
                                                        next
                                                    )
                                                )
                                            }
                                            onDone={ () => setEditing( null ) }
                                        />
                                    ) }
                                </FieldRow>
                            );
                        } ) }

                        { 0 === section.rows.length && (
                            <p className="dokan-vreg-editor__muted">
                                { __( 'No fields yet', 'dokan-lite' ) }
                            </p>
                        ) }

                        { adding?.sectionId === section.id ? (
                            <FieldEditor
                                mode="add"
                                row={ adding.row }
                                onChange={ ( row ) =>
                                    setAdding( { sectionId: section.id, row } )
                                }
                                onCancel={ () => setAdding( null ) }
                                onDone={ () => {
                                    updateSetup(
                                        addRow(
                                            setup,
                                            section.id,
                                            adding.row,
                                            data
                                        )
                                    );
                                    setAdding( null );
                                } }
                            />
                        ) : (
                            <Button
                                variant="link"
                                icon="plus-alt2"
                                className="dokan-vreg-editor__add-field"
                                onClick={ () => startAdding( section.id ) }
                            >
                                { __( 'Add field', 'dokan-lite' ) }
                            </Button>
                        ) }
                    </div>
                ) }
            </div>
        );
    };

    return (
        <PanelBody title={ __( 'Fields', 'dokan-lite' ) } initialOpen>
            <div className="dokan-vreg-editor__legend">
                <span>
                    <Dashicon icon="visibility" size={ 16 } />{ ' ' }
                    { __( 'shown', 'dokan-lite' ) }
                </span>
                <span>
                    <span className="dokan-vreg-editor__required-mark">✱</span>{ ' ' }
                    { __( 'required', 'dokan-lite' ) }
                </span>
                <span>
                    <Dashicon icon="lock" size={ 16 } />{ ' ' }
                    { __( 'always on', 'dokan-lite' ) }
                </span>
            </div>
            <p className="dokan-vreg-editor__label">
                { __( 'Sign-up form', 'dokan-lite' ) }
            </p>

            <div className="dokan-vreg-editor__sections" onDragEnd={ endDrag }>
                { setup.splitSteps
                    ? setup.steps.map( ( step, stepIndex ) => {
                          const stepSections = sections.filter(
                              ( section ) => section.step === step.id
                          );

                          return (
                              <div
                                  key={ step.id }
                                  className="dokan-vreg-editor__step"
                              >
                                  <div className="dokan-vreg-editor__step-head">
                                      <span className="dokan-vreg-editor__step-badge">
                                          { sprintf(
                                              /* translators: %d: step number */
                                              __( 'Step %d', 'dokan-lite' ),
                                              stepIndex + 1
                                          ) }
                                      </span>
                                      <input
                                          className="dokan-vreg-editor__step-title"
                                          aria-label={ __(
                                              'Step title',
                                              'dokan-lite'
                                          ) }
                                          value={ step.title }
                                          onChange={ ( event ) =>
                                              updateSetup(
                                                  renameStep(
                                                      setup,
                                                      step.id,
                                                      event.target.value
                                                  )
                                              )
                                          }
                                      />
                                      { 0 === stepSections.length &&
                                          setup.steps.length > 1 && (
                                              <Button
                                                  size="small"
                                                  icon="no-alt"
                                                  label={ __(
                                                      'Remove empty step',
                                                      'dokan-lite'
                                                  ) }
                                                  onClick={ () =>
                                                      updateSetup(
                                                          removeStep(
                                                              setup,
                                                              step.id
                                                          )
                                                      )
                                                  }
                                              />
                                          ) }
                                  </div>
                                  { 0 === stepSections.length && (
                                      <p className="dokan-vreg-editor__muted">
                                          { __(
                                              'No fields yet. Move a section here; empty steps are skipped on the live site.',
                                              'dokan-lite'
                                          ) }
                                      </p>
                                  ) }
                                  { stepSections.map( ( section ) =>
                                      renderSection(
                                          section,
                                          sections.indexOf( section )
                                      )
                                  ) }
                              </div>
                          );
                      } )
                    : sections.map( renderSection ) }
            </div>

            { setup.splitSteps && (
                <Button
                    variant="secondary"
                    icon="plus-alt2"
                    className="dokan-vreg-editor__add-step"
                    onClick={ () => updateSetup( addStep( setup ) ) }
                >
                    { __( 'Add step', 'dokan-lite' ) }
                </Button>
            ) }

            <Button
                variant="link"
                isDestructive
                className="dokan-vreg-editor__reset"
                onClick={ () => setConfirmReset( true ) }
            >
                { __( 'Reset fields to default', 'dokan-lite' ) }
            </Button>

            { confirmReset && (
                <Modal
                    title={ __( 'Reset fields to default?', 'dokan-lite' ) }
                    size="small"
                    onRequestClose={ () => setConfirmReset( false ) }
                >
                    <p>
                        { __(
                            'All sections and fields go back to the defaults. Custom fields are removed from this form; their saved answers stay.',
                            'dokan-lite'
                        ) }
                    </p>
                    <div className="dokan-vreg-editor__modal-actions">
                        <Button
                            variant="tertiary"
                            onClick={ () => setConfirmReset( false ) }
                        >
                            { __( 'Cancel', 'dokan-lite' ) }
                        </Button>
                        <Button
                            variant="primary"
                            isDestructive
                            onClick={ () => {
                                updateSetup( {
                                    splitSteps: setup.splitSteps,
                                    steps: setup.splitSteps
                                        ? data.suggestedSteps.steps
                                        : [],
                                    sections: [],
                                } );
                                setConfirmReset( false );
                            } }
                        >
                            { __( 'Reset', 'dokan-lite' ) }
                        </Button>
                    </div>
                </Modal>
            ) }
        </PanelBody>
    );
}

interface RenameInputProps {
    label: string;
    value: string;
    onChange: ( value: string ) => void;
    onDone: () => void;
}

// Inline title input, focused when it opens; Enter or leaving it finishes.
function RenameInput( { label, value, onChange, onDone }: RenameInputProps ) {
    const ref = useRef< HTMLInputElement >( null );

    useEffect( () => {
        ref.current?.focus();
        ref.current?.select();
    }, [] );

    return (
        <input
            ref={ ref }
            className="dokan-vreg-editor__rename"
            aria-label={ label }
            value={ value }
            onChange={ ( event ) => onChange( event.target.value ) }
            onBlur={ onDone }
            onKeyDown={ ( event ) => 'Enter' === event.key && onDone() }
        />
    );
}
