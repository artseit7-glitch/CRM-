import { useDraggable } from "@dnd-kit/core";
import { Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import type { Deal } from "../types";

function formatAmount(amount: string) {
  const n = Number(amount);
  if (Number.isNaN(n)) return amount;
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function DealCard({
  deal,
  onClick,
}: {
  deal: Deal;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: deal.id, data: { deal } });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 10,
      }
    : undefined;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      variant="outlined"
      sx={{
        mb: 1.25,
        opacity: isDragging ? 0.4 : 1,
        cursor: "grab",
        touchAction: "none",
        "&:hover": { borderColor: "primary.main" },
      }}
    >
      <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Typography variant="body2" fontWeight={600} gutterBottom noWrap>
          {deal.title}
        </Typography>
        <Typography variant="caption" color="text.secondary" display="block" noWrap>
          {deal.company_name || "No company"}
        </Typography>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mt={1}
        >
          <Chip label={formatAmount(deal.amount)} size="small" />
          <Typography variant="caption" color="text.secondary">
            {deal.owner_username}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
