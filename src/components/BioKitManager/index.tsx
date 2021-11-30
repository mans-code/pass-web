import * as React from "react";
import Sarus from "@anephenix/sarus";
import createCtx from "utils/createCtx";
import { useAppStore } from "store/root-store";

type Biokit = {
  connected: boolean;
  biokitStatus: string;
  wsqImage: string;
  passportNumber: string;
  handleCapture: () => void;
  handleCancelCapture: () => void;
  handlePassportCapture: () => void;
  handleCancelPassportCapture: () => void;
  deinitializeDevice: () => void;
  shutdown: (connected: Boolean) => void;
  disconnect: () => void;
  deviceName: string;
};

const [useBiokit, BioKitProvider] = createCtx<Biokit>();

type BioKitManagerProps = {
  children: React.ReactNode;
};

function BioKitManager({ children }: BioKitManagerProps) {
  const wsRef = React.useRef<Sarus>();
  const [connected, setConnected] = React.useState(false);
  const [biokitStatus, setBiokitStatus] = React.useState("");
  const [deviceName, setDeviceName] = React.useState("");
  const [passportNumber, setPassportNumber] = React.useState("");
  const [wsqImage, setWsqImage] = React.useState("");
  const appStore = useAppStore();

  React.useEffect(() => {
    if (appStore.biokit.enabled) {
      // Connect to a WebSocket server
      wsRef.current = new Sarus({
        url: "ws://127.0.0.1:6178/BioKit/server",
      });

      wsRef.current.on("open", () => {
        console.log("Websocket opened");
      });

      wsRef.current.on("close", () => {
        console.log("Websocket closed");
        setConnected(false);
        setBiokitStatus("");
        setDeviceName("");
        setPassportNumber("");
        setWsqImage("");
      });

      wsRef.current.on("message", (event: any) => {
        let data = JSON.parse(event.data);

        setBiokitStatus(data.status);

        if (data.returnCode === 200 && data.returnMessage === "CONNECTED") {
          setConnected(true);

          wsRef.current?.send(
            JSON.stringify({
              type: "FINGER",
              operation: "init_device",
              position: "1",
            })
          );
        }

        if (data.type === "FINGER") {
          if (data.status === "INITIALIZED") {
            if (data.currentDeviceName) {
              setDeviceName(data.currentDeviceName);
            }
          }

          if (data.status === "UNINITIALIZED") {
            setDeviceName("");

            wsRef.current?.send(
              JSON.stringify({
                type: "FINGER",
                operation: "init_device",
                position: "1",
              })
            );
          }

          // Device not found or unplugged
          if (data.returnCode === 105) {
            setDeviceName("");
          }

          if (data.status === "CAPTURED") {
            if (data.finalWSQImage.length !== 0) {
              setWsqImage(data.finalWSQImage);
            }
          }
        }

        if (data.type === "PASSPORT") {
          if (data.MrzDataParsed) {
            const regex = /documentNumber=(\w*)/;

            console.log(data.MrzDataParsed.match(regex)[1]);
            setPassportNumber(data.MrzDataParsed.match(regex)[1]);
          }
        }
      });
    }
    return () => {
      wsRef.current?.disconnect(false);
    };
  }, [appStore.biokit.enabled]);

  const handleCapture = React.useCallback(() => {
    wsRef.current?.send(
      JSON.stringify({
        type: "FINGER",
        operation: "capture",
        position: "1",
        wsqRequired: true,
        segmentationRequired: true,
        currentDeviceName: deviceName,
        segmentedWsqRequired: true,
        expectedFingersCount: 1,
        // missingFingersList: [],
      })
    );
  }, [deviceName]);

  const handleCancelCapture = React.useCallback(() => {
    wsRef.current?.send(
      JSON.stringify({
        type: "FINGER",
        operation: "cancel_capture",
        position: "1",
        currentDeviceName: deviceName,
      })
    );
  }, [deviceName]);

  const handlePassportCapture = React.useCallback(() => {
    wsRef.current?.send(
      JSON.stringify({
        type: "PASSPORT",
        operation: "READ_PASSPORT_DESKO",
      })
    );
  }, []);

  const handleCancelPassportCapture = React.useCallback(() => {
    wsRef.current?.send(
      JSON.stringify({
        type: "PASSPORT",
        operation: "cancel_capture",
      })
    );
  }, []);

  const deinitializeDevice = () => {
    if (deviceName === "") {
      wsRef.current?.send(
        JSON.stringify({
          type: "FINGER",
          operation: "init_device",
          position: "1",
        })
      );
    } else {
      wsRef.current?.send(
        JSON.stringify({
          type: "FINGER",
          operation: "deinitialize",
          position: "1",
          currentDeviceName: deviceName,
        })
      );
    }
  };

  const shutdown = (connected: Boolean) => {
    if (connected) {
      wsRef.current?.send(
        JSON.stringify({
          operation: "shutdown",
        })
      );
    }

    window.location.assign(
      `${process.env.REACT_APP_API_URL ?? ""}/bio/client/biokit/APPLICATION.JNLP`
    );
  };

  const disconnect = () => {
    wsRef.current?.disconnect(true);
  };

  let value: Biokit = {
    connected,
    biokitStatus,
    wsqImage,
    passportNumber,
    handleCapture,
    handleCancelCapture,
    handlePassportCapture,
    handleCancelPassportCapture,
    deinitializeDevice,
    shutdown,
    deviceName,
    disconnect,
  };

  return <BioKitProvider value={value}>{children}</BioKitProvider>;
}

export { BioKitManager, useBiokit };
