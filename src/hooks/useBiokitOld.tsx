import { useState, useEffect, useRef, useCallback } from "react";

type Message = {
	data: any;
};

const useBiokit = () => {
	const [deviceName, setDeviceName] = useState();
	const [wsqImage, setWsqImage] = useState();
	const wsRef = useRef<WebSocket>();

	const handleOnMessage = useCallback((message: Message) => {
		let msg = JSON.parse(message.data);
		console.log(msg);

		if (msg.returnCode === 200 && msg.returnMessage === "CONNECTED") {
			wsRef.current &&
				wsRef.current.send(
					JSON.stringify({
						type: "PASSPORT",
						operation: "init_device",
					})
				);
		}

		if (msg.returnCode === 100) {
			if (msg.status === "INITIALIZED") {
				if (msg.currentDeviceName) {
					setDeviceName(msg.currentDeviceName);
				}
			}
		}

		if (msg.status === "CAPTURED") {
			if (msg.finalWSQImage.length !== 0) {
				console.log("Final WSQ Image: " + msg.finalWSQImage.length);
				setWsqImage(msg.finalWSQImage);
			}
		}
	}, []);

	useEffect(() => {
		const ws = new WebSocket("ws://127.0.0.1:6178/BioKit/server");
		ws.onopen = handleOpen;
		ws.onmessage = handleOnMessage;
		ws.onclose = handleClose;
		wsRef.current = ws;
		return () => {
			ws.close();
		};
	}, [handleOnMessage]);

	function handleOpen() {
		console.log("Websocket opened");
	}

	function handleClose() {
		console.log("Websocket closed");
	}

	const handleCapture = useCallback(() => {
		wsRef.current &&
			wsRef.current.send(
				JSON.stringify({
					type: "FINGER",
					operation: "capture",
					position: "1",
					wsqRequired: true,
					segmentationRequired: true,
					currentDeviceName: deviceName,
				})
			);
	}, [deviceName]);

	return [handleCapture, wsqImage];
};

export default useBiokit;
