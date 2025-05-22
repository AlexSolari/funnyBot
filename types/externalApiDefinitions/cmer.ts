export interface ICmerApiResponse {
    results: {
        id: number;
        title: string;
        file: {
            path: string;
        };
    }[];
}
