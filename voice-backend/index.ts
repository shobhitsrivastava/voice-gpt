import http from "http";

import { Server, Socket } from "socket.io";
import { getDeepgramLiveConnection } from "./deepgram";
import { getOpenAIChatCompletion } from "./openai";
import { getElevenLabsAudio } from "./elevenLabs";

const server = http.createServer();

const socketIOServer = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

let clientSocket: Socket;

socketIOServer.on("connection", (socket) => {
  console.log("socket: client connected");
  clientSocket = socket;

  socket.on("packet-sent", (data) => {
    const readyState = deepgramLive.getReadyState();
    if (readyState === 1) {
      deepgramLive.send(data);
    } else {
      console.log(
        `socket: data couldn't be sent to deepgram. readyState was ${readyState}`
      );
    }
  });

  socket.on("disconnect", () => {
    console.log("socket: client disconnected");
  });
});

server.listen(4000, () => {
  console.log("server listening on port 4000");
});

const deepgramLive = getDeepgramLiveConnection(async (data: string) => {
  const transcriptData = JSON.parse(data);
  if (transcriptData.type !== "Results") {
    return;
  }
  const transcript = transcriptData.channel.alternatives[0].transcript ?? "";
  if (transcript) {
    console.log(`transcript received: "${transcript}"`);
    const openAIResponse = await getOpenAIChatCompletion(transcript);
    console.log(`openAIResponse: ${openAIResponse}`);
    const elevenLabsAudio = await getElevenLabsAudio(openAIResponse);
    if (clientSocket) {
      clientSocket.emit("audioData", elevenLabsAudio);
      console.log("sent audio data to frontend.");
    }
  }
});
