import {
    Location,
    NavigateFunction,
    Navigation,
    Params,
    RedirectFunction,
    UIMatch,
} from 'react-router-dom';

export interface RouterProps {
    navigate: NavigateFunction;
    params: Readonly< Params< string > >;
    location: Location< any >;
    redirect: RedirectFunction;
    replace: RedirectFunction;
    matches: UIMatch< unknown, unknown >[];
    navigation: Navigation;
}
