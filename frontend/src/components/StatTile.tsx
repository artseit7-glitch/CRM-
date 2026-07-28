import { Paper, Typography } from "@mui/material";

interface StatTileProps {
  label: string;
  value: string;
  helpText?: string;
}

export function StatTile({ label, value, helpText }: StatTileProps) {
  return (
    <Paper variant="outlined" sx={{ p: 2.5, flex: 1, minWidth: 180 }}>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {label}
      </Typography>
      <Typography variant="h4" fontWeight={600}>
        {value}
      </Typography>
      {helpText && (
        <Typography variant="caption" color="text.secondary">
          {helpText}
        </Typography>
      )}
    </Paper>
  );
}
