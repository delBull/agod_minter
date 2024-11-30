"use client";

import { useEffect, useState } from 'react';

type TimeLeft = {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
};

export function CountdownTimer() {
    return (
        <div className="w-full max-w-md mx-auto mb-4">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-[1px] rounded-lg">
                <div className="bg-black/90 backdrop-blur-sm rounded-lg p-3">
                    <div className="text-center text-white font-bold">
                        ¡La Preventa ya inició!
                    </div>
                    <div className="text-center text-sm text-zinc-400 mt-1">
                        mintea AGOD tokea ahora
                    </div>
                </div>
            </div>
        </div>
    );
}
