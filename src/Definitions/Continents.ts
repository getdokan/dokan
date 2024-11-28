import {Links, State} from './CountryState'

// Country interface
export interface Country {
    code: string;
    name: string;
    currency_code: string;
    currency_pos: 'left' | 'right' | 'left_space' | 'right_space';
    decimal_sep: string;
    dimension_unit: 'cm' | 'foot';
    num_decimals: number;
    thousand_sep: string;
    weight_unit: 'kg' | 'oz';
    states: State[];
}

// Continent interface
export interface Continent {
    code: string;
    name: string;
    countries: Country[];
    _links: Links;
}

// Type for the entire response array
export type ContinentResponse = Continent[];

// Type guard to check if a value is a Continent
export function isContinent(value: any): value is Continent {
    return (
        typeof value === 'object' &&
        value !== null &&
        'code' in value &&
        'name' in value &&
        'countries' in value &&
        '_links' in value &&
        Array.isArray(value.countries)
    );
}

// Type guard to check if a value is a Country
export function isCountry(value: any): value is Country {
    return (
        typeof value === 'object' &&
        value !== null &&
        'code' in value &&
        'name' in value &&
        'currency_code' in value &&
        'currency_pos' in value &&
        'states' in value &&
        Array.isArray(value.states)
    );
}

// Helper type for currency position
export type CurrencyPosition = Country['currency_pos'];

// Helper type for dimension units
export type DimensionUnit = Country['dimension_unit'];

// Helper type for weight units
export type WeightUnit = Country['weight_unit'];


export type Continents = Continent
