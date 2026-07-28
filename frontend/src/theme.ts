import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#2a78d6",
    },
    secondary: {
      main: "#4a3aa7",
    },
    background: {
      default: "#f9f9f7",
      paper: "#fcfcfb",
    },
  },
  shape: {
    borderRadius: 8,
  },
});
