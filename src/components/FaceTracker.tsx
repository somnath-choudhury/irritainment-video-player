import React, { useEffect, useRef } from "react";
import * as blazeface from "@tensorflow-models/blazeface";
import "@tensorflow/tfjs";

interface FaceTrackerProps {
  onFaceStatusChange: (isLooking: boolean) => void;
  active: boolean
}

const FaceTracker: React.FC<FaceTrackerProps> = ({ onFaceStatusChange, active }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const modelRef = useRef<blazeface.BlazeFaceModel | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!active)
        return;
    const setupCamera = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        await videoRef.current.play().catch((err) => {
          console.warn("Video play failed", err);
        });
      }
    };

    const loadModel = async () => {
      modelRef.current = await blazeface.load();
    };

    const detectFace = async () => {
      if (!modelRef.current || !videoRef.current) return;

      const predictions = await modelRef.current.estimateFaces(
        videoRef.current,
        false
      );

      if (predictions.length > 0) {
        onFaceStatusChange(true);
      } else {
        onFaceStatusChange(false);
      }
    };

    const startDetection = async () => {
      await setupCamera();
      await loadModel();

      intervalRef.current = setInterval(detectFace, 500);
    };

    startDetection();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      const tracks = videoRef.current?.srcObject as MediaStream;
      tracks?.getTracks().forEach((track) => track.stop());
    };
  }, [active]);

  return (
    <video
      ref={videoRef}
      style={{ display: "none" }}
      muted
      autoPlay
      playsInline
    />
  );
};

export default FaceTracker;
