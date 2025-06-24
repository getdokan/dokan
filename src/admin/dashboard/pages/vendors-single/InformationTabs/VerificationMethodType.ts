type VerificationMethodLink = {
    href: string;
    targetHints?: {
        allow: string[];
    };
};

type VerificationMethodLinks = {
    self: VerificationMethodLink[];
    collection: { href: string }[];
};

export type VerificationMethod = {
    id: number;
    title: string;
    help_text: string;
    status: boolean;
    required: boolean;
    kind: string;
    created_at: string;
    updated_at: string;
    _links: VerificationMethodLinks;
};
