import * as React from "react";
import Sarus from "@anephenix/sarus";

function useBiokit(active: boolean) {
	const wsRef = React.useRef<Sarus>();
	const [wsqImage, setWsqImage] = React.useState("");
	const [deviceName, setDeviceName] = React.useState("");
	const [biokitStatus, setBiokitStatus] = React.useState("");
	const [passportNumber, setPassportNumber] = React.useState("");
	const [connected, setConnected] = React.useState(false);

	React.useEffect(() => {
		if (active) {
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

				if (data.returnCode === 100) {
					if (data.status === "INITIALIZED") {
						if (data.currentDeviceName) {
							setDeviceName(data.currentDeviceName);
						}
					}
				}

				if (data.MrzDataParsed) {
					const regex = /documentNumber=(\w*)/;

					console.log(data.MrzDataParsed.match(regex)[1]);
					setPassportNumber(data.MrzDataParsed.match(regex)[1]);
				}

				if (data.status === "CAPTURED") {
					if (data.finalWSQImage.length !== 0) {
						setWsqImage(data.finalWSQImage);
					}
				}
			});

			return () => {
				wsRef.current?.disconnect(false);
			};
		}
	}, [active]);

	function handleCapture() {
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
	}

	function handleCancelCapture() {
		wsRef.current?.send(
			JSON.stringify({
				type: "FINGER",
				operation: "cancel_capture",
				position: "1",
				currentDeviceName: deviceName,
			})
		);
	}

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

	return {
		connected,
		biokitStatus,
		wsqImage,
		passportNumber,
		handleCapture,
		handleCancelCapture,
		handlePassportCapture,
		handleCancelPassportCapture,
	};
}

export default useBiokit;
