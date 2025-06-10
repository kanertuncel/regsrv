import { WhoisData, WhoisContact } from './types.js';

/**
 * Extracts a domain name from a URL or a plain domain string.
 * @param domainOrUrl - The input string (e.g., "google.com" or "https://www.google.com/search").
 * @returns The parsed domain name (e.g., "google.com").
 */
export function parseDomain(domainOrUrl: string): string {
    try {
        // If it's a valid URL, extract the hostname
        const url = new URL(domainOrUrl);
        // Remove 'www.' prefix if it exists
        const hostname = url.hostname.replace(/^www\./, '');
        if (!isValidDomain(hostname)) throw new Error('Invalid domain or URL provided.');
        return hostname;
    } catch (error) {
        // Not a URL, assume it's a domain name.
        // Basic cleanup: remove protocol-like prefixes and paths.
        const domain = domainOrUrl.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
        if (!isValidDomain(domain)) throw new Error('Invalid domain or URL provided.');
        return domain;
    }
}

// Basic domain validation: must have at least one dot, no spaces, and only valid characters
function isValidDomain(domain: string): boolean {
    // Must not contain spaces, must have at least one dot, and only valid domain characters
    return (
        typeof domain === 'string' &&
        /^[a-zA-Z0-9.-]+$/.test(domain) &&
        domain.includes('.') &&
        !domain.startsWith('.') &&
        !domain.endsWith('.') &&
        !domain.includes('..')
    );
}

/**
 * Parses a vCard array from an RDAP entity.
 */
function parseVcard(vcard: any[]): WhoisContact {
    const contact: WhoisContact = {};
    if (!Array.isArray(vcard) || vcard[0] !== 'vcard') return contact;

    const vcardData = vcard[1];
    const findVcardProp = (prop: string) => vcardData.find((p: any) => p[0] === prop)?.[3];

    contact.name = findVcardProp('fn');
    contact.organization = findVcardProp('org');
    contact.email = findVcardProp('email');

    return contact;
}


/**
 * Standardizes a raw RDAP response into a clean WhoisData object.
 */
export function standardize(rdapResponse: any): WhoisData {
    const findEventDate = (action: string): string | undefined => {
        return rdapResponse.events?.find((e: any) => e.eventAction === action)?.eventDate;
    };

    const findEntity = (role: string): any | undefined => {
        return rdapResponse.entities?.find((e: any) => e.roles?.includes(role));
    };

    const registrarEntity = findEntity('registrar');
    const registrantEntity = findEntity('registrant');

    let registrarName: string | undefined;
    if (registrarEntity) {
        // Prefer the name from the vCard if available
        if (registrarEntity.vcardArray) {
            const registrarVcard = parseVcard(registrarEntity.vcardArray);
            registrarName = registrarVcard.organization || registrarVcard.name;
        }
        // Fallback to other properties
        if (!registrarName) {
            registrarName = registrarEntity.name || registrarEntity.handle;
        }
    }

    return {
        domainName: rdapResponse.ldhName,
        createdAt: findEventDate('registration'),
        updatedAt: rdapResponse.lastChangedDate || findEventDate('last changed'),
        expiresAt: findEventDate('expiration'),
        registrar: {
            name: registrarName,
            ianaId: registrarEntity?.publicIds?.find((id: any) => id.type === 'IANA Registrar ID')?.identifier,
            url: registrarEntity?.links?.find((link: any) => link.rel === 'self')?.href,
        },
        registrant: registrantEntity ? parseVcard(registrantEntity.vcardArray) : undefined,
        nameservers: rdapResponse.nameservers?.map((ns: any) => ns.ldhName) || [],
        status: rdapResponse.status || [],
        raw: rdapResponse,
    };
}