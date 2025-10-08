export interface AuthStore {
    authenticatedFetch(url: string, options?: RequestInit): Promise<Response>;
    getToken(): string | null;
}
