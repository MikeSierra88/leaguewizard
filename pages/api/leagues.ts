import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { getPrisma } from '../../prisma/prisma.service';

export default withApiAuthRequired(async function handler(req, res) {
  const { method } = req;
  const { user } = getSession(req, res);

  const prisma = getPrisma();

  switch (method) {
    case 'GET':
      try {
        const leagues = await prisma.league.findMany({
          where: {
            participants: { contains: user.sub },
          },
          select: {
            id: true,
            name: true,
            owner: true,
            createdDate: true,
          },
        });
        return res.status(200).json({ success: true, data: leagues });
      } catch (error) {
        console.error('Error while processing GET', error);
        return res.status(400).json({ success: false, error });
      }
    case 'POST':
      try {
        const createLeague = await prisma.league.create({
          data: {
            ...req.body.league,
            teams: {
              create: [
                {
                  ...req.body.team,
                  confirmed: true,
                },
              ],
            },
          },
        });
        return res.status(201).json({ success: true, data: { league: { ...createLeague } } });
      } catch (error) {
        return res.status(400).json({ success: false, error });
      }
    default:
      return res.status(405).json({ success: false });
  }
});
