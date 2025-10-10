// IPFS upload helpers with selectable backend (Mock or Pinata)
// - Set VITE_USE_MOCK_IPFS="true" to force mock in dev
// - Provide VITE_PINATA_JWT for real uploads via Pinata

const useMock = import.meta.env.VITE_USE_MOCK_IPFS === 'true';
console.log(`[IPFS] Backend selected: ${useMock ? 'Mock (dev)' : 'Pinata (real)'}`);

// --- Real (Pinata) implementation ---
const PINATA_UPLOAD_ENDPOINT = "https://api.pinata.cloud/pinning/pinFileToIPFS";
const PINATA_JSON_ENDPOINT = "https://api.pinata.cloud/pinning/pinJSONToIPFS";

function getPinataJWT() {
  const jwt = import.meta.env.VITE_PINATA_JWT;
  if (!jwt) throw new Error("Missing VITE_PINATA_JWT env var");
  return jwt;
}

async function pinataUploadFile(file) {
  console.log("⬆️ Pinata: uploading file:", file?.name || "asset");
  const form = new FormData();
  form.append("file", file);
  // optional metadata
  form.append("pinataMetadata", JSON.stringify({ name: file?.name || "asset" }));

  const res = await fetch(PINATA_UPLOAD_ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${getPinataJWT()}` },
    body: form
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Pinata upload failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  // { IpfsHash: "Qm..." }
  return data?.IpfsHash;
}

async function pinataUploadJSON(obj) {
  console.log("⬆️ Pinata: uploading JSON metadata");
  const res = await fetch(PINATA_JSON_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getPinataJWT()}`
    },
    body: JSON.stringify({
      pinataContent: obj,
      pinataMetadata: { name: "NFT Metadata" }
    })
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Pinata JSON upload failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  return data?.IpfsHash;
}

// Generate a realistic-looking IPFS hash
function generateMockIPFSHash() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let hash = 'Qm';
  for (let i = 0; i < 44; i++) {
    hash += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return hash;
}

// Mock file upload that creates a data URL
async function mockUploadFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Store the file data in localStorage with a mock IPFS hash
      const hash = generateMockIPFSHash();
      localStorage.setItem(`ipfs_${hash}`, reader.result);
      console.log(`Mock IPFS: Stored file as ${hash}`);
      resolve(hash);
    };
    reader.readAsDataURL(file);
  });
}

// Mock JSON upload
async function mockUploadJSON(obj) {
  const hash = generateMockIPFSHash();
  localStorage.setItem(`ipfs_${hash}`, JSON.stringify(obj, null, 2));
  console.log(`Mock IPFS: Stored JSON as ${hash}`);
  return hash;
}

export async function uploadFileToIPFS(file) {
  try {
    if (!useMock) {
      return await pinataUploadFile(file);
    }
  console.log("🔥 Mock IPFS: Uploading file:", file.name);
    await new Promise(resolve => setTimeout(resolve, 300));
    const hash = await mockUploadFile(file);
    console.log("✅ Mock IPFS: File uploaded successfully!", hash);
    return hash;
  } catch (err) {
    console.error("IPFS upload error:", err);
    throw new Error(`Network error during image upload: ${err?.message || err}`);
  }
}

export async function uploadJSONToIPFS(obj) {
  try {
    if (!useMock) {
      return await pinataUploadJSON(obj);
    }
  console.log("🔥 Mock IPFS: Uploading JSON metadata");
    await new Promise(resolve => setTimeout(resolve, 150));
    const hash = await mockUploadJSON(obj);
    console.log("✅ Mock IPFS: JSON uploaded successfully!", hash);
    return hash;
  } catch (err) {
    console.error("IPFS JSON upload error:", err);
    throw new Error(`Network error during metadata upload: ${err?.message || err}`);
  }
}

// Convenience: upload image, then JSON metadata that references it
export async function uploadImageAndMetadata({ file, name, description }) {
  if (!file) throw new Error("No image file provided");
  if (!name) throw new Error("Name is required");

  console.log(`🚀 Starting IPFS upload process... (${useMock ? 'Mock' : 'Pinata'})`);

  const imageCid = await uploadFileToIPFS(file);
  const imageUri = `ipfs://${imageCid}`;

  const metadata = {
    name,
    description: description || "",
    image: imageUri,
    attributes: [
      { trait_type: "Created", value: new Date().toISOString() },
      { trait_type: "Platform", value: "Blaze Marketplace" }
    ]
  };

  const metadataCid = await uploadJSONToIPFS(metadata);
  const metadataUri = `ipfs://${metadataCid}`;

  console.log("🎉 IPFS upload complete!");
  console.log("📁 Image URI:", imageUri);
  console.log("📄 Metadata URI:", metadataUri);

  return { imageCid, imageUri, metadataCid, metadataUri };
}

// Helper function to retrieve mock IPFS data (for testing)
export function getMockIPFSData(hash) {
  return localStorage.getItem(`ipfs_${hash}`);
}