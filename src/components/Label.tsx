// eslint-disable-next-line import/no-extraneous-dependencies
import React from 'react';

import { Badge } from '@getdokan/dokan-ui';
import type { BadgeProps } from '@getdokan/dokan-ui/dist/components/Badge';

export const WarningLabel = ( { label, ...props }: Partial< BadgeProps > ) => (
    <Badge
        className="ring-1 ring-inset bg-dokan-warning text-dokan-warning ring-dokan-warning"
        color="yellow"
        label={ label }
        { ...props }
    />
);

export const InfoLabel = ( { label, ...props }: Partial< BadgeProps > ) => (
    <Badge
        className="ring-1 ring-inset bg-dokan-info text-dokan-info ring-dokan-info"
        color="blue"
        label={ label }
        { ...props }
    />
);

export const SuccessLabel = ( { label, ...props }: Partial< BadgeProps > ) => (
    <Badge
        className="ring-1 ring-inset bg-dokan-success text-dokan-success ring-dokan-success"
        color="green"
        label={ label }
        { ...props }
    />
);

export const DangerLabel = ( { label, ...props }: Partial< BadgeProps > ) => (
    <Badge
        className="ring-1 ring-inset bg-dokan-danger text-dokan-danger ring-dokan-danger"
        color="red"
        label={ label }
        { ...props }
    />
);

export default {
    WarningLabel,
    InfoLabel,
    SuccessLabel,
    DangerLabel,
};
