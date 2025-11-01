import { useState, useEffect, useCallback } from "react";
import { useUpdateService } from "./useServices";

export const useServiceTimer = (serviceId: string, initialMinutes: number = 0, isRunning: boolean = false) => {
  const [minutes, setMinutes] = useState(initialMinutes);
  const [isActive, setIsActive] = useState(isRunning);
  const updateService = useUpdateService();

  const [seconds, setSeconds] = useState(0);

  // Update timer every second when active
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive) {
      interval = setInterval(() => {
        setSeconds(prevSeconds => {
          if (prevSeconds >= 59) {
            setMinutes(prevMinutes => {
              const newMinutes = prevMinutes + 1;
              // Auto-save every 5 minutes
              if (newMinutes % 5 === 0) {
                updateService.mutate({
                  id: serviceId,
                  updates: { tyoaika_minuutit: newMinutes }
                });
              }
              return newMinutes;
            });
            return 0;
          }
          return prevSeconds + 1;
        });
      }, 1000); // 1 second
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, serviceId, updateService]);

  // Reset seconds when timer is not active
  useEffect(() => {
    if (!isActive) {
      setSeconds(0);
    }
  }, [isActive]);

  const startTimer = useCallback(() => {
    setIsActive(true);
    updateService.mutate({
      id: serviceId,
      updates: { 
        ajanlaskuri_kaynnissa: true,
        ajanlaskuri_aloitettu_pvm: new Date().toISOString()
      }
    });
  }, [serviceId, updateService]);

  const stopTimer = useCallback(() => {
    setIsActive(false);
    setSeconds(0);
    // Save immediately when stopping
    updateService.mutate({
      id: serviceId,
      updates: { 
        ajanlaskuri_kaynnissa: false,
        tyoaika_minuutit: minutes
      }
    });
  }, [serviceId, minutes, updateService]);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    setMinutes(0);
    setSeconds(0);
    updateService.mutate({
      id: serviceId,
      updates: { 
        ajanlaskuri_kaynnissa: false,
        tyoaika_minuutit: 0
      }
    });
  }, [serviceId, updateService]);

  // Format minutes to hours:minutes:seconds
  const formatTime = useCallback((totalMinutes: number, totalSeconds: number = 0) => {
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hours}h ${mins}min ${totalSeconds}s`;
  }, []);

  return {
    minutes,
    seconds,
    isActive,
    startTimer,
    stopTimer,
    resetTimer,
    formatTime: () => formatTime(minutes, seconds),
    setMinutes: (newMinutes: number) => {
      setMinutes(newMinutes);
      setSeconds(0);
      updateService.mutate({
        id: serviceId,
        updates: { tyoaika_minuutit: newMinutes }
      });
    }
  };
};