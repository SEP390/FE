import { useEffect, useRef } from 'react';

export function PerformanceMonitor({ componentName }) {
    const startTime = useRef(performance.now());
    
    useEffect(() => {
        const endTime = performance.now();
        const loadTime = endTime - startTime.current;
        
        console.log(`🚀 ${componentName} loaded in ${loadTime.toFixed(2)}ms`);
        
        // Log to browser performance API
        if (performance.mark) {
            performance.mark(`${componentName}-loaded`);
        }
        
        return () => {
            // Cleanup if needed
        };
    }, [componentName]);
    
    return null; // This component doesn't render anything
}

