import { useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { debounce } from 'lodash';
import { SettingsProps } from '../../StepSettings';

const CombineInput = ({ element, onValueChange }: SettingsProps) => {
    const [values, setValues] = useState({
        percentage: '',
        fixed: ''
    });

    // Get currency symbol
    const getCurrencySymbol = window.dokan?.currency?.symbol || '$';

    // Initialize values from element
    useEffect(() => {
        if (element) {
            setValues({
                percentage: element.percentage || '',
                fixed: element.fixed || ''
            });
        }
    }, [element]);

    // Handle change for percentage input
    const handlePercentageChange = debounce((value) => {
        // Validate percentage (0-100)
        let validatedValue = value;
        if (value !== '') {
            const numValue = parseFloat(unFormatValue(value));
            if (isNaN(numValue) || numValue < 0 || numValue > 100) {
                validatedValue = '';
            }
        }

        setValues(prev => ({
            ...prev,
            percentage: validatedValue
        }));

        // Emit change to parent component
        onValueChange({
            ...element,
            percentage: validatedValue,
            fixed: values.fixed
        });
    }, 500);

    // Handle change for fixed input
    const handleFixedChange = debounce((value) => {
        setValues(prev => ({
            ...prev,
            fixed: value
        }));

        // Emit change to parent component
        onValueChange({
            ...element,
            percentage: values.percentage,
            fixed: value
        });
    }, 500);

    // Format and unformat values
    const unFormatValue = (value) => {
        if (value === '') {
            return value;
        }

        // Use accounting.js if available, otherwise simple conversion
        if (window.accounting) {
            return String(window.accounting.unformat(value, window.dokan?.currency?.decimal || '.'));
        }

        return String(value).replace(/[^0-9.-]/g, '');
    };

    const formatValue = (value) => {
        if (value === '') {
            return value;
        }

        // Use accounting.js if available, otherwise simple formatting
        if (window.accounting) {
            return window.accounting.formatNumber(
                value,
                window.dokan?.currency?.precision || 2,
                window.dokan?.currency?.thousand || ',',
                window.dokan?.currency?.decimal || '.'
            );
        }

        return value;
    };

    if (!element.display) {
        return null;
    }

    return (
        <div className="p-4 flex flex-col gap-y-4">
            <div className="flex-col flex gap-1">
                <h2 className="text-sm leading-6 font-semibold text-gray-900">
                    {element?.title}
                </h2>
                <p className="text-sm font-normal text-[#828282]">
                    {element?.description}
                </p>
            </div>

            <div className="flex items-center space-x-2 border border-gray-300 rounded-md p-2">
                <div className="flex-1 flex items-center">
                    <input
                        type="text"
                        className="flex-1 p-2 border-0 focus:outline-none focus:ring-0"
                        value={formatValue(values.percentage)}
                        onChange={(e) => handlePercentageChange(e.target.value)}
                        placeholder="0"
                    />
                    <div className="px-2 py-1 bg-gray-100 rounded-md">
                        <span>%</span>
                    </div>
                </div>

                <div className="text-gray-500">+</div>

                <div className="flex-1 flex items-center">
                    <div className="px-2 py-1 bg-gray-100 rounded-md">
                        <span>{getCurrencySymbol}</span>
                    </div>
                    <input
                        type="text"
                        className="flex-1 p-2 border-0 focus:outline-none focus:ring-0"
                        value={formatValue(values.fixed)}
                        onChange={(e) => handleFixedChange(e.target.value)}
                        placeholder="0"
                    />
                </div>
            </div>
        </div>
    );
};

export default CombineInput;
