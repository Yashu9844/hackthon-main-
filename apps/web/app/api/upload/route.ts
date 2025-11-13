import { NextResponse } from "next/server";

// This is the route that will be called when the user uploads a file
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert the file to a buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Create a new FormData instance
    const pinataFormData = new FormData();
    pinataFormData.append("file", new Blob([buffer]), file.name);

    // Add metadata if needed
    const metadata = JSON.stringify({
      name: file.name,
    });
    pinataFormData.append("pinataMetadata", metadata);

    // Pin to IPFS using Pinata
    const pinataResponse = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PINATA_JWT || process.env.PINATA_API_KEY}`,
        },
        body: pinataFormData,
      }
    );

    const result = await pinataResponse.json();

    if (!pinataResponse.ok) {
      console.error("Pinata error:", result);
      throw new Error("Failed to upload file to Pinata");
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

// Add CORS headers for preflight requests
export async function OPTIONS() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
