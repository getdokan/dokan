import type { ComponentType } from 'react';
import type { FieldProps } from '../../types';

/**
 * Field Registry
 *
 * Allows registration of custom field components.
 */
const fieldRegistry = new Map< string, ComponentType< FieldProps > >();

/**
 * Register a custom field type.
 *
 * @param type      - Field type identifier.
 * @param component - React component for the field.
 */
export function registerField(
    type: string,
    component: ComponentType< FieldProps >
): void {
    fieldRegistry.set( type, component );
}

/**
 * Get a registered field component.
 *
 * @param type - Field type identifier.
 * @return The registered component or undefined.
 */
export function getField(
    type: string
): ComponentType< FieldProps > | undefined {
    return fieldRegistry.get( type );
}

/**
 * Check if a field type is registered.
 *
 * @param type - Field type identifier.
 * @return True if the type is registered.
 */
export function hasField( type: string ): boolean {
    return fieldRegistry.has( type );
}

/**
 * Get all registered field types.
 *
 * @return Array of registered field type names.
 */
export function getRegisteredFieldTypes(): string[] {
    return Array.from( fieldRegistry.keys() );
}

/**
 * Get all registered fields as a map.
 *
 * @return Map of field type to component.
 */
export function getAllFields(): Map< string, ComponentType< FieldProps > > {
    return new Map( fieldRegistry );
}
