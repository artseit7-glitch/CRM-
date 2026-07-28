import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Box,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import {
  fetchManagerActivity,
  fetchPipelineAnalytics,
  fetchRevenueByMonth,
} from "../api/analytics";
import { useAuth } from "../context/AuthContext";
import { STAGE_LABELS } from "../constants";
import { EmptyState, ErrorState, LoadingState } from "../components/StateDisplay";
import { StatTile } from "../components/StatTile";

const SEQUENTIAL_BLUE = "#2a78d6";
const GRID_COLOR = "#e1e0d9";
const AXIS_COLOR = "#898781";
const MUTED_TEXT = "#52514e";

const axisTickStyle = { fontSize: 12, fill: MUTED_TEXT };

function formatCurrency(n: number) {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function formatMonth(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
}

export function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const pipelineQuery = useQuery({
    queryKey: ["analytics-pipeline"],
    queryFn: fetchPipelineAnalytics,
  });
  const revenueQuery = useQuery({
    queryKey: ["analytics-revenue"],
    queryFn: fetchRevenueByMonth,
  });
  const managerQuery = useQuery({
    queryKey: ["analytics-manager-activity"],
    queryFn: fetchManagerActivity,
    enabled: isAdmin,
  });

  const pipelineData =
    pipelineQuery.data?.by_stage.map((s) => ({
      stage: STAGE_LABELS[s.stage] ?? s.stage,
      count: s.count,
      amount: Number(s.total_amount),
    })) ?? [];

  const revenueData =
    revenueQuery.data?.map((r) => ({
      month: formatMonth(r.month),
      revenue: r.revenue,
    })) ?? [];

  const managerData =
    managerQuery.data?.map((m) => ({
      owner: m.owner__username,
      deal_count: m.deal_count,
      total_amount: Number(m.total_amount),
    })) ?? [];

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={2}>
        Dashboard
      </Typography>

      <Stack direction="row" spacing={2} mb={3} flexWrap="wrap">
        <StatTile
          label="Total deals"
          value={
            pipelineQuery.data ? String(pipelineQuery.data.total_deals) : "—"
          }
        />
        <StatTile
          label="Conversion rate"
          value={
            pipelineQuery.data
              ? `${pipelineQuery.data.conversion_rate.toFixed(1)}%`
              : "—"
          }
          helpText="Won deals ÷ total deals"
        />
      </Stack>

      <Stack direction="row" spacing={2} mb={3} flexWrap="wrap">
        <Paper variant="outlined" sx={{ p: 2.5, flex: 1, minWidth: 380 }}>
          <Typography variant="subtitle1" fontWeight={600} mb={0.5}>
            Deals by stage
          </Typography>
          <Typography variant="caption" color="text.secondary" mb={1} display="block">
            Number of deals currently in each pipeline stage
          </Typography>
          {pipelineQuery.isLoading ? (
            <LoadingState />
          ) : pipelineQuery.isError ? (
            <ErrorState message="Failed to load pipeline analytics." />
          ) : pipelineData.length === 0 ? (
            <EmptyState message="No deals yet." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={pipelineData} margin={{ left: -12, right: 8 }}>
                <CartesianGrid
                  strokeDasharray="0"
                  vertical={false}
                  stroke={GRID_COLOR}
                />
                <XAxis
                  dataKey="stage"
                  tick={axisTickStyle}
                  axisLine={{ stroke: AXIS_COLOR }}
                  tickLine={false}
                />
                <YAxis
                  tick={axisTickStyle}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  formatter={(value) => [Number(value), "Deals"]}
                  contentStyle={{ fontSize: 13, borderRadius: 8 }}
                />
                <Bar
                  dataKey="count"
                  name="Deals"
                  fill={SEQUENTIAL_BLUE}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Paper>

        <Paper variant="outlined" sx={{ p: 2.5, flex: 1, minWidth: 380 }}>
          <Typography variant="subtitle1" fontWeight={600} mb={0.5}>
            Pipeline value by stage
          </Typography>
          <Typography variant="caption" color="text.secondary" mb={1} display="block">
            Total deal amount currently in each pipeline stage
          </Typography>
          {pipelineQuery.isLoading ? (
            <LoadingState />
          ) : pipelineQuery.isError ? (
            <ErrorState message="Failed to load pipeline analytics." />
          ) : pipelineData.length === 0 ? (
            <EmptyState message="No deals yet." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={pipelineData} margin={{ left: -12, right: 8 }}>
                <CartesianGrid
                  strokeDasharray="0"
                  vertical={false}
                  stroke={GRID_COLOR}
                />
                <XAxis
                  dataKey="stage"
                  tick={axisTickStyle}
                  axisLine={{ stroke: AXIS_COLOR }}
                  tickLine={false}
                />
                <YAxis
                  tick={axisTickStyle}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatCurrency}
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(Number(value)), "Amount"]}
                  contentStyle={{ fontSize: 13, borderRadius: 8 }}
                />
                <Bar
                  dataKey="amount"
                  name="Amount"
                  fill={SEQUENTIAL_BLUE}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Paper>
      </Stack>

      <Paper variant="outlined" sx={{ p: 2.5, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} mb={0.5}>
          Revenue by month
        </Typography>
        <Typography variant="caption" color="text.secondary" mb={1} display="block">
          Sum of won deal amounts, by month
        </Typography>
        {revenueQuery.isLoading ? (
          <LoadingState />
        ) : revenueQuery.isError ? (
          <ErrorState message="Failed to load revenue analytics." />
        ) : revenueData.length === 0 ? (
          <EmptyState message="No revenue recorded yet." />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={revenueData} margin={{ left: -12, right: 16 }}>
              <CartesianGrid strokeDasharray="0" vertical={false} stroke={GRID_COLOR} />
              <XAxis
                dataKey="month"
                tick={axisTickStyle}
                axisLine={{ stroke: AXIS_COLOR }}
                tickLine={false}
              />
              <YAxis
                tick={axisTickStyle}
                axisLine={false}
                tickLine={false}
                tickFormatter={formatCurrency}
              />
              <Tooltip
                formatter={(value) => [formatCurrency(Number(value)), "Revenue"]}
                contentStyle={{ fontSize: 13, borderRadius: 8 }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke={SEQUENTIAL_BLUE}
                strokeWidth={2}
                dot={{ r: 4, fill: SEQUENTIAL_BLUE, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Paper>

      {isAdmin && (
        <Paper variant="outlined" sx={{ p: 2.5 }}>
          <Typography variant="subtitle1" fontWeight={600} mb={0.5}>
            Manager activity
          </Typography>
          <Typography variant="caption" color="text.secondary" mb={1.5} display="block">
            Deal count and value owned by each manager
          </Typography>
          {managerQuery.isLoading ? (
            <LoadingState />
          ) : managerQuery.isError ? (
            <ErrorState message="Failed to load manager activity." />
          ) : managerData.length === 0 ? (
            <EmptyState message="No manager activity yet." />
          ) : (
            <Stack direction="row" spacing={3} flexWrap="wrap">
              <Box sx={{ flex: 1, minWidth: 320 }}>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={managerData} margin={{ left: -12, right: 8 }}>
                    <CartesianGrid
                      strokeDasharray="0"
                      vertical={false}
                      stroke={GRID_COLOR}
                    />
                    <XAxis
                      dataKey="owner"
                      tick={axisTickStyle}
                      axisLine={{ stroke: AXIS_COLOR }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={axisTickStyle}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      formatter={(value) => [Number(value), "Deals"]}
                      contentStyle={{ fontSize: 13, borderRadius: 8 }}
                    />
                    <Bar
                      dataKey="deal_count"
                      name="Deals"
                      fill={SEQUENTIAL_BLUE}
                      radius={[4, 4, 0, 0]}
                      maxBarSize={24}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
              <TableContainer sx={{ flex: 1, minWidth: 320 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Manager</TableCell>
                      <TableCell align="right">Deals</TableCell>
                      <TableCell align="right">Total amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {managerData.map((m) => (
                      <TableRow key={m.owner}>
                        <TableCell>{m.owner}</TableCell>
                        <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>
                          {m.deal_count}
                        </TableCell>
                        <TableCell align="right" sx={{ fontVariantNumeric: "tabular-nums" }}>
                          {m.total_amount.toLocaleString(undefined, {
                            style: "currency",
                            currency: "USD",
                            maximumFractionDigits: 0,
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Stack>
          )}
        </Paper>
      )}
    </Box>
  );
}
