import { jest } from '@jest/globals';
import whois from '../src/index.js';

// @ts-expect-error: allow mocking fetch for tests
global.fetch = jest.fn();

describe('regsrv', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('throws for invalid domain', async () => {
    await expect(whois('not a domain')).rejects.toThrow('Invalid domain or URL provided.');
  });

  it('throws for unsupported TLD', async () => {
    await expect(whois('example.unknown')).rejects.toThrow('Unsupported TLD: .unknown. No RDAP server found.');
  });

  it('returns standardized data for a valid domain', async () => {
    // @ts-expect-error: fetch is mocked for tests
    (fetch as unknown as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ldhName: 'example.com',
        events: [
          { eventAction: 'registration', eventDate: '2020-01-01T00:00:00Z' },
          { eventAction: 'expiration', eventDate: '2025-01-01T00:00:00Z' }
        ],
        entities: [],
        nameservers: [],
        status: []
      })
    });
    const data = await whois('example.com');
    expect(data.domainName).toBe('example.com');
    expect(data.createdAt).toBe('2020-01-01T00:00:00Z');
    expect(data.expiresAt).toBe('2025-01-01T00:00:00Z');
  });

  it('throws for 404 response', async () => {
    // @ts-expect-error: fetch is mocked for tests
    (fetch as unknown as jest.Mock).mockResolvedValueOnce({ ok: false, status: 404, statusText: 'Not Found' });
    await expect(whois('notfound.com')).rejects.toThrow('Domain not found: notfound.com');
  });

  it('throws for other HTTP errors', async () => {
    // @ts-expect-error: fetch is mocked for tests
    (fetch as unknown as jest.Mock).mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Internal Server Error' });
    await expect(whois('error.com')).rejects.toThrow('RDAP lookup failed for error.com: 500 Internal Server Error');
  });
}); 