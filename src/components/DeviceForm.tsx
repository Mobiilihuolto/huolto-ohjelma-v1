import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAddDevice, useUpdateDevice } from "@/hooks/useDevices";
import { Loader2 } from "lucide-react";

type DeviceFormData = {
  sarjanumero: string;
  malli: string;
  merkki: string;
};

interface DeviceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  device?: {
    id: string;
    sarjanumero: string | null;
    malli: string | null;
    merkki: string | null;
  } | null;
}

export const DeviceForm = ({ open, onOpenChange, device = null }: DeviceFormProps) => {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<DeviceFormData>();
  const addDeviceMutation = useAddDevice();
  const updateDeviceMutation = useUpdateDevice();

  const isEditMode = !!device;

  // Initialize form with device data when editing
  useEffect(() => {
    if (device && open) {
      setValue("sarjanumero", device.sarjanumero || "");
      setValue("malli", device.malli || "");
      setValue("merkki", device.merkki || "");
    } else if (!open) {
      reset();
    }
  }, [device, open, setValue, reset]);

  const onSubmit = (data: DeviceFormData) => {
    
    if (isEditMode && device) {
      // Update existing device
      updateDeviceMutation.mutate(
        { id: device.id, updates: data },
        {
          onSuccess: () => {
            reset();
            onOpenChange(false);
          },
        }
      );
    } else {
      // Add new device
      const deviceData = { ...data, asiakas_id: null };
      addDeviceMutation.mutate(deviceData, {
        onSuccess: () => {
          reset();
          onOpenChange(false);
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Muokkaa laitetta" : "Uusi laite"}</DialogTitle>
          <DialogDescription>
            {isEditMode ? "Muokkaa laitteen tietoja" : "Lisää uusi laite järjestelmään"}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sarjanumero">Sarjanumero/mallikoodi</Label>
            <Input
              id="sarjanumero"
              {...register("sarjanumero")}
              placeholder="Syötä sarjanumero tai mallikoodi (valinnainen)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="merkki">Valmistaja *</Label>
            <Input
              id="merkki"
              {...register("merkki", { required: "Valmistaja on pakollinen" })}
              placeholder="Esim. Apple, Lenovo, Samsung"
            />
            {errors.merkki && (
              <p className="text-sm text-destructive">{errors.merkki.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="malli">Malli *</Label>
            <Input
              id="malli"
              {...register("malli", { required: "Malli on pakollinen" })}
              placeholder="Esim. iPhone 12, ThinkPad X1"
            />
            {errors.malli && (
              <p className="text-sm text-destructive">{errors.malli.message}</p>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Peruuta
            </Button>
            <Button 
              type="submit" 
              disabled={addDeviceMutation.isPending || updateDeviceMutation.isPending}
              className="flex-1"
            >
              {(addDeviceMutation.isPending || updateDeviceMutation.isPending) ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {isEditMode ? "Päivitetään..." : "Lisätään..."}
                </>
              ) : (
                isEditMode ? "Tallenna muutokset" : "Lisää laite"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};