export type IScryfallFuzzyResponse = IScryfallCard | IScryfallError;
export type IScryfallQueryResponse = IScryfallQuerySuccess | IScryfallError;

interface IScryfallQuerySuccess {
    data: IScryfallCard[];
}

interface IScryfallError {
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
    image_uris: {
        normal: string;
    };
}
