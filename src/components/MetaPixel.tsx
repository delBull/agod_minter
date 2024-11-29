"use client";

import { useEffect } from 'react';

interface FacebookPixelFunction {
    (...args: any[]): void;
    push: any;
    loaded: boolean;
    version: string;
    queue: any[];
    callMethod?: Function;
}

declare global {
    interface Window {
        fbq?: FacebookPixelFunction;
        _fbq?: FacebookPixelFunction;
    }
}

export default function MetaPixel() {
    useEffect(() => {
        const f = window;
        const b = document;
        const e = 'script';
        const v = 'https://connect.facebook.net/en_US/fbevents.js';
        
        if(typeof f.fbq !== 'undefined') return;
        
        const n: FacebookPixelFunction = Object.assign(
            function(this: any, ...args: any[]) {
                n.callMethod ? 
                    n.callMethod.apply(n, args) : 
                    n.queue.push(args);
            },
            {
                push: function(...args: any[]) { n(...args); },
                loaded: true,
                version: '2.0',
                queue: [] as any[],
            }
        );
        
        f.fbq = n;
        if(!f._fbq) f._fbq = n;
        
        const t = b.createElement(e);
        t.async = true;
        t.src = v;
        
        const s = b.getElementsByTagName(e)[0];
        s?.parentNode?.insertBefore(t, s);
        
        f.fbq('init', '1783751072459748');
        f.fbq('track', 'PageView');
    }, []);

    return null;
} 