import { useEffect, useState } from "react";
import "./App.css";
import FaceTracker from "./components/FaceTracker";

function App() {
  const [isLooking, setIsLooking] = useState(false);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);
  const [enforceFaceDetection, setEnforceFaceDetection] = useState(false);
  const [freePlayCountdown, setFreePlayCountdown] = useState<number | null>(
    null
  );

  const FREE_PLAY_DURATION = 30; // seconds
  const DETECTION_DURATION = 60; // seconds

  // Face status change handler
  const handleFaceStatusChange = (looking: boolean) => {
    setIsLooking(looking);
    if (videoRef && enforceFaceDetection) {
      if (looking) {
        videoRef.pause();
      } else {
        videoRef.play().catch(() => {});
      }
    }
  };

  // Cycle free play and detection mode
  useEffect(() => {
    let isMounted = true;
    let countdownInterval: NodeJS.Timeout;

    const startFreePlayPhase = () => {
      setEnforceFaceDetection(false);
      setFreePlayCountdown(FREE_PLAY_DURATION);

      if (videoRef) {
        videoRef.play().catch((err) => {
          console.warn("Autoplay blocked:", err);
        });
      }

      countdownInterval = setInterval(() => {
        setFreePlayCountdown((prev) => {
          if (prev !== null) {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              startDetectionPhase();
              return null;
            }
            return prev - 1;
          }
          return null;
        });
      }, 1000);
    };

    const startDetectionPhase = () => {
      setEnforceFaceDetection(true);
      setTimeout(() => {
        if (isMounted) startFreePlayPhase();
      }, DETECTION_DURATION * 1000);
    };

    startFreePlayPhase(); // Start with free play

    return () => {
      isMounted = false;
      clearInterval(countdownInterval);
    };
  }, []);

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('bg-grass-sky.png')" }}
    >
      <div className="items-center justify-center flex flex-col p-4 gap-4">
        <p className="text-5xl font-semibold text-yellow-400">
          Welcome to Irritainment Folks !!
        </p>
        <p className="text-orange-400 font-semibold text-3xl">
          A place to <span className="underline">cure</span> your screen
          addiction... or make it worse. Who knows? 😏
        </p>
        <p className="font-semibold text-xl text-red-600">
          Go out! <span className="text-3xl text-red-800 font-bold">GET</span> a
          life man!!!
        </p>

        {/* <FaceTracker
          onFaceStatusChange={handleFaceStatusChange}
          active={enforceFaceDetection}
        /> */}

        <video
          className="mt-4"
          ref={(ref) => setVideoRef(ref)}
          src="test-video.mp4"
          width={700}
          controls
          muted
        />

        {/* Status Message */}
        <p
          className={`mt-4 text-xl font-semibold ${
            isLooking && enforceFaceDetection
              ? "text-red-600"
              : "text-green-700"
          }`}
        >
          {enforceFaceDetection
            ? isLooking
              ? "👀 Face detection active: Don't you dare look!"
              : "🙈 Looking away: Playing!"
            : "😎 Free Play Mode: Enjoy it while it lasts!"}
        </p>

        {/* Countdown Timer */}
        {!enforceFaceDetection && freePlayCountdown !== null && (
          <p className="text-lg text-white font-mono bg-black/50 px-4 py-2 rounded-lg">
            ⏳ Free play ends in: {freePlayCountdown} second
            {freePlayCountdown !== 1 && "s"}
          </p>
        )}
      </div>
    </div>
  );
}

export default App;

