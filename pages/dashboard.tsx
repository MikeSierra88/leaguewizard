import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import React from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import DashLeagues from '@components/dashboard/DashLeagues';
import DashNewLeague from '@components/dashboard/DashNewLeague';

enum TabList {
  LEAGUES,
  NEW_LEAGUE,
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  let dashElement;
  switch (index) {
    case TabList.LEAGUES:
      dashElement = <DashLeagues />;
      break;
    case TabList.NEW_LEAGUE:
      dashElement = <DashNewLeague />;
      break;
  }

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{dashElement}</Box>}
    </div>
  );
}

const DashboardPage = withPageAuthRequired(() => {
  const [value, setValue] = React.useState(TabList.LEAGUES);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <>
      <Box sx={{ width: '100%', bgcolor: 'background.paper' }}>
        <Tabs value={value} onChange={handleChange} centered>
          <Tab label="My Leagues" />
          <Tab label="New League" />
        </Tabs>
      </Box>
      <TabPanel value={value} index={TabList.LEAGUES} />
      <TabPanel value={value} index={TabList.NEW_LEAGUE} />
    </>
  );
});

export default DashboardPage;
