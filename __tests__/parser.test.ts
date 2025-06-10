import { parseDomain, standardize } from '../src/parser.js';

describe('parseDomain', () => {
  it('parses a plain domain', () => {
    expect(parseDomain('google.com')).toBe('google.com');
  });

  it('parses a URL with www', () => {
    expect(parseDomain('https://www.google.com/search')).toBe('google.com');
  });

  it('parses a URL without www', () => {
    expect(parseDomain('https://sub.example.org')).toBe('sub.example.org');
  });

  it('removes protocol and path from domain string', () => {
    expect(parseDomain('http://test.net/path')).toBe('test.net');
  });
});


describe('standardize', () => {
  it('standardizes a minimal RDAP response', () => {
    const rdap = {
      ldhName: 'example.com',
      events: [
        { eventAction: 'registration', eventDate: '2020-01-01T00:00:00Z' },
        { eventAction: 'expiration', eventDate: '2025-01-01T00:00:00Z' }
      ],
      entities: [
        {
          roles: ['registrar'],
          vcardArray: [
            'vcard',
            [
              ['fn', {}, 'text', 'Registrar Name'],
              ['org', {}, 'text', 'Registrar Org']
            ]
          ],
          publicIds: [
            { type: 'IANA Registrar ID', identifier: '123' }
          ],
          links: [
            { rel: 'self', href: 'https://registrar.example.com' }
          ]
        },
        {
          roles: ['registrant'],
          vcardArray: [
            'vcard',
            [
              ['fn', {}, 'text', 'Registrant Name'],
              ['org', {}, 'text', 'Registrant Org'],
              ['email', {}, 'text', 'user@example.com']
            ]
          ]
        }
      ],
      nameservers: [
        { ldhName: 'ns1.example.com' },
        { ldhName: 'ns2.example.com' }
      ],
      status: ['active']
    };
    const result = standardize(rdap);
    expect(result.domainName).toBe('example.com');
    expect(result.createdAt).toBe('2020-01-01T00:00:00Z');
    expect(result.expiresAt).toBe('2025-01-01T00:00:00Z');
    expect(result.registrar.name).toBe('Registrar Org');
    expect(result.registrar.ianaId).toBe('123');
    expect(result.registrar.url).toBe('https://registrar.example.com');
    expect(result.registrant?.name).toBe('Registrant Name');
    expect(result.registrant?.organization).toBe('Registrant Org');
    expect(result.registrant?.email).toBe('user@example.com');
    expect(result.nameservers).toEqual(['ns1.example.com', 'ns2.example.com']);
    expect(result.status).toEqual(['active']);
    expect(result.raw).toBe(rdap);
  });
}); 