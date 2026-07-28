import { useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listAllDeals, updateDeal } from "../api/deals";
import type { Deal, DealStage } from "../types";
import { ErrorState, LoadingState } from "../components/StateDisplay";
import { DealColumn } from "../components/DealColumn";
import { DealFormDialog } from "../components/DealFormDialog";
import { ImportExportControls } from "../components/ImportExportControls";
import { STAGES } from "../constants";

export function DealsPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Deal | null>(null);
  const [defaultStage, setDefaultStage] = useState<DealStage>("new");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const dealsQuery = useQuery({
    queryKey: ["deals"],
    queryFn: () => listAllDeals(),
  });

  const stageMutation = useMutation({
    mutationFn: ({ id, stage }: { id: number; stage: DealStage }) =>
      updateDeal(id, { stage }),
    onMutate: async ({ id, stage }) => {
      await queryClient.cancelQueries({ queryKey: ["deals"] });
      const previous = queryClient.getQueryData<Deal[]>(["deals"]);
      queryClient.setQueryData<Deal[]>(["deals"], (old) =>
        old?.map((d) => (d.id === id ? { ...d, stage } : d))
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["deals"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
    },
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const deal = active.data.current?.deal as Deal | undefined;
    const newStage = over.id as DealStage;
    if (!deal || deal.stage === newStage) return;
    stageMutation.mutate({ id: deal.id, stage: newStage });
  }

  function openCreate(stage: DealStage) {
    setEditing(null);
    setDefaultStage(stage);
    setDialogOpen(true);
  }

  function openEdit(deal: Deal) {
    setEditing(deal);
    setDialogOpen(true);
  }

  const deals = dealsQuery.data ?? [];

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight={700}>
          Deals
        </Typography>
        <Stack direction="row" spacing={1.5}>
          <ImportExportControls resource="deals" invalidateKey="deals" />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => openCreate("new")}
          >
            New deal
          </Button>
        </Stack>
      </Stack>

      {dealsQuery.isLoading ? (
        <LoadingState label="Loading deals..." />
      ) : dealsQuery.isError ? (
        <ErrorState message="Failed to load deals." />
      ) : (
        <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
          <Stack direction="row" spacing={1.5} sx={{ overflowX: "auto", pb: 1 }}>
            {STAGES.map((stage) => (
              <DealColumn
                key={stage.value}
                stage={stage.value}
                label={stage.label}
                deals={deals.filter((d) => d.stage === stage.value)}
                onCardClick={openEdit}
              />
            ))}
          </Stack>
        </DndContext>
      )}

      <DealFormDialog
        open={dialogOpen}
        deal={editing}
        defaultStage={defaultStage}
        onClose={() => setDialogOpen(false)}
      />
    </Box>
  );
}
