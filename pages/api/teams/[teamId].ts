import { withApiAuthRequired } from '@auth0/nextjs-auth0';

export default withApiAuthRequired(async (req, res) => {
  const { method } = req;

  switch (method) {
    default:
      return res.status(405).json({ success: false });
  }
});
