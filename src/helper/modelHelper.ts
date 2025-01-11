import { yoloClasses } from '@/constants/yoloClasses';
import { DetectedObject } from '@/types/general';
import * as ort from 'onnxruntime-web';

export async function loadModel( url: string ): Promise<ort.InferenceSession> {
    return await ort.InferenceSession.create(url, {
        executionProviders: ["wasm"],
        graphOptimizationLevel: "all",
    });
}

export async function runInference(session: ort.InferenceSession, preprocessedData: ort.Tensor): Promise<[ort.Tensor, number]> {
    // Get start time to calculate inference time.
    const start = new Date();
    // create feeds with the input name from model export and the preprocessed data.
    const feeds: Record<string, ort.Tensor> = {};
    feeds[session.inputNames[0]] = preprocessedData;
    
    // Run the session inference.
    const outputData = await session.run(feeds);
    // Get the end time to calculate inference time.
    const end = new Date();
    // Convert to seconds.
    const inferenceTime = (end.getTime() - start.getTime())/1000;
    // Get output results with the output name from the model export.
    const output = outputData[session.outputNames[0]];

    return [output, inferenceTime];
}

/**
 * Function used to convert RAW output from YOLOv8 to an array of detected objects.
 * Each object contains the bounding box of this object, the type of object, and the probability.
 * @param output Raw output of YOLOv8 network
 * @param img_width Width of the original image
 * @param img_height Height of the original image
 * @returns Array of detected objects in a format [[x1,y1,x2,y2,object_type,probability],..]
 */
export function tensorToObject(output: Float32Array, img_width: number = 640, img_height: number = 640): DetectedObject[] {
    let boxes: DetectedObject[] = [];
    for (let index = 0; index < 8400; index++) {
        // @ts-ignore
        const [class_id, prob] = [...Array(26).keys()]
            .map(col => [col, output[8400 * (col + 4) + index]] as [number, number])
            .reduce((accum, item) => item[1] > accum[1] ? item : accum, [0, 0]);
        
        if (prob < 0.20) { // probabilitas website yang baik agar sistem deteksi tidak mendeteksi wajah yang memiliki akurasi rendah probabilitasnya
            continue;
        }
        
        // const label = yoloClasses[class_id];
        const xc = output[index];
        const yc = output[8400 + index];
        const w = output[2 * 8400 + index];
        const h = output[3 * 8400 + index];
        const x1 = (xc - w / 2) / 640 * img_width;
        const y1 = (yc - h / 2) / 640 * img_height;
        const x2 = (xc + w / 2) / 640 * img_width;
        const y2 = (yc + h / 2) / 640 * img_height;
        boxes.push({
            x1: x1,
            y1: y1,
            x2: x2,
            y2: y2,
            cls_id: class_id,
            prob: prob,
        });
        console.log("label: ", yoloClasses[class_id], " prob: ", prob);
    }

    boxes = boxes.sort((box1, box2) => box2.prob - box1.prob);
    const result: DetectedObject[] = [];
    console.log("boxes: ",boxes.length);
    console.log("=====================================");
    while (boxes.length > 0) {
        result.push(boxes[0]);
        boxes = boxes.filter(box => iou(boxes[0], box) < 0.7);
    }
    return result;
}

/**
 * Function calculates "Intersection-over-union" coefficient for specified two boxes.
 * @param box1 First box in format: [x1,y1,x2,y2,object_class,probability]
 * @param box2 Second box in format: [x1,y1,x2,y2,object_class,probability]
 * @returns Intersection over union ratio as a float number
 */
function iou(box1: DetectedObject, box2: DetectedObject): number {
    return intersection(box1, box2) / union(box1, box2);
}

/**
 * Function calculates union area of two boxes.
 * @param box1 First box in format [x1,y1,x2,y2,object_class,probability]
 * @param box2 Second box in format [x1,y1,x2,y2,object_class,probability]
 * @returns Area of the boxes union as a float number
 */
function union(box1: DetectedObject, box2: DetectedObject): number {
    const box1_area = (box1.x2 - box1.x1) * (box1.y2 - box1.y1);
    const box2_area = (box2.x2 - box2.x1) * (box2.y2 - box2.y1);
    return box1_area + box2_area - intersection(box1, box2);
}

/**
 * Function calculates intersection area of two boxes.
 * @param box1 First box in format [x1,y1,x2,y2,object_class,probability]
 * @param box2 Second box in format [x1,y1,x2,y2,object_class,probability]
 * @returns Area of intersection of the boxes as a float number
 */
function intersection(box1: DetectedObject, box2: DetectedObject): number {
    const x1 = Math.max(box1.x1, box2.x1);
    const y1 = Math.max(box1.y1, box2.y1);
    const x2 = Math.min(box1.x2, box2.x2);
    const y2 = Math.min(box1.y2, box2.y2);
    return (x2 - x1) * (y2 - y1); // objek yang di deteksi di buat box berwarna merah agar tahu diamna lokasi d deteksi 
}

