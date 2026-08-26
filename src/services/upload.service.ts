import api from "./api";

export async function uploadAudio(blob: Blob) {
  const formData = new FormData();
  formData.append("audio", blob, `review.${blob.type.split("/")[1] ?? "webm"}`);
  const { data } = await api.post<{ url: string }>("/uploads/audio", formData);
  return data.url;
}
