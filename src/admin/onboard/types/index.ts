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
