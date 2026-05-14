/**
 * Middleware untuk mengkonversi form-data requests ke JSON
 * Memungkinkan endpoint untuk menerima baik JSON maupun form-data dengan file uploads
 */

import { fileToDataUrl, isFormDataRequest, parseFormDataFromRequest } from "../utils/form-data-parser";

export async function formDataToJsonMiddleware(request: Request): Promise<Request | null> {
    const url = new URL(request.url);
    const pathLower = url.pathname.toLowerCase();

    const supportedEndpoints = [
        "/admin/tryouts/subtes",
        "/soal",
        "/admin/tryouts/soal",
        "/admin/tryouts/pilihan",
    ];

    const isSupportedEndpoint = supportedEndpoints.some((endpoint) => pathLower.includes(endpoint));

    if (!isSupportedEndpoint || !isFormDataRequest(request)) {
        return null;
    }

    if (request.method !== "POST" && request.method !== "PUT") {
        return null;
    }

    try {
        const { fields, files } = await parseFormDataFromRequest(request);
        const convertedFields: Record<string, unknown> = { ...fields };

        if (fields.isBenar !== undefined) {
            convertedFields.isBenar = fields.isBenar === "true";
        }

        const numericFields = ["poin", "jumlahSoal", "durasiMenit", "urutan", "nilaiMinimum", "page", "limit"];
        for (const field of numericFields) {
            if (fields[field] !== undefined && fields[field] !== "") {
                convertedFields[field] = parseFloat(fields[field]);
            }
        }

        const integerFields = ["jumlahSoal", "durasiMenit", "urutan", "page", "limit"];
        for (const field of integerFields) {
            if (convertedFields[field] !== undefined) {
                convertedFields[field] = parseInt(String(convertedFields[field]), 10);
            }
        }

        if (files.gambarUrl) {
            convertedFields.gambarUrl = await fileToDataUrl(files.gambarUrl);
        }
        if (files.pembahasanGambar) {
            convertedFields.pembahasanGambar = await fileToDataUrl(files.pembahasanGambar);
        }

        const jsonBody = JSON.stringify(convertedFields);
        return new Request(request.url, {
            method: request.method,
            headers: {
                ...Object.fromEntries(request.headers),
                "content-type": "application/json",
            },
            body: jsonBody,
        });
    } catch (error) {
        console.error("Error converting form-data to JSON:", error);
        return null;
    }
}

