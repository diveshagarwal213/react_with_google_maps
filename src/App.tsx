import { ThemeProvider } from "@mui/material";
//others
import theme from "./lib/Material/theme";
import Map from "./components/Map/Map";

import "./App.css";
//fonts
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

//css

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Map />
    </ThemeProvider>
  );
}

export default App;
