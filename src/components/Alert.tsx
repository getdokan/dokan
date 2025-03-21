// eslint-disable-next-line import/no-extraneous-dependencies
import * as React from 'react';
import { SimpleAlert } from '@getdokan/dokan-ui';
import type { SimpleAlertProps } from '@getdokan/dokan-ui/dist/components/SimpleAlert';

export const InfoAlert = ( {
    label,
    children,
    className = '',
}: Partial< SimpleAlertProps > ) => (
    <SimpleAlert
        label={ label }
        color="blue"
        type="info"
        className={ `ring-1 ring-inset !dokan-alert-info ${ className }` }
    >
        { children }
    </SimpleAlert>
);

export const WarningAlert = ( {
    label,
    children,
    className = '',
}: Partial< SimpleAlertProps > ) => (
    <SimpleAlert
        label={ label }
        color="yellow"
        type="warning"
        className={ `ring-1 ring-inset !dokan-alert-warning ${ className }` }
    >
        { children }
    </SimpleAlert>
);

export const SuccessAlert = ( {
    label,
    children,
    className = '',
}: Partial< SimpleAlertProps > ) => (
    <SimpleAlert
        label={ label }
        color="green"
        type="success"
        className={ `ring-1 ring-inset !dokan-alert-success ${ className }` }
    >
        { children }
    </SimpleAlert>
);

export const DangerAlert = ( {
    label,
    children,
    className = '',
}: Partial< SimpleAlertProps > ) => (
    <SimpleAlert
        label={ label }
        color="red"
        type="danger"
        className={ `ring-1 ring-inset !dokan-alert-danger ${ className }` }
    >
        { children }
    </SimpleAlert>
);

export default {
    InfoAlert,
    WarningAlert,
    SuccessAlert,
    DangerAlert,
};
