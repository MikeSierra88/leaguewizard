import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { getPrisma } from '../../../../prisma/prisma.service';
import { queryToString } from '../../../../lib/queryUtils';

export default withApiAuthRequired(async (req, res) => {
  const { method } = req;
  const teamId = queryToString(req.query.teamId);
  const { user } = getSession(req, res);

  const prisma = getPrisma();

  switch (method) {
    case 'POST':
      try {
        const team = await prisma.team.findUnique({
          where: { id: teamId },
          include: { league: true },
        });
        if (user.sub !== team.league.owner) {
          return res.status(401).json({ success: false });
        }
        await prisma.team.update({
          where: { id: teamId },
          data: { confirmed: true },
        });
        return res.status(200).json({ success: true });
      } catch (e) {
        console.error(e);
        return res.status(400).json({ success: false, e });
      }
    default:
      return res.status(405).json({ success: false });
  }
});
