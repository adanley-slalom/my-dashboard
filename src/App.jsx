import * as React from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Stack,
  Chip,
  Avatar,
  Divider,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Button,
  IconButton,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from '@mui/material';
import {
  ArrowUpward,
  ArrowDownward,
  TrendingUp,
  Insights,
  NotificationsActive,
  MoreVert,
  Speed,
  Group,
  AttachMoney,
} from '@mui/icons-material';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1e88e5' },
    secondary: { main: '#6c63ff' },
    success: { main: '#2e7d32' },
    warning: { main: '#ef6c00' },
    background: { default: '#f4f7fb', paper: '#ffffff' },
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
});

const metrics = [
  {
    title: 'Revenue',
    value: '$2.4M',
    delta: '+12.4%',
    positive: true,
    icon: AttachMoney,
    color: '#2e7d32',
  },
  {
    title: 'Active Users',
    value: '48.2K',
    delta: '+8.1%',
    positive: true,
    icon: Group,
    color: '#1e88e5',
  },
  {
    title: 'Conversion',
    value: '6.8%',
    delta: '-1.2%',
    positive: false,
    icon: Speed,
    color: '#ef6c00',
  },
];

const priorities = [
  { label: 'Retention campaign', value: 82, tint: '#1e88e5' },
  { label: 'Cross-sell lift', value: 67, tint: '#6c63ff' },
  { label: 'Ops efficiency', value: 74, tint: '#2e7d32' },
];

const activity = [
  { title: 'Q3 forecast updated', detail: 'Leadership review completed', time: '12 min ago' },
  { title: 'New priority flagged', detail: 'Customer health dipped in segment B', time: '35 min ago' },
  { title: 'Weekly rollout ready', detail: 'Launch checklist approved', time: '1 hr ago' },
];

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
        <Container maxWidth="xl">
          <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: 4, mb: 3, bgcolor: 'background.paper' }}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}>
              <Box>
                <Typography variant="overline" color="primary" sx={{ letterSpacing: 1.5 }}>
                  Executive Overview
                </Typography>
                <Typography variant="h4">Leadership dashboard</Typography>
                <Typography variant="body1" color="text.secondary">
                  A Material Design-inspired view for tracking momentum, priorities, and current performance.
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip label="Live snapshot" color="success" variant="outlined" />
                <Button variant="contained" startIcon={<Insights />}>Export</Button>
              </Stack>
            </Stack>
          </Paper>

          <Grid container spacing={3}>
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <Grid item xs={12} md={4} key={metric.title}>
                  <Paper elevation={0} sx={{ p: 3, borderRadius: 4, height: '100%' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="body2" color="text.secondary">{metric.title}</Typography>
                        <Typography variant="h5" sx={{ mt: 0.5 }}>{metric.value}</Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: `${metric.color}14`, color: metric.color }}>
                        <Icon />
                      </Avatar>
                    </Stack>
                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 2 }}>
                      {metric.positive ? <ArrowUpward color="success" fontSize="small" /> : <ArrowDownward color="warning" fontSize="small" />}
                      <Typography variant="body2" color={metric.positive ? 'success.main' : 'warning.main'}>
                        {metric.delta} vs last period
                      </Typography>
                    </Stack>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>

          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            <Grid item xs={12} lg={8}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 4 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="h6">Performance trend</Typography>
                    <Typography variant="body2" color="text.secondary">Year-over-year pattern across core initiatives</Typography>
                  </Box>
                  <Chip icon={<TrendingUp />} label="+18.2%" color="success" variant="outlined" />
                </Stack>
                <Box sx={{ height: 260, borderRadius: 3, bgcolor: '#f8fbff', p: 2, display: 'flex', alignItems: 'flex-end', gap: 1.5 }}>
                  {[48, 72, 64, 82, 90, 86, 95].map((height, index) => (
                    <Box key={index} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: '100%', height: 180, borderRadius: 2, bgcolor: index === 6 ? '#1e88e5' : '#dcecff', position: 'relative', overflow: 'hidden' }}>
                        <Box sx={{ position: 'absolute', bottom: 0, width: '100%', height: `${height}%`, bgcolor: index === 6 ? '#1565c0' : '#8ec5ff', borderRadius: 'inherit' }} />
                      </Box>
                      <Typography variant="caption" color="text.secondary">Q{index + 1}</Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} lg={4}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 4, height: '100%' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6">Key priorities</Typography>
                  <IconButton size="small"><MoreVert /></IconButton>
                </Stack>
                <Stack spacing={2}>
                  {priorities.map((item) => (
                    <Box key={item.label}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="body2">{item.label}</Typography>
                        <Typography variant="body2" color="text.secondary">{item.value}%</Typography>
                      </Stack>
                      <LinearProgress variant="determinate" value={item.value} sx={{ height: 8, borderRadius: 999, bgcolor: '#edf3ff', '& .MuiLinearProgress-bar': { bgcolor: item.tint } }} />
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={7}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 4 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6">Executive summary</Typography>
                  <Chip label="Updated today" variant="outlined" />
                </Stack>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  Momentum remains positive with strong adoption and healthy forecast visibility. The immediate focus is concentration on retention and efficiency improvements before the next review.
                </Typography>
                <Divider sx={{ my: 2 }} />
                <List disablePadding>
                  {activity.map((item) => (
                    <ListItem key={item.title} disablePadding sx={{ py: 1 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <NotificationsActive />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={item.title} secondary={`${item.detail} • ${item.time}`} />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>

            <Grid item xs={12} md={5}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 4 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Team pulse</Typography>
                <Stack spacing={2}>
                  <Box sx={{ p: 2, borderRadius: 3, bgcolor: '#f8fbff' }}>
                    <Typography variant="subtitle2">Engagement</Typography>
                    <Typography variant="h4" sx={{ mt: 0.5 }}>91%</Typography>
                    <Typography variant="body2" color="text.secondary">Cross-team clarity is high, with strong alignment on the current roadmap.</Typography>
                  </Box>
                  <Box sx={{ p: 2, borderRadius: 3, bgcolor: '#f8fbff' }}>
                    <Typography variant="subtitle2">Next checkpoint</Typography>
                    <Typography variant="body1" sx={{ mt: 0.5 }}>Friday • 10:30 AM</Typography>
                    <Typography variant="body2" color="text.secondary">Executive review with product, ops, and growth leadership.</Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
