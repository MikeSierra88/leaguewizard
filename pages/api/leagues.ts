import dbConnect from '../../lib/dbConnect';
import League from '../../models/League';
import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';

export default withApiAuthRequired(async function handler(req, res) {
  const { method } = req;
  const { user } = getSession(req, res);

  await dbConnect();

  switch (method) {
    case 'GET':
      try {
        const leagues = await League.find({
          participants: { $all: [user.sub] },
        });
        res.status(200).json({ success: true, data: leagues });
      } catch (error) {
        console.error('Error while processing GET', error);
        res.status(400).json({ success: false, error });
      }
      break;
    case 'POST':
      try {
        console.log(req.body);
        const league = await League.create(req.body);
        res.status(201).json({ success: true, data: league });
      } catch (error) {
        res.status(400).json({ success: false, error });
      }
      break;
    default:
      res.status(400).json({ success: false });
      break;
  }
});
