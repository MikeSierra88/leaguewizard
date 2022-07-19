import React from 'react';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Grid,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { League } from '../../../models/LeagueModel';
import MuiNextLink from '@components/navigation/MuiNextLink';
import { useUser } from '@auth0/nextjs-auth0';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

type Props = {
  league: League,
};

const LeagueListItem = ({ league }: Props) => {
  const { user } = useUser();

  const ownerIcon =
    user?.sub === league.owner ? (
      <Tooltip title="You are the owner of this league">
        <CheckCircleIcon color="primary" />
      </Tooltip>
    ) : (
      <></>
    );

  return (
    <Grid item md={3}>
      <Card sx={{ minWidth: 275 }}>
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h5" component="div">
              {league.name}
            </Typography>
            {ownerIcon}
          </Stack>
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
