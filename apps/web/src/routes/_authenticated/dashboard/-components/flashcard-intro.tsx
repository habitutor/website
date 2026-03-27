import * as m from "motion/react-m";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const FlashcardIntro = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const timeout = setTimeout(() => {
            navigate({ to: "/dashboard/flashcard" });
        }, 5000);
        return () => clearTimeout(timeout);
    }, [navigate]);

    return (
        <div className="relative w-full min-h-[70vh] flex items-center justify-center">
            {/* Background rotated card kiri — hidden di mobile */}
            <m.div
                initial={{ opacity: 0, rotate: -6, scale: 0.85 }}
                animate={{ opacity: 1, rotate: -3.75, scale: 1 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0 }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden sm:block"
                style={{ zIndex: 1 }}
            >
                <div className="bg-[#fdc10e] border-[3px] sm:border-[5px] border-[#e1a902] border-solid h-[280px] sm:h-[380px] lg:h-[466px] rounded-[10px] shadow-[0px_2px_2px_0px_rgba(54,80,162,0.2)] w-[92vw] sm:w-[700px] lg:w-[900px]" />
            </m.div>

            {/* Background rotated card kanan — hidden di mobile */}
            <m.div
                initial={{ opacity: 0, rotate: 10, scale: 0.85 }}
                animate={{ opacity: 1, rotate: 7.69, scale: 1 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden sm:block"
                style={{ zIndex: 2 }}
            >
                <div className="bg-[#fdc10e] border-[3px] sm:border-[5px] border-[#e1a902] border-solid h-[290px] sm:h-[390px] lg:h-[477px] rounded-[10px] shadow-[0px_2px_2px_0px_rgba(54,80,162,0.2)] w-[92vw] sm:w-[700px] lg:w-[900px]" />
            </m.div>

            {/* Main white card */}
            <m.div
                initial={{ opacity: 0, scale: 0.75, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                className="relative bg-white border-2 sm:border-4 border-[#d2d2d2] border-solid overflow-hidden rounded-[10px] shadow-[0px_2px_2px_0px_rgba(54,80,162,0.2)] w-[92vw] sm:w-[700px] lg:w-[900px] sm:h-[390px] lg:h-[477px]"
                style={{ zIndex: 10 }}
            >
                {/* ── MOBILE LAYOUT (flex column, tinggi auto) ── */}
                <div className="flex flex-col sm:hidden w-full h-full">
                    {/* Timer bar */}
                    <div className="relative bg-green-500 border border-green-700 h-[44px] mx-4 mt-4 overflow-clip rounded-[5px] shrink-0">
                        <div className="absolute left-[-20px] top-[-18px] size-[90px]">
                            <svg className="absolute block size-full" fill="none" viewBox="0 0 157 149">
                                <ellipse cx="78.5" cy="74.5" fill="#1CA35B" rx="78.5" ry="74.5" />
                            </svg>
                        </div>
                        <p className="absolute font-bold left-[16px] text-[16px] text-white top-1/2 -translate-y-1/2 whitespace-nowrap tracking-widest">
                            00:10:00
                        </p>
                    </div>

                    {/* Character image — tengah di mobile */}
                    <div className="relative w-full flex justify-center mt-4 shrink-0">
                        <div className="relative h-[160px] w-[160px]">
                            <img
                                alt=""
                                className="absolute inset-0 object-contain pointer-events-none size-full"
                                src="/decorations/image 25.png"
                            />
                        </div>
                    </div>

                    {/* Text content */}
                    <div className="flex flex-col px-4 pt-3 pb-6 gap-2">
                        <p className="font-bold leading-tight text-[#fdc10e] text-[36px]">
                            Mari Mulai!
                        </p>
                        <p className="font-medium leading-snug text-[#333] text-[13px]">
                            Kamu punya sepuluh menit untuk mengerjakan semua soal
                        </p>
                    </div>
                </div>

                {/* ── TABLET & DESKTOP LAYOUT (absolute, sama seperti semula) ── */}
                <div className="hidden sm:block w-full h-full">
                    {/* Timer bar */}
                    <div className="absolute bg-green-500 border border-green-700 sm:h-[60px] lg:h-[76px] sm:left-[32px] lg:left-[48px] overflow-clip rounded-[5px] sm:top-[30px] lg:top-[44px] sm:w-[calc(100%-64px)] lg:w-[calc(100%-96px)]">
                        <div className="absolute sm:left-[-28px] lg:left-[-33px] sm:top-[-24px] lg:top-[-29px] sm:size-[120px] lg:size-[152px]">
                            <svg className="absolute block size-full" fill="none" viewBox="0 0 157 149">
                                <ellipse cx="78.5" cy="74.5" fill="#1CA35B" rx="78.5" ry="74.5" />
                            </svg>
                        </div>
                        <p className="absolute font-bold sm:left-[20px] lg:left-[25px] sm:text-[22px] lg:text-[27px] text-white top-1/2 -translate-y-1/2 whitespace-nowrap tracking-widest">
                            00:10:00
                        </p>
                    </div>

                    {/* Mari Mulai text */}
                    <p className="absolute font-bold leading-tight sm:left-[32px] lg:left-[47px] text-[#fdc10e] sm:text-[54px] lg:text-[75px] sm:top-[110px] lg:top-[147px] sm:w-[45%]">
                        Mari Mulai!
                    </p>

                    {/* Description text */}
                    <p className="absolute font-medium leading-snug sm:left-[32px] lg:left-[47px] text-[#333] sm:text-[15px] lg:text-[20px] sm:top-[200px] lg:top-[259px] sm:w-[45%]">
                        Kamu punya sepuluh menit untuk mengerjakan semua soal
                    </p>

                    {/* Yellow ellipse decoration */}
                    <div className="absolute sm:h-[300px] lg:h-[401px] sm:right-[-10px] lg:left-[499px] sm:top-[120px] lg:top-[187px] sm:w-[45%] lg:w-[404px]">
                        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 404 401">
                            <ellipse cx="202" cy="200" fill="#FEE086" rx="202" ry="200" stroke="#FED65E" strokeWidth="2" />
                        </svg>
                    </div>

                    {/* Character image */}
                    <div className="absolute right-0 lg:left-[479px] bottom-0 lg:top-[53px] sm:h-[260px] lg:h-[500px] sm:w-[45%] lg:w-[500px]">
                        <img
                            alt=""
                            className="absolute inset-0 max-w-none object-contain pointer-events-none size-full"
                            src="/decorations/image 25.png"
                        />
                    </div>
                </div>
            </m.div>
        </div>
    );
};