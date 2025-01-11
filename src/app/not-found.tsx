"use client";

import { H2, H3 } from "@/components/typography";
// import Metadata from "@/lib/metadata";
import Link from 'next/link'
const NotFound = () => {
  return (
    <div className="not-found text-black flex flex-col gap-5 w-full self-center text-center">
      {/* <Metadata title="404 | Sign App" /> */}

      <H2 level={"5xl"} className="font-black">
        404 - Page Not Found
      </H2>
      <Link href="/">Return Home</Link>
      <H3 level={"2xl"}>The page you are looking for does not exist.</H3>
    </div>
  );
};

export default NotFound;
