import { Switch as _PluginUISwitch } from '@wedevs/plugin-ui';

// Legacy alias for the old `DokanSwitch` component. The underlying plugin-ui
// `Switch` is a Radix primitive that exposes `onCheckedChange(value: boolean)`.
// Old call sites (e.g. dokan-pro's delivery-time module) pass
// `onChange(value: boolean)`. This adapter forwards both names so neither API
// change breaks consumers.
type DokanSwitchProps = {
    checked?: boolean;
    onChange?: ( value: boolean ) => void;
    onCheckedChange?: ( value: boolean ) => void;
    [ key: string ]: unknown;
};

export const DokanSwitch = ( {
    onChange,
    onCheckedChange,
    checked = false,
    ...rest
}: DokanSwitchProps ) => {
    const handler = onCheckedChange ?? onChange;
    return (
        <_PluginUISwitch
            checked={ checked }
            onCheckedChange={ handler }
            { ...rest }
        />
    );
};

export default DokanSwitch;
