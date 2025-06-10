export interface WhoisContact {
    name?: string;
    organization?: string;
    email?: string;
}

export interface WhoisData {
    domainName: string;
    // Dates in ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)
    createdAt?: string;
    updatedAt?: string;
    expiresAt?: string;

    registrar: {
        name?: string;
        ianaId?: string;
        url?: string;
    };

    registrant?: WhoisContact;

    nameservers: string[];

    status: string[];

    // The raw RDAP response for advanced use cases
    raw: any;
}