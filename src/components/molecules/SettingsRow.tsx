import React from 'react';
import { ToggleSwitch } from '../fields';

interface SettingsRowProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    helpLink?: string;
    helpText?: string;
    checked: boolean;
    onToggle: ( checked: boolean ) => void;
    status?: string;
    statusColor?: string;
}

const SettingsRow: React.FC< SettingsRowProps > = ( {
    icon,
    title,
    description,
    helpLink,
    helpText,
    checked,
    onToggle,
    status,
    statusColor = '#7047eb',
} ) => (
    <div className="flex items-center bg-white rounded-[5px] border border-[#e9e9e9] p-5 mb-4 shadow-sm">
        { icon && <div className="mr-4 flex-shrink-0">{ icon }</div> }
        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
                <span className="font-semibold text-[#25252d] text-[16px] truncate">
                    { title }
                </span>
                { status && (
                    <span
                        className="ml-2 px-2 py-0.5 rounded text-xs font-medium"
                        style={ { background: statusColor, color: '#fff' } }
                    >
                        { status }
                    </span>
                ) }
            </div>
            { description && (
                <div className="text-[#828282] text-[14px] mt-1 truncate">
                    { description }
                </div>
            ) }
            { helpLink && helpText && (
                <a
                    href={ helpLink }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#7047eb] text-xs underline mt-1 inline-block"
                >
                    { helpText }
                </a>
            ) }
        </div>
        <div className="ml-4 flex-shrink-0">
            <ToggleSwitch checked={ checked } onChange={ onToggle } />
        </div>
    </div>
);

export default SettingsRow;
