import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { getManagementClient } from '../../../lib/auth0management';
import { getPrisma } from '../../../prisma/prisma.service';
import { removeUserFromParticipants } from '../../../lib/calculateTeamData';

export default withApiAuthRequired(async (req, res) => {
  const { method } = req;
  const { userId } = req.query;
  const { user } = getSession(req, res);

  if (user?.sub !== userId) {
    return res.status(403).json({ success: false });
  }

  const managementClient = await getManagementClient();
  const prisma = getPrisma();

  switch (method) {
    case 'DELETE':
      try {
        // delete all leagues of user, including associated matches, teams and invite codes
        const leagues = await prisma.league.findMany({ where: { owner: user.sub } });
        for (const league of leagues) {
          prisma.$transaction([
            prisma.match.deleteMany({ where: { leagueId: league.id } }),
            prisma.team.deleteMany({ where: { leagueId: league.id } }),
            prisma.inviteCode.deleteMany({ where: { leagueId: league.id } }),
            prisma.league.delete({ where: { id: league.id } }),
          ]);
        }
        // delete all teams of user, including associated matches
        const teams = await prisma.team.findMany({ where: { owner: user.sub }, include: { league: true } });
        for (const team of teams) {
          prisma.$transaction([
            prisma.match.deleteMany({
              where: {
                OR: [
                  {
                    homeTeamId: team.id,
                  },
                  {
                    awayTeamId: team.id,
                  },
                ],
              },
            }),
            prisma.team.delete({ where: { id: team.id } }),
            prisma.league.update({
              where: { id: team.leagueId },
              data: { participants: removeUserFromParticipants(team.league.participants, user.sub) },
            }),
          ]);
        }
        // delete user in Auth0
        await managementClient.deleteUser({ id: user.sub });
        return res.status(200).json({ success: true });
      } catch (err) {
        console.error(err);
        return res.status(400).json({ success: false });
      }
    default:
      return res.status(405).json({ success: false });
  }
});
