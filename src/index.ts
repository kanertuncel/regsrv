import { customServers, getRdapServerForTld } from './rdap.js';
import { parseDomain, standardize } from './parser.js';
import { WhoisData } from './types.js';

/**
 * Looks up domain information using the RDAP protocol.
 *
 * @param domainOrUrl - The domain name or URL to look up.
 * @returns A promise that resolves to a standardized WhoisData object.
 * @throws Will throw an error if the TLD is not supported or the lookup fails.
 */

// Custom error classes for better error handling
class UnsupportedTldError extends Error {
    constructor(tld: string) {
        super(`Unsupported TLD: .${tld}. No RDAP server found. Please check the TLD or update the RDAP data.`);
        this.name = 'UnsupportedTldError';
    }
}

class DomainNotFoundError extends Error {
    constructor(domain: string) {
        super(`Domain not found: ${domain}. The domain does not exist or is not registered.`);
        this.name = 'DomainNotFoundError';
    }
}

class RdapLookupError extends Error {
    constructor(domain: string, status: number, statusText: string) {
        super(`RDAP lookup failed for ${domain}: ${status} ${statusText}. The RDAP server returned an unexpected response. Try again later or check the domain.`);
        this.name = 'RdapLookupError';
    }
}

class NetworkError extends Error {
    constructor(domain: string, message: string) {
        super(`Network error looking up ${domain}: ${message}. Please check your internet connection or try again later.`);
        this.name = 'NetworkError';
    }
}

export async function whois(domainOrUrl: string): Promise<WhoisData> {
    const domain = parseDomain(domainOrUrl);
    if (!domain) throw new Error('Invalid domain or URL provided.');

    const tld = domain.split('.').pop();
    if (!tld) throw new Error(`Could not extract TLD from domain: ${domain}`);

    const ianaRdapServer = getRdapServerForTld(tld);
    const customRdapServer = customServers[tld.toLowerCase()];
    if (!ianaRdapServer && !customRdapServer) throw new UnsupportedTldError(tld);
    const rdapServer = ianaRdapServer || customRdapServer;
    const lookupUrl = `${rdapServer}domain/${domain.toLowerCase()}`;

    try {
        const response = await fetch(lookupUrl, {
            headers: { 'Accept': 'application/rdap+json' }
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new DomainNotFoundError(domain);
            }
            throw new RdapLookupError(domain, response.status, response.statusText);
        }

        const rawData = await response.json();
        if (!rawData || typeof rawData !== 'object' || !rawData.ldhName) {
            throw new RdapLookupError(domain, 200, 'Malformed RDAP response');
        }
        return standardize(rawData);

    } catch (error: any) {
        if (error instanceof UnsupportedTldError || error instanceof DomainNotFoundError || error instanceof RdapLookupError) {
            throw error;
        }
        if (error.cause) {
            throw new NetworkError(domain, error.message);
        }
        // Unexpected error
        throw new Error(`Unexpected error looking up ${domain}: ${error.message || error}`);
    }
}

// Export a default for convenience (e.g., import whois from '@doping/whois')
export default whois;