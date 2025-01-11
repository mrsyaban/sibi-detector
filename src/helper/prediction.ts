import * as ort from "onnxruntime-web";
import { draw_image_and_boxes, imageToTensor } from "./imageHelper";
import { runInference, tensorToObject } from "./modelHelper";
import { DetectedObject } from "@/types/general";


export async function inferenceYoloV8(session: ort.InferenceSession, ctx: CanvasRenderingContext2D): Promise<[DetectedObject[],number]> {
  // 1. Convert image to tensor
  const imageTensor = await imageToTensor(ctx);
  // 2. Run model
  const [predictions, inferenceTime] = await runInference(session, imageTensor);
  // 3. Convert array to detected objects
  const boxes = await tensorToObject(predictions.data as Float32Array);
  // 4. Return boxes and the amount of time it took to inference.
  return [boxes, inferenceTime];
  // Pengaturan prediction sistem deteksi model prediction 
}

