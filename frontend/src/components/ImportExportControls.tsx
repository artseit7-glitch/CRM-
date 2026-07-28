import { useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  ButtonGroup,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import UploadIcon from "@mui/icons-material/UploadFileOutlined";
import DownloadIcon from "@mui/icons-material/DownloadOutlined";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  exportFile,
  importFile,
  type ImportExportResource,
} from "../api/importExport";
import type { ImportResult } from "../types";
import { extractErrorMessage } from "../api/client";

interface ImportExportControlsProps {
  resource: ImportExportResource;
  invalidateKey: string;
}

export function ImportExportControls({
  resource,
  invalidateKey,
}: ImportExportControlsProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [resultError, setResultError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<"csv" | "xlsx" | null>(null);

  const importMutation = useMutation({
    mutationFn: (file: File) => importFile(resource, file),
    onSuccess: (data) => {
      setResult(data);
      setResultError(null);
      queryClient.invalidateQueries({ queryKey: [invalidateKey] });
    },
    onError: (err) => {
      setResultError(extractErrorMessage(err));
      setResult(null);
    },
  });

  async function handleExport(filetype: "csv" | "xlsx") {
    setExporting(filetype);
    try {
      await exportFile(resource, filetype);
    } catch (err) {
      setResultError(extractErrorMessage(err));
    } finally {
      setExporting(null);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) importMutation.mutate(file);
    e.target.value = "";
  }

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <input
        type="file"
        accept=".csv,.xlsx"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <Button
        size="small"
        variant="outlined"
        startIcon={<UploadIcon />}
        onClick={() => fileInputRef.current?.click()}
        disabled={importMutation.isPending}
      >
        {importMutation.isPending ? "Importing..." : "Import"}
      </Button>
      <ButtonGroup size="small" variant="outlined">
        <Button
          startIcon={<DownloadIcon />}
          onClick={() => handleExport("csv")}
          disabled={exporting !== null}
        >
          Export CSV
        </Button>
        <Button
          onClick={() => handleExport("xlsx")}
          disabled={exporting !== null}
        >
          Export XLSX
        </Button>
      </ButtonGroup>

      <Dialog
        open={!!result || !!resultError}
        onClose={() => {
          setResult(null);
          setResultError(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Import result</DialogTitle>
        <DialogContent>
          {resultError && <Alert severity="error">{resultError}</Alert>}
          {result && (
            <Box>
              <Typography variant="body2" gutterBottom>
                Processed {result.total_rows} row(s).
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap" mb={1.5}>
                {Object.entries(result.totals).map(([key, value]) => (
                  <Typography key={key} variant="body2" color="text.secondary">
                    {key}: <strong>{value}</strong>
                  </Typography>
                ))}
              </Stack>
              {result.has_errors && (
                <>
                  <Alert severity="warning" sx={{ mb: 1 }}>
                    Some rows had errors:
                  </Alert>
                  <List dense sx={{ maxHeight: 220, overflow: "auto" }}>
                    {result.errors.map((err, i) => (
                      <ListItem key={i} disableGutters>
                        <ListItemText primary={err} />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setResult(null);
              setResultError(null);
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
