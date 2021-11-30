import { useHistory } from "react-router-dom";
import { takeScreenshot } from "utils";

export default function useShortcuts() {
  const history = useHistory();
  const goToHome = () => history.push("/");

  const keyMap = {
    Go_to_Home: "ctrl+shift+h",
    SCREENSHOT: "ctrl+y",
  };

  const keyHandlers = {
    Go_to_Home: goToHome,
    SCREENSHOT: takeScreenshot,
  };

  return {
    keyMap,
    keyHandlers,
  };
}
