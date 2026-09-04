export type IScryfallApiResponse =
    | IScryfallCardResponse
    | IScryfallCardArrayResponse
    | IScryfallRulesResponse;

export type IScryfallCardResponse = IScryfallCard | IScryfallError;
export type IScryfallCardArrayResponse = IScryfallCardArray | IScryfallError;
export type IScryfallRulesResponse = IScryfallRules | IScryfallError;

export interface IScryfallRules {
    data: IScryfallRule[];
}

export interface IScryfallRule {
    source: string;
    published_at: string;
    comment: string;
}

export interface IScryfallCardArray {
    data: IScryfallCard[];
}

export interface IScryfallError {
    status: number;
    details: string;
    code: string;
}

export interface IScryfallCard extends IScryfallCardFace {
    oracle_id: string;
    card_faces?: IScryfallCardFace[];
}

export interface IScryfallCardFace {
    parentId: string;
    prices: {
        eur: string;
        eur_foil: string;
        usd: string;
        usd_foil: string;
        tix: string;
    };
    flavor_text: string;
    set_name: string;
    id: string;
    name: string;
    oracle_id: string;
    mana_cost: string;
    type_line: string;
    oracle_text: string;
    set_type: string;
    legalities: Record<string, 'legal' | 'not_legal' | 'restricted' | 'banned'>;
    cmc?: number;
    /** Day string formatted as YYYY-MM-DD */
    released_at: string;
    image_uris: {
        art_crop: string;
        normal: string;
    };
    colors: string[];
}
