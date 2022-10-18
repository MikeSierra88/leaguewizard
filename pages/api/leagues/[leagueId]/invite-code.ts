import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { getPrisma } from '../../../../prisma/prisma.service';
import { queryToString } from '../../../../lib/queryUtils';

export default withApiAuthRequired(async (req, res) => {
  const { method } = req;
  const leagueId = queryToString(req.query.leagueId);
  const { user } = getSession(req, res);

  const prisma = getPrisma();

  const generateCode = async () => {
    let code;
    let foundValidCode = false;
    while (!foundValidCode) {
      code = '';
      for (code; code.length < 7; ) {
        code = code + '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'[(Math.random() * 60) | 0];
      }
      const existingCode = await prisma.inviteCode.findUnique({
        where: {
          code: code,
        },
      });
      if (!existingCode) {
        foundValidCode = true;
      }
    }
    return code;
  };

  try {
    let leagueToUpdate;
    switch (method) {
      case 'GET':
        leagueToUpdate = await prisma.league.findUnique({
          where: {
            id: leagueId,
          },
        });
        if (!leagueToUpdate) {
          return res.status(404).json({ success: false });
        }
        console.log('leagueToUpdate', leagueToUpdate);
        if (leagueToUpdate.owner === user?.sub) {
          const inviteCode = await generateCode();
          await prisma.inviteCode.create({
            data: {
              code: inviteCode,
              leagueId: leagueId,
              league: {
                connect: { id: leagueId },
              },
            },
          });
          return res.status(200).json({ success: true, data: inviteCode });
        } else {
          return res.status(401).json({ success: false });
        }
      case 'DELETE':
        leagueToUpdate = await prisma.league.findUnique({ where: { id: leagueId } });
        const inviteCodeToRemove = await prisma.inviteCode.findUnique({ where: { leagueId: leagueId } });
        if (!leagueToUpdate || !inviteCodeToRemove) {
          if (inviteCodeToRemove) {
            await prisma.inviteCode.delete({ where: { code: inviteCodeToRemove.code } });
          }
          return res.status(404).json({ success: false });
        }
        if (leagueToUpdate.owner === user?.sub) {
          await prisma.league.update({
            where: {
              id: leagueId,
            },
            data: {
              inviteCode: {
                delete: true,
              },
            },
          });
          return res.status(204).end();
        } else {
          return res.status(401).json({ success: false });
        }
      default:
        return res.status(405).json({ success: false });
    }
  } catch (error) {
    console.error('Error while processing request', error);
    return res.status(400).json({ success: false, error });
  }
});
