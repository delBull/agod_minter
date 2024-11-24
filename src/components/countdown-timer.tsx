"use client";

import { useEffect, useState } from 'react';

type TimeLeft = {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
};

export function CountdownTimer() {
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const targetDate = new Date('2024-11-25T22:15:00').getTime();
            const now = new Date().getTime();
            const difference = targetDate - now;

            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((difference % (1000 * 60)) / 1000);

                setTimeLeft({ days, hours, minutes, seconds });
            }
        };

        // Calcular inmediatamente
        calculateTimeLeft();

        // Actualizar cada segundo
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatNumber = (num: number): string => num.toString().padStart(2, '0');

    return (
        <div className="w-full max-w-md mx-auto mb-4">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-[1px] rounded-lg">
                <div className="bg-black/90 backdrop-blur-sm rounded-lg p-3">
                    <div className="text-center text-xs text-zinc-400 mb-2">
                        Lanzamiento en
                    </div>
                    <div className="flex justify-center items-center gap-4 text-white font-mono">
                        <div className="flex flex-col items-center">
                            <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                {formatNumber(timeLeft.days)}
                            </span>
                            <span className="text-[10px] text-zinc-400">Días</span>
                        </div>
                        <span className="text-lg text-zinc-600">:</span>
                        <div className="flex flex-col items-center">
                            <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                {formatNumber(timeLeft.hours)}
                            </span>
                            <span className="text-[10px] text-zinc-400">Horas</span>
                        </div>
                        <span className="text-lg text-zinc-600">:</span>
                        <div className="flex flex-col items-center">
                            <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                {formatNumber(timeLeft.minutes)}
                            </span>
                            <span className="text-[10px] text-zinc-400">Min</span>
                        </div>
                        <span className="text-lg text-zinc-600">:</span>
                        <div className="flex flex-col items-center">
                            <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent animate-pulse">
                                {formatNumber(timeLeft.seconds)}
                            </span>
                            <span className="text-[10px] text-zinc-400">Seg</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
