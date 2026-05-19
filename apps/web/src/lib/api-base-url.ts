export function getApiBaseUrl() {

  console.log("API Base URL:", {
    VITE_API_URL: process.env.VITE_API_URL,
    VITE_SERVER_URL: process.env.VITE_SERVER_URL,
    NODE_ENV: process.env.NODE_ENV,
   
  });
  return (
    process.env.VITE_API_URL ??
    import.meta.env.VITE_API_URL ??
    process.env.VITE_SERVER_URL ??
    import.meta.env.VITE_SERVER_URL ?? 
    (process.env.NODE_ENV === "production" ? "https://api.habitutor.id" : "http://localhost:3001")
  );
}
