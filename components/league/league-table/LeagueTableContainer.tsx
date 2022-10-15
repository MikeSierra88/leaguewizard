import React, { useEffect, useState } from 'react';
import { Box, Container, Typography } from '@mui/material';
import { Team } from '../../../models/TeamModel';
import { calculateTeamData, teamDataComparator } from '../../../lib/calculateTeamData';
import LeagueTable from '@components/league/league-table/LeagueTable';
import { useUser } from '@auth0/nextjs-auth0';
import { MatchWithTeamData } from '../../../services/matches.service';

type Props = {
  leagueId: string,
  teams: Array<Team>,
  matches: Array<MatchWithTeamData>,
};

const LeagueTableContainer = ({ leagueId, teams, matches }: Props) => {
  const { user } = useUser();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    setRows(
      matches
        ? teams
            .map((team) => {
              const teamData = calculateTeamData(team, matches);
              return {
                teamId: team._id,
                leagueId: leagueId,
                teamName: team.name,
                fifaTeam: team.fifaTeam,
                isOwner: user?.sub === team.owner,
                isConfirmed: team.confirmed,
                ...teamData,
              };
            })
            .sort(teamDataComparator)
            .map((teamRow, i) => {
              return {
                ...teamRow,
                place: i + 1,
              };
            })
        : []
    );
  }, [matches]);

  return (
    <Container sx={{ marginTop: '2rem' }}>
      <Box sx={{ overflow: 'auto' }}>
        <Typography variant="h6">Standings</Typography>
        <LeagueTable rowData={rows}></LeagueTable>
      </Box>
    </Container>
  );
};
export default LeagueTableContainer;
