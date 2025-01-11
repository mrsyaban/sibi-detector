import { yoloClasses } from "@/constants/yoloClasses";
import { DetectedObject } from "@/types/general";
import ndarray from "ndarray";
import ops from "ndarray-ops";
import * as ort from "onnxruntime-web";
import { round } from "lodash";
import { RefObject } from "react";
import { FACING_MODE_USER } from "@/components/cameraDetection";
import Webcam from "react-webcam";


export const capture = (facingMode:string, videoCanvasRef: RefObject<HTMLCanvasElement>, videoRef: RefObject<Webcam>) => {
    const canvas = videoCanvasRef.current!;
    const context = canvas.getContext("2d", {
      willReadFrequently: true,
    })!;

    if (facingMode === FACING_MODE_USER) {
      context.setTransform(-1, 0, 0, 1, canvas.width, 0);
    }

    context.drawImage(
      videoRef.current!.video!,
      0,
      0,
      canvas.width,
      canvas.height
    );

    if (facingMode === FACING_MODE_USER) {
      context.setTransform(1, 0, 0, 1, 0, 0);
    }
    return context;
  };

const resizeCanvasCtx = (ctx: CanvasRenderingContext2D, targetWidth: number, targetHeight: number, inPlace = false) => {
  let canvas: HTMLCanvasElement;

  if (inPlace) {
    // Get the canvas element that the context is associated with
    canvas = ctx.canvas;

    // Set the canvas dimensions to the target width and height
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // Scale the context to the new dimensions
    ctx.scale(targetWidth / canvas.clientWidth, targetHeight / canvas.clientHeight);
  } else {
    // Create a new canvas element with the target dimensions
    canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // Draw the source canvas into the target canvas
    canvas.getContext("2d")!.drawImage(ctx.canvas, 0, 0, targetWidth, targetHeight);

    // Get a new rendering context for the new canvas
    ctx = canvas.getContext("2d")!;
  }

  return ctx;
};

export const imageToTensor = (ctx: CanvasRenderingContext2D, dims: number[] = [1, 3, 640, 640]) => {
  // 1. Resize the image to the target dimensions
  const resizedCtx = resizeCanvasCtx(ctx, dims[2], dims[3]);
  const { data, width, height } = resizedCtx.getImageData(0, 0, dims[2], dims[3]);

  // 2. Convert the flat data array to a 3D and 4D array
  const dataTensor = ndarray(new Float32Array(data), [width, height, 4]);
  const dataProcessedTensor = ndarray(new Float32Array(width * height * 3), [1, 3, width, height]);

  // 3. Remove the alpha channel and normalize the values
  ops.assign(dataProcessedTensor.pick(0, 0, null, null), dataTensor.pick(null, null, 0));
  ops.assign(dataProcessedTensor.pick(0, 1, null, null), dataTensor.pick(null, null, 1));
  ops.assign(dataProcessedTensor.pick(0, 2, null, null), dataTensor.pick(null, null, 2));
  ops.divseq(dataProcessedTensor, 255);

  // 4. convert to float32 and create tensor object
  const tensor = new ort.Tensor("float32", new Float32Array(width * height * 3), [1, 3, width, height]);
  (tensor.data as Float32Array).set(dataProcessedTensor.data);

  return tensor;
};

/**
 * Function draws the image from provided file
 * and bounding boxes of detected objects on
 * top of the image
 * @param file Uploaded file object
 * @param boxes Array of bounding boxes in format [[x1,y1,x2,y2,object_type,probability],...]
 */
export function draw_image_and_boxes(ctx: CanvasRenderingContext2D, boxes: DetectedObject[]) {
  const conf2color = (conf: number) => {
    const r = Math.round(255 * (1 - conf));
    const g = Math.round(255 * conf);
    return `rgb(${r},${g},0)`;
  };

  const dx = ctx.canvas.width / 640;
  const dy = ctx.canvas.height / 640;

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  let boxesToDraw = boxes;
  const only_highest_score = true;
  if (only_highest_score && boxes.length > 0) {
    // Find the box with the highest score
    const highestScoreBox = boxes.reduce((prev, current) => (prev.prob > current.prob ? prev : current));
    boxesToDraw = [highestScoreBox]; // Only draw the box with the highest score
  }

  // Loop to draw boxes (either all or only the highest score box)
  boxesToDraw.forEach(({ x1, x2, y1, y2, cls_id, prob }) => {
    // Scale to canvas size
    [x1, x2] = [x1, x2].map((x) => x * dx);
    [y1, y2] = [y1, y2].map((x) => x * dy);

    [x1, y1, x2, y2, cls_id] = [x1, y1, x2, y2, cls_id].map((x) => Math.round(x));
    [prob] = [prob].map((x: any) => round(x * 100, 1));

    const label = yoloClasses[cls_id].toString()[0].toUpperCase() + yoloClasses[cls_id].toString().substring(1) + " " + prob.toString() + "%";
    const color = conf2color(cls_id / 100);

    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
    ctx.font = "20px Arial";
    ctx.fillStyle = color;
    ctx.fillText(label, x1, y1 - 5);

    // Fill rectangle with transparent color
    ctx.fillStyle = color.replace(")", ", 0.2)").replace("rgb", "rgba");
    ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
  });

}
