import Image from "next/image";

export default function Loading() {
  return (
    <div className="w-full h-screen bg-[#F3EFE7] flex flex-col items-center justify-center relative">
      <Image
        width={512}
        height={512}
        src="/mosa-logo-512.svg"
        alt="logo"
        className="animate-pulse"
      />
    </div>
  );
}
