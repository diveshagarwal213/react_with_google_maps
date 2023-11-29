import { createTheme } from "@mui/material";

const theme = createTheme({
  //   palette: {
  //     primary: {
  //       main: "#FF4477",
  //     },
  //     info: {
  //       main: "#94a3b8",
  //     },
  //   },
  components: {
    MuiButton: {
      defaultProps: {
        size: "large",
      },
      styleOverrides: {
        root: {
          textTransform: "none",
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
    },
  },
});

export default theme;
