// eslint-disable-next-line import/no-extraneous-dependencies
import React from 'react';

import { Badge } from '@getdokan/dokan-ui';
import type { BadgeProps } from '@getdokan/dokan-ui/dist/components/Badge';

export const WarningLabel = ( { label, ...props }: Partial< BadgeProps > ) => (
    <Badge
        className="dokan-warning"
        color="yellow"
        label={ label }
        { ...props }
    />
);

export const InfoLabel = ( { label, ...props }: Partial< BadgeProps > ) => (
    <Badge className="dokan-info" color="blue" label={ label } { ...props } />
);

export const SuccessLabel = ( { label, ...props }: Partial< BadgeProps > ) => (
    <Badge
        className="dokan-success"
        color="green"
        label={ label }
        { ...props }
    />
);

export const DangerLabel = ( { label, ...props }: Partial< BadgeProps > ) => (
    <Badge className="dokan-danger" color="red" label={ label } { ...props } />
);

export default {
    WarningLabel,
    InfoLabel,
    SuccessLabel,
    DangerLabel,
};
