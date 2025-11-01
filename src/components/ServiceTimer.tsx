import { useEffect, useState } from "react";
import { useUpdateService } from "@/hooks/useServices";

interface ServiceTimerProps {
  serviceId: string;
  initialMinutes: number;
  isRunning: boolean;
  onTimeUpdate?: (minutes: number) => void;
}

export const ServiceTimer = ({ 
  serviceId, 
  initialMinutes, 
  isRunning,
  onTimeUpdate 
}: ServiceTimerProps) => {
  const [minutes, setMinutes] = useState(initialMinutes);
  const updateService = useUpdateService();

  // Update local minutes when initialMinutes changes (from database)
  useEffect(() => {
    setMinutes(initialMinutes);
  }, [initialMinutes]);

  const [seconds, setSeconds] = useState(0);

  // Timer logic - updates every second
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSeconds((prevSeconds) => {
        if (prevSeconds >= 59) {
          setMinutes((prev) => {
            const newMinutes = prev + 1;
            
            // Auto-save every 5 minutes
            if (newMinutes % 5 === 0) {
              updateService.mutate({
                id: serviceId,
                updates: { tyoaika_minuutit: newMinutes }
              });
            }
            
            // Notify parent component
            onTimeUpdate?.(newMinutes);
            
            return newMinutes;
          });
          return 0;
        }
        return prevSeconds + 1;
      });
    }, 1000); // 1 second

    return () => clearInterval(interval);
  }, [isRunning, serviceId, updateService, onTimeUpdate]);

  // Reset seconds when stopped
  useEffect(() => {
    if (!isRunning) {
      setSeconds(0);
    }
  }, [isRunning]);

  // Format time display
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  return <>{hours}h {remainingMinutes}min {seconds}s</>;
};
