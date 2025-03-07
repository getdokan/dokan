export interface IOnboard {
    onboarding: string;
    general_options: GeneralOptions;
    share_essentials: string;
    marketplace_goal: MarketplaceGoal;
    plugins: IRecommendedPlugin[];
}

export interface GeneralOptions {
    custom_store_url: string;
    global_digital_mode: string;
}

export interface MarketplaceGoal {
    marketplace_focus: string;
    handle_delivery: string;
    top_priority: string;
}

export interface IRecommendedPlugin {
    type: string;
    title: string;
    description: string;
    img_url: string;
    img_alt: string;
    plugins: PluginPlugin[];
}

export interface PluginPlugin {
    name: string;
    slug: string;
    basename: string;
}

// types.ts
export interface OnboardingData {
    onboarding: boolean;
    general_options: {
        custom_store_url: string;
        [ key: string ]: any;
    };
    share_essentials: boolean | string;
    marketplace_goal: MarketplaceGoal;
    plugins: Plugin[];
}

export interface MarketplaceGoal {
    marketplace_focus: string;
    handle_delivery: string;
    top_priority: string;
}

export interface Plugin {
    type: string;
    title: string;
    description: string;
    img_url: string;
    img_alt: string;
    slug: string;
    basename: string;
}

export interface PluginDetail {
    name: string;
    slug: string;
    basename?: string;

    [ key: string ]: any;
}

export interface FormData {
    custom_store_url: string;
    share_essentials: boolean;
    marketplace_goal: MarketplaceGoal;
    plugins: {
        id: string;
        info: {
            name: string;
            'repo-slug': string;
            file?: string;
            [ key: string ]: any;
        };
    }[];
}
