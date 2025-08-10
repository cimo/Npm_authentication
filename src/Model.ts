export interface Irequest {
    headers: Record<string, string | string[] | undefined>;
    cookies: Record<string, string>;
    user?: Record<string, unknown>;
    body: {
        user?: Record<string, unknown>;
    };
}

export interface Iresponse {
    status(code: number): Iresponse;
    send(data: Record<string, unknown>): Iresponse;
    cookie(name: string, value: string, options?: Record<string, unknown>): Iresponse;
}
