import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  Divider,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBackOutlined";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getContact } from "../api/contacts";
import { createActivity } from "../api/activities";
import type { ActivityType } from "../types";
import { extractErrorMessage } from "../api/client";
import { EmptyState, ErrorState, LoadingState } from "../components/StateDisplay";
import { NotFoundPage } from "./NotFoundPage";

const ACTIVITY_TYPES: { value: ActivityType; label: string }[] = [
  { value: "call", label: "Call" },
  { value: "email", label: "Email" },
  { value: "meeting", label: "Meeting" },
  { value: "note", label: "Note" },
];

export function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const contactId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [type, setType] = useState<ActivityType>("note");
  const [text, setText] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const contactQuery = useQuery({
    queryKey: ["contact", contactId],
    queryFn: () => getContact(contactId),
    enabled: Number.isFinite(contactId),
    retry: false,
  });

  const activityMutation = useMutation({
    mutationFn: createActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact", contactId] });
      setText("");
      setFormError(null);
    },
    onError: (err) => setFormError(extractErrorMessage(err)),
  });

  if (contactQuery.isLoading) {
    return <LoadingState label="Loading contact..." />;
  }

  if (contactQuery.isError) {
    return <NotFoundPage />;
  }

  const contact = contactQuery.data;
  if (!contact) return <NotFoundPage />;

  function handleLogActivity() {
    if (!text.trim()) {
      setFormError("Activity text is required");
      return;
    }
    activityMutation.mutate({ contact: contactId, type, text });
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate("/contacts")}
        sx={{ mb: 2 }}
      >
        Back to contacts
      </Button>

      <Stack direction="row" spacing={3} alignItems="flex-start">
        <Paper variant="outlined" sx={{ p: 3, flex: 1, maxWidth: 420 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            {contact.first_name} {contact.last_name}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {contact.position || "No position set"}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Stack spacing={1.2}>
            <DetailRow label="Email" value={contact.email} />
            <DetailRow label="Phone" value={contact.phone} />
            <DetailRow label="Company" value={contact.company_name} />
            <DetailRow label="Owner" value={contact.owner_username} />
            <DetailRow label="Notes" value={contact.notes} />
          </Stack>
        </Paper>

        <Box sx={{ flex: 2 }}>
          <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} mb={1.5}>
              Log an activity
            </Typography>
            {formError && <ErrorState message={formError} />}
            <Stack direction="row" spacing={2} mb={2}>
              <TextField
                select
                label="Type"
                value={type}
                onChange={(e) => setType(e.target.value as ActivityType)}
                sx={{ width: 160 }}
              >
                {ACTIVITY_TYPES.map((t) => (
                  <MenuItem key={t.value} value={t.value}>
                    {t.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Notes"
                value={text}
                onChange={(e) => setText(e.target.value)}
                fullWidth
                multiline
                minRows={1}
              />
            </Stack>
            <Button
              variant="contained"
              onClick={handleLogActivity}
              disabled={activityMutation.isPending}
            >
              {activityMutation.isPending ? "Logging..." : "Log activity"}
            </Button>
          </Paper>

          <Typography variant="subtitle1" fontWeight={600} mb={1.5}>
            Activity timeline
          </Typography>
          {contact.activities.length === 0 ? (
            <EmptyState message="No activities logged yet." />
          ) : (
            <Stack spacing={1.5}>
              {[...contact.activities]
                .sort(
                  (a, b) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()
                )
                .map((activity) => (
                  <Paper key={activity.id} variant="outlined" sx={{ p: 2 }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={0.5}
                    >
                      <Chip
                        label={activity.type}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Typography variant="caption" color="text.secondary">
                        {activity.created_by_username} ·{" "}
                        {new Date(activity.created_at).toLocaleString()}
                      </Typography>
                    </Stack>
                    <Typography variant="body2">{activity.text}</Typography>
                  </Paper>
                ))}
            </Stack>
          )}
        </Box>
      </Stack>
    </Box>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2">{value || "—"}</Typography>
    </Box>
  );
}
