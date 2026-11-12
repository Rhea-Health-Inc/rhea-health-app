import { useEffect, useState } from "react";
import { readDevices, subscribeDevices, type RecordingDevice } from "@/lib/devices";

export function useDevices() {
  const [devices, setDevices] = useState<RecordingDevice[]>([]);

  useEffect(() => {
    setDevices(readDevices());
    return subscribeDevices(setDevices);
  }, []);

  return devices;
}
