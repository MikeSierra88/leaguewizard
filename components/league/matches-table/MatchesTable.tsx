import React from 'react';
import useSWR from 'swr';

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
  return <div>Matches: {data.data} (Placeholder)</div>;
};

export default MatchesTable;
