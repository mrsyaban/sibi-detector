"use client";

// import Camera from "@/components/camera";
import CameraDetection from "@/components/cameraDetection";
import { H2, P } from "@/components/typography";
// import Metadata from "@/lib/metadata";

export default function Home() {
  return (
    <main className="bg-black w-full h-screen overflow-y-auto text-white flex flex-col p-4 ">
      <CameraDetection/>  
    </main>
  );
}
