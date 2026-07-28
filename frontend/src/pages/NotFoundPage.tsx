import { Box, Button, Typography } from "@mui/material";
import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <Box sx={{ textAlign: "center", py: 10 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Not found
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        This record doesn't exist, or you don't have access to it.
      </Typography>
      <Button component={Link} to="/" variant="contained">
        Back to dashboard
      </Button>
    </Box>
  );
}
