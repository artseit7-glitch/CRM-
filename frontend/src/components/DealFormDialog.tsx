import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Slider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createDeal, deleteDeal, updateDeal, type DealPayload } from "../api/deals";
import { listAllCompanies } from "../api/companies";
import { listAllContacts } from "../api/contacts";
import type { Deal, DealStage } from "../types";
import { extractErrorMessage } from "../api/client";
import { ErrorState } from "./StateDisplay";
import { ConfirmDialog } from "./ConfirmDialog";
import { STAGES } from "../constants";

const emptyForm: DealPayload = {
  title: "",
  contact: null,
  company: null,
  amount: "",
  stage: "new",
  probability: 50,
  expected_close_date: null,
};

interface DealFormDialogProps {
  open: boolean;
  deal: Deal | null;
  defaultStage?: DealStage;
  onClose: () => void;
}

export function DealFormDialog({
  open,
  deal,
  defaultStage,
  onClose,
}: DealFormDialogProps) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<DealPayload>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (deal) {
      setForm({
        title: deal.title,
        contact: deal.contact,
        company: deal.company,
        amount: deal.amount,
        stage: deal.stage,
        probability: deal.probability,
        expected_close_date: deal.expected_close_date
          ? deal.expected_close_date.slice(0, 10)
          : null,
      });
    } else {
      setForm({ ...emptyForm, stage: defaultStage ?? "new" });
    }
    setFormError(null);
  }, [open, deal, defaultStage]);

  const companiesQuery = useQuery({
    queryKey: ["companies-all"],
    queryFn: listAllCompanies,
    enabled: open,
  });
  const contactsQuery = useQuery({
    queryKey: ["contacts-all"],
    queryFn: listAllContacts,
    enabled: open,
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["deals"] });
  };

  const createMutation = useMutation({
    mutationFn: createDeal,
    onSuccess: () => {
      invalidateAll();
      onClose();
    },
    onError: (err) => setFormError(extractErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: DealPayload) => updateDeal(deal!.id, payload),
    onSuccess: () => {
      invalidateAll();
      onClose();
    },
    onError: (err) => setFormError(extractErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteDeal(deal!.id),
    onSuccess: () => {
      invalidateAll();
      setConfirmDelete(false);
      onClose();
    },
  });

  function handleSubmit() {
    if (!form.title.trim()) {
      setFormError("Title is required");
      return;
    }
    if (!form.amount || Number.isNaN(Number(form.amount))) {
      setFormError("Amount must be a valid number");
      return;
    }
    const payload: DealPayload = {
      ...form,
      expected_close_date: form.expected_close_date || null,
    };
    if (deal) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>{deal ? "Edit deal" : "New deal"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            {formError && <ErrorState message={formError} />}
            <TextField
              label="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              fullWidth
            />
            <Stack direction="row" spacing={2}>
              <TextField
                select
                label="Contact"
                value={form.contact ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    contact: e.target.value ? Number(e.target.value) : null,
                  })
                }
                fullWidth
              >
                <MenuItem value="">None</MenuItem>
                {contactsQuery.data?.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.first_name} {c.last_name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Company"
                value={form.company ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    company: e.target.value ? Number(e.target.value) : null,
                  })
                }
                fullWidth
              >
                <MenuItem value="">None</MenuItem>
                {companiesQuery.data?.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Amount"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
                fullWidth
                inputProps={{ inputMode: "decimal" }}
              />
              <TextField
                select
                label="Stage"
                value={form.stage}
                onChange={(e) =>
                  setForm({ ...form, stage: e.target.value as DealStage })
                }
                fullWidth
              >
                {STAGES.map((s) => (
                  <MenuItem key={s.value} value={s.value}>
                    {s.label}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <TextField
              label="Expected close date"
              type="date"
              value={form.expected_close_date ?? ""}
              onChange={(e) =>
                setForm({ ...form, expected_close_date: e.target.value || null })
              }
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <Stack spacing={0.5}>
              <Typography variant="body2" color="text.secondary">
                Probability: {form.probability}%
              </Typography>
              <Slider
                value={form.probability ?? 0}
                onChange={(_, value) =>
                  setForm({ ...form, probability: value as number })
                }
                min={0}
                max={100}
                step={5}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "space-between", px: 3 }}>
          <div>
            {deal && (
              <Button color="error" onClick={() => setConfirmDelete(true)}>
                Delete
              </Button>
            )}
          </div>
          <Stack direction="row" spacing={1}>
            <Button onClick={onClose}>Cancel</Button>
            <Button variant="contained" onClick={handleSubmit} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
      <ConfirmDialog
        open={confirmDelete}
        title="Delete deal"
        message={`Are you sure you want to delete "${deal?.title}"? This cannot be undone.`}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => deleteMutation.mutate()}
        loading={deleteMutation.isPending}
      />
    </>
  );
}
