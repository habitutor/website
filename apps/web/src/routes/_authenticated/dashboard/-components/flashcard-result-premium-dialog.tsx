import { Link } from "@tanstack/react-router";

export function FlashcardResultPremiumDialog({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-[rgba(0,0,0,0.5)]">
      <div className="rounded-xl bg-white py-6 pr-9 pl-6">
        <div className="flex flex-col items-end gap-6.75">
          <div className="flex flex-col items-start gap-4">
            <p className="text-[18px] leading-normal font-bold whitespace-nowrap text-[#333]">Ups, belum premium!</p>
            <p className="w-76 text-[12px] leading-normal font-medium text-[#71717a]">
              Untuk bermain di Brain Gym lebih dari sekali dalam satu hari, kamu perlu Premium
            </p>
          </div>
          <div className="flex items-start gap-2">
            <button
              onClick={onClose}
              className="flex h-10.25 w-19.25 items-center justify-center rounded-[6px] border border-[#e4e4e7] px-4 py-3"
            >
              <span className="text-[14px] font-medium whitespace-nowrap text-[#333]">Cancel</span>
            </button>
            <Link
              to="/premium"
              className="flex items-center justify-center rounded-[6px] bg-primary-300 px-4 py-3 no-underline"
            >
              <span className="text-[14px] font-medium whitespace-nowrap text-white">Premium Sekarang</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
