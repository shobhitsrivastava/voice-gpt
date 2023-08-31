"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import styles from "./page.module.css";

export default function Home() {
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [isRecording, setIsRecording] = useState(true);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      setMediaRecorder(new MediaRecorder(stream));
    });
  }, []); // Setup mediaRecorder initially

  useEffect(() => {
    if (mediaRecorder) {
      const socket = io("ws://localhost:4000");

      socket.on("connect", async () => {
        console.log("client connected to websocket");
        mediaRecorder.addEventListener("dataavailable", (event) => {
          if (event.data.size > 0) {
            socket.emit("packet-sent", event.data);
          }
        });
        mediaRecorder.start(500);
      });

      socket.on("audioData", (arrayBuffer: ArrayBuffer) => {
        setIsRecording(false);
        const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
        const audioUrl = URL.createObjectURL(blob);

        const audioElement = new Audio(audioUrl);
        audioElement.onended = () => setIsRecording(true);
        audioElement.play();
      });

      return () => {
        socket.disconnect(); // Clean up the socket connection on component unmount
      };
    }
  }, [mediaRecorder]);

  useEffect(() => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      if (isRecording) {
        mediaRecorder.resume();
      } else {
        mediaRecorder.pause();
      }
    }
  }, [isRecording, mediaRecorder]);

  return (
    <>
      <div className={styles.title}>VoiceGPT - your voice AI assistant</div>
      <div className={styles["center-vertical"]}>
        <div
          className={`${styles["speaker-indicator"]} ${
            styles["you-speaking"]
          } ${isRecording ? styles.pulsate : ""}`}
        ></div>
        <br />
        <div>{isRecording ? "Listening..." : "Speaking..."}</div>
        <br />
        <div
          className={`${styles["speaker-indicator"]} ${
            styles["machine-speaking"]
          } ${!isRecording ? styles.pulsate : ""}`}
        ></div>
      </div>
    </>
  );
}
