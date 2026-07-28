import type { DealStage } from "./types";

export const STAGES: { value: DealStage; label: string }[] = [
  { value: "new", label: "New" },
  { value: "qualification", label: "Qualification" },
  { value: "proposal", label: "Proposal" },
  { value: "negotiation", label: "Negotiation" },
  { value: "won", label: "Closed — Won" },
  { value: "lost", label: "Closed — Lost" },
];

export const STAGE_LABELS: Record<DealStage, string> = STAGES.reduce(
  (acc, s) => ({ ...acc, [s.value]: s.label }),
  {} as Record<DealStage, string>
);
