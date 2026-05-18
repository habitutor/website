function isFormDataRequest(request: Request): boolean {
  const contentType = request.headers.get("content-type") ?? "";
  return contentType.toLowerCase().includes("multipart/form-data");
}

async function parseFormDataFromRequest(request: Request): Promise<{
  fields: Record<string, string>;
  files: Record<string, File>;
}> {
  const formData = await request.formData();
  const fields: Record<string, string> = {};
  const files: Record<string, File> = {};

  for (const [key, value] of formData.entries()) {
    const val = value as unknown;
    if (val instanceof File) {
      if (val.size > 0) {
        files[key] = val;
      }
      continue;
    }

    fields[key] = String(value);
  }

  return { fields, files };
}

async function fileToDataUrl(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");
  const mimeType = file.type || "application/octet-stream";
  return `data:${mimeType};base64,${base64}`;
}

export async function formDataToJsonMiddleware(request: Request): Promise<Request | null> {
  const url = new URL(request.url);
  const pathLower = url.pathname.toLowerCase();

  const supportedEndpoints = ["/admin/tryouts/subtes", "/soal", "/admin/tryouts/soal", "/admin/tryouts/pilihan"];

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
    const headersObj: Record<string, string> = {};
    request.headers.forEach((v, k) => {
      headersObj[k] = v;
    });

    return new Request(request.url, {
      method: request.method,
      headers: {
        ...headersObj,
        "content-type": "application/json",
      },
      body: jsonBody,
    });
  } catch (error) {
    console.error("Error converting form-data to JSON:", error);
    return null;
  }
}
