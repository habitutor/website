export function isFormDataRequest(request: Request): boolean {
    const contentType = request.headers.get("content-type") ?? "";
    return contentType.toLowerCase().includes("multipart/form-data");
}

export async function parseFormDataFromRequest(request: Request): Promise<{
    fields: Record<string, string>;
    files: Record<string, File>;
}> {
    const formData = await request.formData();
    const fields: Record<string, string> = {};
    const files: Record<string, File> = {};

    for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
            if (value.size > 0) {
                files[key] = value;
            }
            continue;
        }

        fields[key] = String(value);
    }

    return { fields, files };
}

export async function fileToDataUrl(file: File): Promise<string> {
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    const mimeType = file.type || "application/octet-stream";
    return `data:${mimeType};base64,${base64}`;
}

