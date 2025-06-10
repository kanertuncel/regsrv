import dnsData from './data/dns.json' with { type: "json" };

export const customServers: Record<string, string> = {
    "de": "https://rdap.denic.de/",
    "fr": "https://rdap.nic.fr/",
    "es": "https://rdap.nic.es/",
    "uk": "https://rdap.nominet.uk/",
    "nl": "https://rdap.nl/",
    "be": "https://rdap.be/",
    "it": "https://rdap.nic.it/",
    "se": "https://rdap.nic.se/",
    "no": "https://rdap.no/",
    "dk": "https://rdap.dk/",
    "at": "https://rdap.nic.at/",
    "ch": "https://rdap.nic.ch/",
    "pl": "https://rdap.dns.pl/",
    "pt": "https://rdap.dns.pt/",
    "ro": "https://rdap.nic.ro/",
    "ru": "https://rdap.ripn.ru/",
    "sa": "https://rdap.nic.sa/",
    "ae": "https://rdap.ae/",
    "ar": "https://rdap.aridns.com.ar/",
    "au": "https://rdap.ausregistry.com.au/",
    "br": "https://rdap.registro.br/",
    "ca": "https://rdap.ca/",
    "cl": "https://rdap.nic.cl/",
    "cn": "https://rdap.apnic.net/",
    "co": "https://rdap.nic.co/",
    "cr": "https://rdap.nic.cr/",
    "cy": "https://rdap.nic.cy/",
    "cz": "https://rdap.nic.cz/",
    "ee": "https://rdap.ee/",
    "fi": "https://rdap.fi/",
    "gr": "https://rdap.g-nic.gr/",
    "hk": "https://rdap.hknic.net/",
    "hu": "https://rdap.nic.hu/",
    "id": "https://rdap.id/",
    "ie": "https://rdap.domainregistry.ie/",
    "il": "https://rdap.isoc.org.il/",
    "jp": "https://rdap.jprs.jp/",
    "eu": "https://rdap.eurid.eu/",
    "li": "https://rdap.nic.ch/",
    "kr": "https://rdap.kr/"
};

// Pre-process the IANA data into a fast lookup map
const tldToServerMap = new Map<string, string>();

(function buildTldMap() {
    if (dnsData && Array.isArray(dnsData.services)) {
        for (const service of dnsData.services) {
            const [tlds, urls] = service;
            if (Array.isArray(tlds) && Array.isArray(urls)) {
                // Use the first RDAP URL, assuming it's the primary one
                const serverUrl = urls[0];
                if (serverUrl) {
                    for (const tld of tlds) {
                        tldToServerMap.set(tld.toLowerCase(), serverUrl);
                    }
                }
            }
        }
    }
})();

/**
 * Finds the authoritative RDAP server URL for a given TLD.
 * @param tld The top-level domain (e.g., "com", "org").
 * @returns The base URL for the RDAP server, or null if not found.
 */
export function getRdapServerForTld(tld: string): string | null {
    return tldToServerMap.get(tld.toLowerCase()) || customServers[tld.toLowerCase()] || null;
}