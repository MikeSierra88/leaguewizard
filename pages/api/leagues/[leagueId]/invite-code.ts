import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import League from '../../../../models/LeagueModel';
import dbConnect from '../../../../lib/dbConnect';
import InviteCodeModel, {
  InviteCode,
} from '../../../../models/InviteCodeModel';

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
      const existingCodes = await InviteCodeModel.find<InviteCode>({ code });
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
          return res.status(404).json({ success: false });
        }
        if (leagueToUpdate.owner === user.sub) {
          const inviteCode = await generateCode();
          const codeInDb = await InviteCodeModel.create({
            code: inviteCode,
            league: leagueId,
          });
          await League.findByIdAndUpdate(leagueToUpdate._id, {
            inviteCode: codeInDb._id,
          });
          return res.status(200).json({ success: true, data: inviteCode });
        } else {
          return res.status(401).json({ success: false });
        }
      case 'DELETE':
        leagueToUpdate = await League.findById(leagueId);
        const inviteCodeToRemove = await InviteCodeModel.findOne({
          league: leagueId,
        });
        if (!leagueToUpdate || !inviteCodeToRemove) {
          if (inviteCodeToRemove) {
            await InviteCodeModel.findByIdAndDelete(inviteCodeToRemove._id);
          }
          return res.status(404).json({ success: false });
        }
        if (leagueToUpdate.owner === user.sub) {
          await InviteCodeModel.findByIdAndDelete(inviteCodeToRemove);
          await League.findByIdAndUpdate(leagueToUpdate._id, {
            inviteCode: null,
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
