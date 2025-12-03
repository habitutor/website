import { AndroidLogo } from "@phosphor-icons/react";

export default function Loader() {
  return (
    <div className="flex h-full items-center justify-center pt-8">
      <AndroidLogo className="h-9 w-8 animate-spin text-gray-600" />
    </div>
  );
}
