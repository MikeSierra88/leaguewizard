import React from 'react';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Grid,
  Typography,
} from '@mui/material';
import { League } from '../../../models/LeagueModel';
import MuiNextLink from '@components/navigation/MuiNextLink';

type Props = {
  league: League,
};

const LeagueListItem = ({ league }: Props) => {
  return (
    <Grid item md={3}>
      <Card sx={{ minWidth: 275 }}>
        <CardContent>
          <Typography variant="h5" component="div">
            {league.name}
          </Typography>
        </CardContent>
        <CardActions>
          <MuiNextLink
            href={`leagues/${league._id}`}
            variant="button"
            underline="hover"
          >
            <Button size="small">Details</Button>
          </MuiNextLink>
        </CardActions>
      </Card>
    </Grid>
  );
};

export default LeagueListItem;
