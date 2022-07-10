import React from 'react';
import useSWR from 'swr';
import { Match } from '../../../models/MatchModel';
import { Box, Typography } from '@mui/material';

type Props = {
  leagueId: string,
  teamId?: string,
};

const fetcher = async (url) => {
  const res = await fetch(url);
  return res.json();
};

const MatchesTable = ({ leagueId, teamId }: Props) => {
  const apiUri = teamId
    ? `/api/leagues/${leagueId}/matches?team=${teamId}`
    : `/api/leagues/${leagueId}/matches`;
  const { data, error } = useSWR(apiUri, fetcher);

  if (!data) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error: {error}</div>;
  }

  const matches = data.data.map((match: Match) => (
    <Box key={match._id}>
      <Typography>{match.homeTeam}</Typography>
    </Box>
  ));

  return <div>Matches: {matches}</div>;
};

export default MatchesTable;
