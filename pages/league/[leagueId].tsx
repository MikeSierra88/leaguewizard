import React, { useState } from 'react';
import { League } from '../../models/League';
import { useUser, withPageAuthRequired } from '@auth0/nextjs-auth0';
import { Button, Container, Stack } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MuiNextLink from '@components/navigation/MuiNextLink';
import ConfirmationDialog, {
  ConfirmationDialogResponse,
} from '@components/core/ConfirmationDialog';
import { useRouter } from 'next/router';

type Props = {
  league: League,
};

const LeagueDetailsPage = ({ league }: Props) => {
  const router = useRouter();
  const { user } = useUser();
  const [open, setOpen] = useState(false);

  const confirmDelete = () => {
    setOpen(true);
  };

  const deleteLeague = (confirmationResponse: string) => {
    setOpen(false);
    if (confirmationResponse === ConfirmationDialogResponse.CONFIRM) {
      fetch(`/api/leagues/${league._id}`, {
        method: 'DELETE',
      })
        .then(() => {
          console.log('League deleted');
          router.push('/dashboard');
        })
        .catch((err) => console.error(err));
    }
  };

  return (
    <Container>
      <Stack
        direction="row"
        justifyContent="space-between"
        sx={{ marginTop: '1rem' }}
      >
        <MuiNextLink href="/dashboard" underline="none">
          <Button variant="contained">Back</Button>
        </MuiNextLink>
        {user && user.sub === league.owner ? (
          <Button
            variant="contained"
            size="small"
            color="error"
            onClick={confirmDelete}
          >
            <DeleteIcon />
          </Button>
        ) : (
          <></>
        )}
      </Stack>
      <h1>
        {league.name}
        {user.sub === league.owner ? (
          <MuiNextLink
            href={`/league/${league._id}/manage`}
            underline="none"
            sx={{ marginLeft: '0.5rem' }}
          >
            <EditIcon />
          </MuiNextLink>
        ) : (
          <></>
        )}
      </h1>
      <ConfirmationDialog
        title="Warning"
        text="You are about to delete this league. This cannot be undone. Do you with to continue?"
        confirmButtonText="Delete"
        open={open}
        onClose={deleteLeague}
      />
    </Container>
  );
};

export default LeagueDetailsPage;

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(ctx) {
    const { leagueId } = ctx.params;

    const res = await fetch(
      `${process.env.API_BASE_URL}api/leagues/${leagueId}`,
      {
        headers: {
          Cookie: ctx.req.headers.cookie,
        },
      }
    );
    const data = await res.json();
    const league: League = data.data;

    return { props: { league } };
  },
});
