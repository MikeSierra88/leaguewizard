import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import League from '../../../../models/League';
import dbConnect from '../../../../lib/dbConnect';
import InviteCode from '../../../../models/InviteCode';

export default withApiAuthRequired(async (req, res) => {
  const { method } = req;
  const { leagueId } = req.query;
  const { user } = getSession(req, res);

  await dbConnect();

  const generateCode = async () => {
    let code;
    let foundValidCode = false;
    while (!foundValidCode) {
      code = '';
      for (code; code.length < 7; ) {
        code =
          code +
          '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'[
            (Math.random() * 60) | 0
          ];
      }
      const existingCodes = await InviteCode.find({ code });
      // InviteCode.find() returns an empty array if didn't find anything
      if (existingCodes.length === 0) {
        foundValidCode = true;
      }
    }
    return code;
  };

  try {
    let leagueToUpdate;
    switch (method) {
      case 'GET':
        leagueToUpdate = await League.findById(leagueId);
        if (!leagueToUpdate) {
          res.status(404).json({ success: false });
        }
        if (leagueToUpdate.owner === user.sub) {
          const inviteCode = await generateCode();
          const codeInDb = await InviteCode.create({
            code: inviteCode,
            league: leagueId,
          });
          await League.findByIdAndUpdate(leagueToUpdate._id, {
            inviteCode: codeInDb._id,
          });
          res.status(200).json({ success: true, data: inviteCode });
        } else {
          res.status(401).json({ success: false });
        }
        break;
      case 'DELETE':
        leagueToUpdate = await League.findById(leagueId);
        const inviteCodeToRemove = await InviteCode.findOne({
          league: leagueId,
        });
        if (!leagueToUpdate || !inviteCodeToRemove) {
          if (inviteCodeToRemove) {
            await InviteCode.findByIdAndDelete(inviteCodeToRemove._id);
          }
          res.status(404).json({ success: false });
        }
        if (leagueToUpdate.owner === user.sub) {
          await InviteCode.findByIdAndDelete(inviteCodeToRemove);
          await League.findByIdAndUpdate(leagueToUpdate._id, {
            inviteCode: null,
          });
          res.status(204).end();
        } else {
          res.status(401).json({ success: false });
        }
        break;
      default:
        res.status(405).json({ success: false });
    }
  } catch (error) {
    console.error('Error while processing GET', error);
    res.status(400).json({ success: false, error });
  }
});
