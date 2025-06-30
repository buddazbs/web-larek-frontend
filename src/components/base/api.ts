import { IApiClient } from '../../types';

function joinUrl(base: string, path: string): string {
    if (base.endsWith('/') && path.startsWith('/')) {
        return base + path.slice(1);
    }
    if (!base.endsWith('/') && !path.startsWith('/')) {
        return base + '/' + path;
    }
    return base + path;
}

export class Api implements IApiClient {
    readonly baseUrl: string;
    protected options: RequestInit;

    constructor(baseUrl: string, options: RequestInit = {}) {
        this.baseUrl = baseUrl;
        this.options = {
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers as object ?? {})
            }
        };
    }

    protected handleResponse<T>(response: Response): Promise<T> {
        if (response.ok) return response.json();
        else return response.json()
            .then(data => Promise.reject(data.error ?? response.statusText));
    }

    get<T>(uri: string): Promise<T> {
        const url = joinUrl(this.baseUrl, uri);
        return fetch(url, {
            ...this.options,
            method: 'GET'
        }).then(this.handleResponse<T>);
    }

    post<T>(uri: string, data: object): Promise<T> {
        const url = joinUrl(this.baseUrl, uri);
        return fetch(url, {
            ...this.options,
            method: 'POST',
            body: JSON.stringify(data)
        }).then(this.handleResponse<T>);
    }
}
