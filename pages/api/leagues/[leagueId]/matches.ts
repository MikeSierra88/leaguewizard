import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import Errors from '../../../../models/Errors';
import { getPrisma } from '../../../../prisma/prisma.service';
import { queryToString } from '../../../../lib/queryUtils';

export default withApiAuthRequired(async (req, res) => {
  const { method } = req;
  const leagueId = queryToString(req.query.leagueId);
  const team = queryToString(req.query.team);
  const { user } = getSession(req, res);

  const prisma = getPrisma();

  switch (method) {
    case 'GET':
      try {
        const league = await prisma.league.findUnique({ where: { id: leagueId } });
        if (league.owner === user.sub || league.participants.includes(user.sub)) {
          let matches;
          matches = await prisma.match.findMany({
            where: !!team
              ? {
                  leagueId: leagueId,
                  OR: [
                    {
                      homeTeamId: team,
                    },
                    {
                      awayTeamId: team,
                    },
                  ],
                }
              : { leagueId: leagueId },
            include: {
              homeTeam: true,
              awayTeam: true,
            },
          });
          return res.status(200).json({ success: true, data: matches });
        } else {
          return res.status(401).json({ success: false });
        }
      } catch (error) {
        console.error('Error while processing GET', error);
        return res.status(400).json({ success: false, error });
      }
    case 'POST':
      try {
        const league = await prisma.league.findUnique({ where: { id: leagueId } });
        if (!league.participants.includes(user.sub) && league.owner !== user.sub) {
          return res.status(401).json({ success: false });
        }
        const newMatchInDB = await prisma.match.create({
          data: {
            homeScore: Number(req.body.homeScore),
            awayScore: Number(req.body.awayScore),
            confirmed: true,
            league: { connect: { id: leagueId } },
            homeTeam: { connect: { id: req.body.homeTeam } },
            awayTeam: { connect: { id: req.body.awayTeam } },
          },
        });
        // TODO: implement match confirmation
        // disabling match confirmation for MVP
        // if (league.owner === user.sub) {
        //   newMatch.confirmed = true;
        // }
        return res.status(201).json({ success: true, data: newMatchInDB });
      } catch (error) {
        console.error('Error while processing POST', error);
        return res.status(400).json({ success: false, error });
      }
    case 'DELETE':
      if (!leagueId) {
        return res.status(400).json({ success: false, error: Errors.NO_LEAGUE_ID_PROVIDED });
      }
      try {
        const league = await prisma.league.findUnique({ where: { id: leagueId } });
        if (!league || league.owner !== user.sub) {
          return res.status(401).json({ success: false });
        }
        await prisma.match.deleteMany({ where: { leagueId: leagueId } });
        return res.status(200).json({ success: true });
      } catch (error) {
        console.error('Error while processing DELETE', error);
        return res.status(400).json({ success: false, error });
      }
    default:
      return res.status(405).json({ success: false });
  }
});
