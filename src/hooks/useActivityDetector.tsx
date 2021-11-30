import * as React from "react";
import createActivityDetector from "activity-detector";

function useActivityDetector() {
	const [activityStatus, setActivityStatus] = React.useState("active");

	React.useEffect(() => {
		const ad = createActivityDetector();
		ad.on("idle", () => {
			// console.log("idle");
			setActivityStatus("idle");
		});
		ad.on("active", () => {
			// console.log("active");
			setActivityStatus("active");
		});
		return () => {
			ad.stop();
		};
	}, []);

	return activityStatus;
}

export default useActivityDetector;
