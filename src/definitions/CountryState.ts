/**
 * This is the response type of country api
 *
 * Api is: http://you-site.test/wp-json/dokan/v1/data/countries
 */

export interface Link {
    href: string;
}

export interface Links {
    self: Link[];
    collection: Link[];
}

export interface State {
    code: string;
    name: string;
}

export interface Country {
    code: string;
    name: string;
    states: State[];
    _links: Links;
}

export type Countries = Country[];

export interface CountryStateState {
    countries: Record<string, Country>;
    isLoading: Record<string, boolean>;
    errors: Record<string, string | null>;
}
