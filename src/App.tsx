import { CSPProvider } from "@base-ui/react";
import { Provider } from "jotai";

import "./App.css";
import VideoPlayer from "./components/VideoPlayer";

function App() {
  return (
    <Provider>
      <CSPProvider disableStyleElements>
        <VideoPlayer />
      </CSPProvider>
    </Provider>
  );
}

export default App;
