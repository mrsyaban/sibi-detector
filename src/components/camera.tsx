import Webcam from "react-webcam"; // Import the react-webcam component
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "./ui/button";
import { P } from "./typography";
import useMobile from "@/hooks/useMobile";

const FACING_MODE_USER = "user";
const FACING_MODE_ENVIRONMENT = "environment";

const videoConstraints = {
  facingMode: FACING_MODE_USER,
};

// Define the Camera component
const Camera = () => {
  const videoRef = useRef<Webcam>(null);
  const [countdown, setCountdown] = useState<number>(10);
  const [isLoading] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState(FACING_MODE_USER);
  const [isCameraOn, setIsCameraOn] = useState<boolean>(false);

  const memorizeFacingMode = useMemo(() => facingMode, [facingMode]);

  // Function to flip the camera
  const flipCamera = useCallback(() => {
    setFacingMode((prevState) =>
      prevState === FACING_MODE_USER
        ? FACING_MODE_ENVIRONMENT
        : FACING_MODE_USER
    );
  }, []);

  // Function to capture image from the camera
  //   const captureImage = async () => {
  //     setIsLoading(false);
  //   };

  // useEffect hook to handle camera initialization and countdown
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isLoading && isCameraOn) {
        setCountdown((prevCountdown) =>
          prevCountdown > 0 ? prevCountdown - 1 : 10
        );

        if (countdown === 0) {
          //   captureImage();
          setCountdown(10); // Reset countdown to 10 after it reaches 0
        }
      }
    }, 1000); // Update countdown every second

    return () => {
      clearInterval(interval);
    };
  }, [isLoading, facingMode, countdown, isCameraOn]);

  const isMobile = useMobile();

  return (
    <div className="flex flex-col lg:flex-row gap-5 lg:gap-7 2xl:gap-20 items-center justify-center">
      {isCameraOn ? (
        <Webcam
          audio={false}
          ref={videoRef}
          videoConstraints={{
            ...videoConstraints,
            facingMode: memorizeFacingMode,
          }}
          screenshotFormat="image/png"
          className="max-sm:w-[98%] max-sm:max-h-[300px] sm:h-[300px] md:h-[400px] 2xl:h-[500px] rounded-2xl overflow-hidden"
        />
      ) : (
        <div className="max-sm:w-[98%] max-sm:max-h-[300px] sm:h-[300px] md:h-[400px] 2xl:h-[500px]  rounded-2xl overflow-hidden aspect-[4/3] flex items-center justify-center bg-gray-200">
          Camera is off
        </div>
      )}
      <div className="space-y-5 flex flex-col">
        <Button onClick={() => setIsCameraOn((prev) => !prev)}>
          Turn {isCameraOn ? "Off" : "On"} Camera
        </Button>
        {isMobile && isCameraOn && (
          <Button onClick={flipCamera}>Flip Camera</Button>
        )}
        <P className="text-center">{countdown} second</P>
      </div>
    </div>
  );
};

export default Camera;
