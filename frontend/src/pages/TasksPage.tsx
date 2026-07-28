import { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTask,
  deleteTask,
  listTasks,
  updateTask,
  type TaskPayload,
} from "../api/tasks";
import { listAllDeals } from "../api/deals";
import { listAllContacts } from "../api/contacts";
import { listUsers } from "../api/users";
import { useAuth } from "../context/AuthContext";
import type { Task, TaskStatus } from "../types";
import { extractErrorMessage } from "../api/client";
import { EmptyState, ErrorState, LoadingState } from "../components/StateDisplay";
import { ConfirmDialog } from "../components/ConfirmDialog";

const emptyForm: TaskPayload = {
  title: "",
  description: "",
  due_date: null,
  status: "open",
  deal: null,
  contact: null,
};

export function TasksPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [form, setForm] = useState<TaskPayload>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);

  const tasksQuery = useQuery({
    queryKey: ["tasks", statusFilter],
    queryFn: () =>
      listTasks(statusFilter === "all" ? undefined : { status: statusFilter }),
  });

  const dealsQuery = useQuery({
    queryKey: ["deals-all"],
    queryFn: () => listAllDeals(),
    enabled: dialogOpen,
  });
  const contactsQuery = useQuery({
    queryKey: ["contacts-all"],
    queryFn: listAllContacts,
    enabled: dialogOpen,
  });
  const usersQuery = useQuery({
    queryKey: ["users-all"],
    queryFn: listUsers,
    enabled: dialogOpen && isAdmin,
  });

  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      closeDialog();
    },
    onError: (err) => setFormError(extractErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<TaskPayload> }) =>
      updateTask(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      closeDialog();
    },
    onError: (err) => setFormError(extractErrorMessage(err)),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: TaskStatus }) =>
      updateTask(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setDeleteTarget(null);
    },
  });

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setDialogOpen(true);
  }

  function openEdit(task: Task) {
    setEditing(task);
    setForm({
      title: task.title,
      description: task.description,
      due_date: task.due_date ? task.due_date.slice(0, 16) : null,
      status: task.status,
      deal: task.deal,
      contact: task.contact,
      assignee: task.assignee,
    });
    setFormError(null);
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditing(null);
    setFormError(null);
  }

  function handleSubmit() {
    if (!form.title.trim()) {
      setFormError("Title is required");
      return;
    }
    if (!form.due_date) {
      setFormError("Due date is required");
      return;
    }
    const payload: TaskPayload = { ...form };
    if (editing) {
      updateMutation.mutate({ id: editing.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const tasks = tasksQuery.data?.results ?? [];

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight={700}>
          Tasks
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          New task
        </Button>
      </Stack>

      <Tabs
        value={statusFilter}
        onChange={(_, value) => setStatusFilter(value)}
        sx={{ mb: 2 }}
      >
        <Tab label="All" value="all" />
        <Tab label="Open" value="open" />
        <Tab label="Done" value="done" />
      </Tabs>

      <Paper variant="outlined">
        {tasksQuery.isLoading ? (
          <LoadingState label="Loading tasks..." />
        ) : tasksQuery.isError ? (
          <ErrorState message={extractErrorMessage(tasksQuery.error)} />
        ) : tasks.length === 0 ? (
          <EmptyState message="No tasks found." />
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox" />
                  <TableCell>Title</TableCell>
                  <TableCell>Due date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Deal</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Assignee</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={task.status === "done"}
                        onChange={() =>
                          toggleMutation.mutate({
                            id: task.id,
                            status: task.status === "done" ? "open" : "done",
                          })
                        }
                      />
                    </TableCell>
                    <TableCell
                      sx={{
                        textDecoration:
                          task.status === "done" ? "line-through" : "none",
                        color: task.status === "done" ? "text.secondary" : "inherit",
                      }}
                    >
                      {task.title}
                    </TableCell>
                    <TableCell>
                      {task.due_date
                        ? new Date(task.due_date).toLocaleString()
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={task.status}
                        size="small"
                        color={task.status === "done" ? "success" : "default"}
                        variant={task.status === "done" ? "filled" : "outlined"}
                      />
                    </TableCell>
                    <TableCell>{task.deal_title || "—"}</TableCell>
                    <TableCell>{task.contact_name || "—"}</TableCell>
                    <TableCell>{task.assignee_username}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => openEdit(task)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => setDeleteTarget(task)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? "Edit task" : "New task"}</DialogTitle>
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
            <TextField
              label="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              fullWidth
              multiline
              minRows={2}
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="Due date"
                type="datetime-local"
                value={form.due_date ?? ""}
                onChange={(e) => setForm({ ...form, due_date: e.target.value || null })}
                InputLabelProps={{ shrink: true }}
                required
                fullWidth
              />
              <TextField
                select
                label="Status"
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as TaskStatus })
                }
                fullWidth
              >
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="done">Done</MenuItem>
              </TextField>
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField
                select
                label="Deal"
                value={form.deal ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    deal: e.target.value ? Number(e.target.value) : null,
                  })
                }
                fullWidth
              >
                <MenuItem value="">None</MenuItem>
                {dealsQuery.data?.map((d) => (
                  <MenuItem key={d.id} value={d.id}>
                    {d.title}
                  </MenuItem>
                ))}
              </TextField>
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
            </Stack>
            {isAdmin && (
              <TextField
                select
                label="Assignee"
                value={form.assignee ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    assignee: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                fullWidth
                helperText="Only admins can assign tasks to other users"
              >
                <MenuItem value="">Myself</MenuItem>
                {usersQuery.data?.results.map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.username}
                  </MenuItem>
                ))}
              </TextField>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete task"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        loading={deleteMutation.isPending}
      />
    </Box>
  );
}
