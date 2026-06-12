export async function uploadImageToBunny(file) {
  const base64 = await fileToBase64(file);

  const res = await fetch("ТВОЙ_URL_ФУНКЦИИ", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type,
      base64Data: base64,
    }),
  });

  const data = await res.json();

  return data.url;
}