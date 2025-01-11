export type CardProps = {
  image: string;
  name: string;
};

export type DetectedObject = {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  cls_id: number;
  prob: number;
} 
