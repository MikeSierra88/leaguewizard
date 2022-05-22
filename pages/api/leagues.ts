import dbConnect from '../../lib/dbConnect';
import League from '../../models/League';
import { withApiAuthRequired } from '@auth0/nextjs-auth0';

export default withApiAuthRequired(async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    case 'GET':
      try {
        const leagues = await League.find({});
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
