export type IScryfallApiResponse =
    | IScryfallFuzzyResponse
    | IScryfallQueryResponse
    | IScryfallRulesResponse;

export type IScryfallFuzzyResponse = IScryfallCard | IScryfallError;
export type IScryfallQueryResponse = IScryfallQuerySuccess | IScryfallError;
export type IScryfallRulesResponse = IScryfallRules | IScryfallError;

export interface IScryfallRules {
    data: IScryfallRule[];
}

export interface IScryfallRule {
    source: string;
    published_at: string;
    comment: string;
}

export interface IScryfallQuerySuccess {
    data: IScryfallCard[];
}

export interface IScryfallError {
    status: number;
    details: string;
    code: string;
}

export interface IScryfallCard extends IScryfallCardFace {
    oracle_text: string;
    name: string;
    mana_cost: string;
    type_line: string;
    oracle_id: string;
    card_faces?: IScryfallCardFace[];
}

export interface IScryfallCardFace {
    flavor_text: string;
    set_name: string;
    id: string;
    name: string;
    mana_cost: string;
    type_line: string;
    oracle_text: string;
    legalities: Record<string, 'legal' | 'not_legal' | 'restricted' | 'banned'>;
    image_uris: {
        art_crop: string;
        normal: string;
    };
}
