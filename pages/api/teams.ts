import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import Errors from '../../models/Errors';
import { getPrisma } from '../../prisma/prisma.service';

export default withApiAuthRequired(async (req, res) => {
  const { method } = req;
  const { user } = getSession(req, res);

  const prisma = getPrisma();

  switch (method) {
    case 'POST':
      try {
        const inviteCode = await prisma.inviteCode.findUnique({ where: { code: req.body.inviteCode } });
        if (!inviteCode) {
          return res.status(404).end();
        }
        const league = await prisma.league.findUnique({ where: { id: inviteCode.leagueId } });
        if (!league) {
          return res.status(404).end();
        }
        if (league?.participants && league.participants.includes(user.sub)) {
          return res.status(400).json({ success: false, error: Errors.USER_ALREADY_IN_LEAGUE });
        }
        const newTeam = await prisma.team.create({
          data: {
            name: req.body.name,
            fifaTeam: req.body.fifaTeam,
            owner: user.sub,
            league: {
              connect: { id: league.id },
            },
          },
        });
        await prisma.league.update({
          where: { id: league.id },
          data: { participants: `${league.participants} ${user.sub}` },
        });
        return res.status(201).json({ success: true, data: newTeam });
      } catch (error) {
        console.error('Error while processing POST', error);
        return res.status(400).json({ success: false, error });
      }
    default:
      return res.status(405).json({ success: false });
  }
});
