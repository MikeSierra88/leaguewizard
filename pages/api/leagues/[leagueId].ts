import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import Errors from '../../../models/Errors';
import { getPrisma } from '../../../prisma/prisma.service';
import { queryToString } from '../../../lib/queryUtils';

export default withApiAuthRequired(async (req, res) => {
  const { method } = req;
  const leagueId = queryToString(req.query.leagueId);
  const { user } = getSession(req, res);

  const prisma = getPrisma();

  switch (method) {
    case 'GET':
      try {
        const league = await prisma.league.findUnique({ where: { id: leagueId } });
        if (league.owner === user.sub) {
          return res.status(200).json({ success: true, data: league });
        }
        if (league.participants.includes(user.sub)) {
          const limitedLeague = await prisma.league.findUnique({
            where: { id: leagueId },
            select: {
              id: true,
              name: true,
              createdDate: true,
            },
          });
          return res.status(200).json({ success: true, data: limitedLeague });
        } else {
          return res.status(401).json({ success: false });
        }
      } catch (error) {
        console.error('Error while processing GET', error);
        return res.status(400).json({ success: false, error });
      }
    case 'PATCH':
      try {
        const updatedLeague = await prisma.league.update({
          where: { id: leagueId },
          data: { ...req.body },
        });
        return res.status(200).json({ success: true, data: updatedLeague });
      } catch (error) {
        console.error('Error while processing PATCH', error);
        return res.status(400).json({ success: false, error });
      }
    case 'DELETE':
      if (!leagueId) {
        return res.status(400).json({ success: false, error: Errors.NO_LEAGUE_ID_PROVIDED });
      }
      try {
        const league = await prisma.league.findUnique({ where: { id: leagueId } });
        if (league.owner !== user.sub) {
          return res.status(401).json({ success: false });
        }
        await prisma.$transaction([
          prisma.inviteCode.deleteMany({ where: { leagueId: league.id } }),
          prisma.league.update({
            where: { id: leagueId },
            data: {
              matches: { deleteMany: {} },
              teams: { deleteMany: {} },
            },
          }),
          prisma.league.delete({ where: { id: leagueId } }),
        ]);
        return res.status(200).json({ success: true });
      } catch (error) {
        console.error('Error while processing DELETE', error);
        return res.status(400).json({ success: false, error });
      }
    default:
      return res.status(405).json({ success: false });
  }
});
