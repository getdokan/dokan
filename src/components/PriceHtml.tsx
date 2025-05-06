import { RawHTML } from '@wordpress/element';
import { formatPrice } from '@dokan/utilities';

type PriceHtmlProps = {
    price: string | number;
    currencySymbol?: string;
    precision?: number;
    thousand?: string;
    decimal?: string;
    format?: PriceFormat;
};

type PriceFormat = '%v%s' | '%s%v' | '%v %s' | '%s %v' | string;

const PriceHtml = ( {
    price = 0,
    currencySymbol = '',
    precision = null,
    thousand = '',
    decimal = '',
    format = '',
}: PriceHtmlProps ) => {
    return (
        <RawHTML>
            { formatPrice(
                price,
                currencySymbol,
                precision,
                thousand,
                decimal,
                format
            ) }
        </RawHTML>
    );
};

export default PriceHtml;
