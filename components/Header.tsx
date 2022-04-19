import AppBar from "@mui/material/AppBar";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import { styled } from "@mui/system";
import { Typography } from "@mui/material";
import Navbar from "@components/navigation/Navbar";
import SideDrawer from "@components/navigation/SideDrawer";
import { NavLink } from "../models/NavLink";
import HideOnScroll from "@components/navigation/HideOnScroll";
import { useUser } from "@auth0/nextjs-auth0";

// this is to prevent the header being drawn over the top of the content
const Offset = styled("div")(({ theme }) => theme.mixins["toolbar"]);

const navLinks: NavLink[] = [
  { title: `dashboard`, path: `/dashboard` },
  { title: `profile`, path: `/profile` },
  { title: "logout", path: "/api/auth/logout" }
];

const loggedOutNavLinks: NavLink[] = [
  { title: "login / sign up", path: "/api/auth/login" }
];

const Header = () => {
  const { user } = useUser();

  return (
    <>
      <HideOnScroll>
        <AppBar position="fixed">
          <Toolbar>
            <Container maxWidth="lg" sx={{ display: `flex`, justifyContent: `space-between` }}>
              <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{
                  mr: 2,
                  display: { xs: "none", md: "flex" },
                  alignItems: "center"
                }}
              >
                LeagueWizard
              </Typography>
              <Navbar navLinks={user ? navLinks : loggedOutNavLinks} />
              <SideDrawer navLinks={user ? navLinks : loggedOutNavLinks} />
            </Container>
          </Toolbar>
        </AppBar>
      </HideOnScroll>
      <Offset />
    </>
  );
};

export default Header;
