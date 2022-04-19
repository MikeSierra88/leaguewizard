import { withPageAuthRequired } from "@auth0/nextjs-auth0";

const DashboardPage = withPageAuthRequired(() => {
  return (
    <h1>This is the dashboard</h1>
  );
});

export default DashboardPage;

