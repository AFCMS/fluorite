import { Provider } from "jotai";
import VideoPlayer from "./components/VideoPlayer";

import "./App.css";

function App() {
  return (
    <Provider>
      <VideoPlayer />
    </Provider>
  );
}

export default App;
