import React from 'react';
import { Button } from '@mui/material';
import { League } from '../../../models/League';

type Props = {
  league: League,
  deleteLeague: (leagueId: string) => void,
};

const LeagueListItem = ({ league, deleteLeague }: Props) => {
  const handleDelete = () => {
    deleteLeague(league._id);
  };

  return (
    <div>
      <p>{league.name}</p>
      <Button onClick={handleDelete}>Delete</Button>
    </div>
  );
};

export default LeagueListItem;
