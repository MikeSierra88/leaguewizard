import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { getPrisma } from '../../../prisma/prisma.service';
import { removeUserFromParticipants } from '../../../lib/calculateTeamData';
import { queryToString } from '../../../lib/queryUtils';

export default withApiAuthRequired(async (req, res) => {
  const { method } = req;
  const teamId = queryToString(req.query.teamId);
  const { user } = getSession(req, res);

  const prisma = getPrisma();

  switch (method) {
    case 'GET':
      try {
        const team = await prisma.team.findUnique({
          where: { id: teamId },
          include: { league: true },
        });
        if (team.league.owner === user.sub || team.league.participants.includes(user.sub)) {
          let teamWithoutLeague = { ...team };
          delete teamWithoutLeague.league;
          return res.status(200).json({ success: true, data: teamWithoutLeague });
        }
        return res.status(401).json({ success: false });
      } catch (error) {
        console.error('Error while processing GET', error);
        return res.status(400).json({ success: false, error });
      }
    case 'DELETE':
      try {
        const team = await prisma.team.findUnique({
          where: { id: teamId },
          include: { league: true },
        });
        if (user.sub !== team.league.owner && user.sub !== team.owner) {
          return res.status(401).json({ success: false });
        }
        await prisma.$transaction([
          prisma.team.update({
            where: { id: teamId },
            data: {
              homeMatches: { deleteMany: {} },
              awayMatches: { deleteMany: {} },
            },
          }),
          prisma.team.delete({ where: { id: teamId } }),
          prisma.league.update({
            where: { id: team.leagueId },
            data: { participants: removeUserFromParticipants(team.league.participants, user.sub) },
          }),
        ]);
        return res.status(200).json({ success: true });
      } catch (err) {
        console.error('Error while processing DELETE', err);
        return res.status(400).json({ success: false, err });
      }
    default:
      return res.status(405).json({ success: false });
  }
});
