import { decryptWithKeyring, deserializeEncryptedPayload, encryptWithKeyring, serializeEncryptedPayload, type Keyring } from "../storage/keyring.ts";

export type ShippingDetails = {
  name: string;
  address: string;
  city: string;
  region: string;
  postalCode: string;
};

export function encryptShippingDetails(
  details: ShippingDetails,
  keyring: Keyring | undefined,
): string {
  const detailsText = JSON.stringify(details);
  const payload = encryptWithKeyring(Buffer.from(detailsText), keyring);
  return serializeEncryptedPayload(payload).toString("utf8");
}

export function decryptShippingDetails(
  serialized: string,
  keyring: Keyring | undefined,
): ShippingDetails {
  
  const payload = deserializeEncryptedPayload(Buffer.from(serialized));
  const plaintext = decryptWithKeyring(payload, keyring).toString();
  
  let details: unknown;
  try {
    details = JSON.parse(plaintext);
  } catch {
    throw new Error("Invalid shipping details");
  }

  if (!isShippingDetails(details)) {
    throw new Error("Invalid shipping details");
  }
  return details;
}

function isShippingDetails(details: unknown): details is ShippingDetails {
  if (!details || typeof details !== "object") {
    return false;
  }

  const candidate = details as Record<string, unknown>;
  return (
    typeof candidate.name === "string" &&
    typeof candidate.address === "string" &&
    typeof candidate.city === "string" &&
    typeof candidate.region === "string" &&
    typeof candidate.postalCode === "string"
  );
}
encryptWithKeyring
decryptWithKeyring
serializeEncryptedPayload
deserializeEncryptedPayload