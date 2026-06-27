import jwt from "jsonwebtoken";

interface FirebasePublicKeyMap {
  [key: string]: string;
}

let cachedKeys: FirebasePublicKeyMap = {};
let keysExpiresAt = 0;

async function getFirebasePublicKeys(): Promise<FirebasePublicKeyMap> {
  if (Date.now() < keysExpiresAt) {
    return cachedKeys;
  }

  const response = await fetch(
    "https://www.googleapis.com/robot/v1/metadata/x509/securetoken-system@system.gserviceaccount.com"
  );
  if (!response.ok) {
    throw new Error("Failed to fetch Firebase public certificates");
  }

  // Parse Cache-Control to get max-age
  const cacheControl = response.headers.get("cache-control") || "";
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
  const maxAgeSeconds = maxAgeMatch && maxAgeMatch[1] ? parseInt(maxAgeMatch[1], 10) : 3600;

  cachedKeys = (await response.json()) as FirebasePublicKeyMap;
  keysExpiresAt = Date.now() + maxAgeSeconds * 1000;
  return cachedKeys;
}

export interface DecodedFirebaseToken {
  sub: string; // Firebase UID
  phone_number?: string;
  phone?: string;
  [key: string]: any;
}

export async function verifyFirebaseIdToken(
  token: string,
  projectId: string
): Promise<DecodedFirebaseToken> {
  const decodedHeader = jwt.decode(token, { complete: true });
  if (!decodedHeader || typeof decodedHeader === "string") {
    throw new Error("Invalid token format");
  }

  const kid = decodedHeader.header.kid;
  if (!kid) {
    throw new Error("Missing key ID (kid) in token header");
  }

  const keys = await getFirebasePublicKeys();
  const certificate = keys[kid];
  if (!certificate) {
    throw new Error("Public key certificate not found for matching kid");
  }

  // Cryptographically verify RS256 signature
  const payload = jwt.verify(token, certificate, {
    audience: projectId,
    issuer: `https://securetoken.google.com/${projectId}`,
    algorithms: ["RS256"],
  }) as DecodedFirebaseToken;

  return payload;
}
