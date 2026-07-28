import { useDroppable } from "@dnd-kit/core";
import { Box, Paper, Stack, Typography } from "@mui/material";
import type { Deal, DealStage } from "../types";
import { DealCard } from "./DealCard";

interface DealColumnProps {
  stage: DealStage;
  label: string;
  deals: Deal[];
  onCardClick: (deal: Deal) => void;
}

export function DealColumn({ stage, label, deals, onCardClick }: DealColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });

  const total = deals.reduce((sum, d) => sum + Number(d.amount || 0), 0);

  return (
    <Paper
      variant="outlined"
      sx={{
        width: 260,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        bgcolor: isOver ? "action.hover" : "background.paper",
        transition: "background-color 0.15s",
      }}
    >
      <Box sx={{ p: 1.5, borderBottom: "1px solid", borderColor: "divider" }}>
        <Typography variant="subtitle2" fontWeight={700}>
          {label}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {deals.length} deal{deals.length === 1 ? "" : "s"} · $
          {total.toLocaleString()}
        </Typography>
      </Box>
      <Box
        ref={setNodeRef}
        sx={{
          p: 1.25,
          flexGrow: 1,
          minHeight: 200,
          maxHeight: "calc(100vh - 260px)",
          overflowY: "auto",
        }}
      >
        <Stack>
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} onClick={() => onCardClick(deal)} />
          ))}
        </Stack>
      </Box>
    </Paper>
  );
}
