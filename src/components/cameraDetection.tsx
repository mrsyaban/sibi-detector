"use client";

import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import * as ort from "onnxruntime-web";
import Webcam from "react-webcam"; 

import { Button } from "./ui/button"; 
import useMobile from "@/hooks/useMobile";
import { yoloClasses } from "@/constants/yoloClasses";
import { P } from "./typography";

import { capture, draw_image_and_boxes } from "@/helper/imageHelper";
import { loadModel, runInference } from "@/helper/modelHelper";
import { inferenceYoloV8 } from "@/helper/prediction";


export const FACING_MODE_USER = "user";
export const FACING_MODE_ENVIRONMENT = "environment";

const videoConstraints = {
  facingMode: FACING_MODE_USER,
};

const MODEL_NAME = "model.onnx";

// Define the Camera component
const CameraDetection = () => {
  const isMobile = useMobile();
  const videoRef = useRef<Webcam>(null);
  const [facingMode, setFacingMode] = useState(FACING_MODE_USER);
  const [isCameraOn, setIsCameraOn] = useState<boolean>(false);
  const memorizeFacingMode = useMemo(() => facingMode, [facingMode]);
  const originalSize = useRef<number[]>([0, 0]);
  const [webCamReady, setWebCamReady] = useState(false);

  // model
  const [session, setSession] = useState<ort.InferenceSession | null>(null);
  const loadedRef = useRef(false);
  const videoCanvasRef = useRef<HTMLCanvasElement>(null);
  const [label, setLabel] = useState<string>("");

  // Function to flip the camera
  const flipCamera = useCallback(() => {
    setFacingMode((prevState) => (prevState === FACING_MODE_USER ? FACING_MODE_ENVIRONMENT : FACING_MODE_USER));
  }, []);

  const setWebcamCanvasOverlaySize = () => {
    const element = videoRef.current!.video!;
    if (!element) return;
    var w = element.offsetWidth;
    var h = element.offsetHeight;
    var cv = videoCanvasRef.current;
    if (!cv) return;
    cv.width = w;
    cv.height = h;
  };

  // load models
  useEffect(() => {
    if (!loadedRef.current) {
      loadedRef.current = true;
      toast.promise(loadModel(`./_next/static/chunks/pages/${MODEL_NAME}`), {
        loading: "load AI model...",
        success: (modelData) => {
          setSession(modelData);
          return <b>Model loaded successfully!</b>;
        },
        error: <b>Could not load model.</b>,
      });
    }
  }, [session]);

  // run inference
  useEffect(() => {
    (async () => {
      while (isCameraOn && session && videoRef.current && videoCanvasRef.current && webCamReady) {
        // take a snapshot
        const ctx = capture(facingMode, videoCanvasRef, videoRef);
        if (!ctx) return;

        // run inference
        const [boxes, _inferenceTime] = await inferenceYoloV8(session, ctx);
        console.log("time: ", _inferenceTime);
        // draw boxes and set label
        let boxesToDraw = boxes;
        const only_highest_score = true;
        if (only_highest_score && boxes.length > 0) {
          // Find the box with the highest score
          const highestScoreBox = boxes.reduce((prev, current) => (prev.prob > current.prob ? prev : current));
          boxesToDraw = [highestScoreBox]; // Only draw the box with the highest score
        }
        setLabel(boxesToDraw.length>0 ? yoloClasses[boxesToDraw[0].cls_id] : "");
        draw_image_and_boxes(ctx, boxes);
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      }
    })();
  }, [session, facingMode, isCameraOn, webCamReady]); 

  return (
    <div className="flex-col bg-white gap-8 h-full flex w-full">
      <Toaster />
      <div className="flex flex-col mx-auto lg:flex-row w-full h-full gap-5 lg:gap-7  2xl:gap-20 items-center justify-center">
        {isCameraOn ? (
          <>
            <div className="relative flex items-center w-full lg:h-full lg:w-fit justify-center aspect-[4/3]">
              <Webcam
                mirrored={facingMode === FACING_MODE_USER}
                audio={false}
                ref={videoRef}
                onCanPlay={() => {
                  setWebCamReady(true);
                }}
                forceScreenshotSourceSize={true}
                screenshotFormat="image/jpeg"
                imageSmoothing={true}
                videoConstraints={{
                  ...videoConstraints,
                  width: videoCanvasRef.current?.width,
                  height: videoCanvasRef.current?.height,
                  facingMode: memorizeFacingMode,
                }}
                className="inset-0 rounded-2xl w-full h-full overflow-hidden"
                onLoadedMetadata={() => {
                  setWebcamCanvasOverlaySize();
                  originalSize.current = [
                    videoRef.current!.video!.offsetWidth,
                    videoRef.current!.video!.offsetHeight,
                  ];
                }}
              />
              <canvas id="cv1" ref={videoCanvasRef} className="absolute inset-0 w-full h-full z-10 bg-transparent" />
            </div>
            {/* Result */}
            <div className="bg-black w-full lg:p-4 h-fit py-10 lg:w-[15%] rounded-xl flex self-center">
              <P className="text-white text-center font-bold text-wrap w-full m-auto" level={`${label?'3xl':'xl'}`}>
                {label? label: 'No Hand Detected'}
              </P>
            </div>
          </>
        ) : (
          <div className="flex rounded-2xl w-full lg:w-fit h-fit lg:h-full items-center justify-center aspect-[4/3] bg-gray-200">Camera is off</div>
        )}
      </div>
      {/* On/Off Button */}
      <div className="space-y-5 w-fit px-10 mx-auto flex flex-col">
        <Button onClick={() => setIsCameraOn((prev) => !prev)}>Turn {isCameraOn ? "Off" : "On"} Camera</Button>
        {isMobile && isCameraOn && <Button onClick={flipCamera}>Flip Camera</Button>}
      </div>
    </div>
  );
};

export default CameraDetection;
