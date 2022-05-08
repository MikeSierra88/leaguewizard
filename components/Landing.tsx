import Grid from "@mui/material/Grid";
import Image from "next/image";
import { Button, Typography } from "@mui/material";
import MuiNextLink from "@components/navigation/MuiNextLink";
import { useUser } from "@auth0/nextjs-auth0";

const Landing = ({ imgSrc, imgAlt, title, subtitle }) => {
  const { user } = useUser();
  const landingButton = user ? {
    label: "Go To My Dashboard", path: "/dashboard"
  } : {
    label: "Login / Sign up", path: "/api/auth/login"
  };

  return (
    <Grid
      component="section"
      container
      sx={{
        position: `relative`,
        height: `100vh`,
        width: `100vw`,
        overflow: `hidden`,
      }}
    >
      <Image src={imgSrc} alt={imgAlt} layout="fill" objectFit="cover" />
      <Grid
        container
        sx={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0, .7)"
        }}
      />
      <Grid
        container
        item
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        sx={{
          zIndex: 15
        }}
      >
        <Typography
          variant="h1"
          align="center"
          gutterBottom
          sx={{
            color: "secondary.main",
            fontWeight: 400
          }}
        >
          {title}
        </Typography>
        <Typography
          component="p"
          variant="h3"
          align="center"
          color="common.white"
          sx={{
            mb: 10
          }}
        >
          {subtitle}
        </Typography>
        {/*Todo: This button isn't working for some reason.*/}
        <MuiNextLink
          href={landingButton.path}
          variant="button"
          underline="hover"
          sx={{
            zIndex: 9000
          }}
        >
          <Button variant="contained" size="large">
            {landingButton.label}
          </Button>
        </MuiNextLink>
      </Grid>
    </Grid>

  );
};

export default Landing;
