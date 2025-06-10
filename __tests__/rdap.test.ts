import { getRdapServerForTld, customServers } from '../src/rdap.js';

describe('getRdapServerForTld', () => {
  it('returns the correct RDAP server for a known TLD from IANA data', () => {
    // .com is in the IANA data
    expect(getRdapServerForTld('com')).toMatch(/rdap/);
  });

  it('returns the correct RDAP server for a known TLD from customServers', () => {
    expect(getRdapServerForTld('de')).toBe(customServers['de']);
  });

  it('returns null for an unknown TLD', () => {
    expect(getRdapServerForTld('unknown')).toBeNull();
  });

  it('is case-insensitive', () => {
    expect(getRdapServerForTld('COM')).toBe(getRdapServerForTld('com'));
    expect(getRdapServerForTld('De')).toBe(getRdapServerForTld('de'));
  });
}); 