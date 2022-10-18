import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { getPrisma } from '../../../../prisma/prisma.service';
import { queryToString } from '../../../../lib/queryUtils';

export default withApiAuthRequired(async (req, res) => {
  const { method } = req;
  const leagueId = queryToString(req.query.leagueId);
  const { user } = getSession(req, res);

  const prisma = getPrisma();

  switch (method) {
    case 'GET':
      try {
        const league = await prisma.league.findUnique({ where: { id: leagueId } });
        if (league.owner === user.sub || league.participants.includes(user.sub)) {
          const teams = await prisma.team.findMany({ where: { leagueId: leagueId } });
          return res.status(200).json({ success: true, data: teams });
        }
        return res.status(401).json({ success: false });
      } catch (error) {
        console.error('Error while processing GET', error);
        return res.status(400).json({ success: false, error });
      }
    default:
      return res.status(405).json({ success: false });
  }
});
