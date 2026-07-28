import { Component, type ReactNode } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Unhandled UI error:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 3,
          }}
        >
          <Stack spacing={2} alignItems="center" maxWidth={420}>
            <Typography variant="h6" fontWeight={700}>
              Something went wrong
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              An unexpected error occurred. If you have page translation
              enabled in your browser, try disabling it for this site.
            </Typography>
            <Button variant="contained" onClick={() => window.location.reload()}>
              Reload page
            </Button>
          </Stack>
        </Box>
      );
    }
    return this.props.children;
  }
}
