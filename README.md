# @doping/whois

[![npm version](https://badge.fury.io/js/@doping/whois.svg)](https://badge.fury.io/js/@doping/whois)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern, fast, and lightweight WHOIS/RDAP client for Node.js.

`whois` queries domain information using the modern **RDAP (Registration Data Access Protocol)**, the official successor to the legacy WHOIS protocol. It automatically finds the correct authoritative server for any given TLD based on IANA's official list and returns a clean, standardized JSON object.

## Features

- **Modern Protocol:** Uses JSON-based RDAP, not legacy text-based WHOIS.
- **Authoritative Servers:** Automatically finds the correct RDAP server for over 1200+ TLDs.
- **Standardized Output:** Returns a consistent, predictable object structure for all lookups.
- **Lightweight:** Zero runtime dependencies. Uses native Node.js `fetch`.
- **URL & Domain Parsing:** Accepts a full URL and automatically extracts the domain.
- **TypeScript Ready:** Fully written in TypeScript with type definitions included.

## Installation

```bash
npm install @doping/whois
```

Requires Node.js v18.0.0 or higher.

## Usage

```javascript
import whois from "@doping/whois";

async function getDomainInfo() {
  try {
    const data = await whois("google.com");
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(error);
  }
}

getDomainInfo();
```

### Example Output

A successful lookup for `google.com` will return an object like this:

```json
{
  "domainName": "google.com",
  "createdAt": "1997-09-15T04:00:00Z",
  "updatedAt": "2019-09-09T15:39:04Z",
  "expiresAt": "2028-09-14T04:00:00Z",
  "registrar": {
    "name": "MarkMonitor Inc.",
    "ianaId": "292"
  },
  "registrant": {
    "organization": "Google LLC"
  },
  "nameservers": [
    "ns1.google.com",
    "ns2.google.com",
    "ns3.google.com",
    "ns4.google.com"
  ],
  "status": [
    "client delete prohibited",
    "client transfer prohibited",
    "client update prohibited",
    "server delete prohibited",
    "server transfer prohibited",
    "server update prohibited"
  ],
  "raw": {
    "...": "The full, raw RDAP response from the server"
  }
}
```

## More Usage Examples

### Error Handling

```javascript
import whois from "@doping/whois";

async function safeLookup(domain) {
  try {
    const data = await whois(domain);
    console.log("Domain info:", data);
  } catch (err) {
    if (err.message.includes("Unsupported TLD")) {
      console.error("This TLD is not supported.");
    } else if (err.message.includes("Domain not found")) {
      console.error("Domain does not exist.");
    } else {
      console.error("Unexpected error:", err);
    }
  }
}

safeLookup("example.com");
safeLookup("invalid.tld");
```

### Using with Promise.then

```javascript
import whois from "@doping/whois";

whois("github.com")
  .then((data) => {
    console.log("Got data:", data);
  })
  .catch((err) => {
    console.error("Error:", err);
  });
```

### Using in Parallel (Promise.all)

```javascript
import whois from "@doping/whois";

const domains = ["google.com", "npmjs.com", "github.com"];
Promise.all(domains.map(whois))
  .then((results) => {
    results.forEach((data) => console.log(data.domainName, data));
  })
  .catch((err) => {
    console.error("One of the lookups failed:", err);
  });
```

---

## CLI Usage

You can also use the CLI:

```sh
npx whois google.com
```

---

## Updating the TLD/RDAP Data

The list of TLDs and their authoritative RDAP servers is based on the official IANA bootstrap file. To update this data (for example, when new TLDs are added):

1. Run the update script:

   ```bash
   node scripts/tlds.mjs
   ```

2. This will fetch the latest RDAP bootstrap from IANA and update `src/data/dns.json`.

3. Commit the updated file to keep your package up to date.

---

## TypeScript Types

The main lookup function returns a strongly-typed object. Here are the types:

```typescript
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
```

## API

### `whois(domainOrUrl: string): Promise<WhoisData>`

Looks up domain information.

- **`domainOrUrl`**: The string to look up. Can be a simple domain (`github.com`) or a full URL (`https://www.`).
- **Returns**: A `Promise` that resolves to a `WhoisData` object.
- **Throws**: An `Error` if the TLD is unsupported, the domain is not found (404), or a network error occurs.

## License

[MIT](LICENSE)
