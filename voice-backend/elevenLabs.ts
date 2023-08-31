import fetch from "node-fetch";

const ELEVEN_LABS_VOICE_ID = "YOUR_VOICE_ID";
const ELEVEN_LABS_API_KEY = "YOUR_ELEVEN_LABS_API_KEY";

export async function getElevenLabsAudio(text: string): Promise<ArrayBuffer> {
  const elevenLabsTextToSpeechURL = `https://api.elevenlabs.io/v1/text-to-speech/${ELEVEN_LABS_VOICE_ID}/stream?optimize_streaming_latency=1`;
  const headers = {
    accept: "audio/mpeg",
    "xi-api-key": ELEVEN_LABS_API_KEY,
    "Content-Type": "application/json",
  };
  const response = await fetch(elevenLabsTextToSpeechURL, {
    method: "POST",
    headers: headers,
    body: JSON.stringify({
      text,
    }),
  });
  return response.arrayBuffer();
}
