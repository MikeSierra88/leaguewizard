import AppBar from "@mui/material/AppBar";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import { styled } from "@mui/system";
import { Typography } from "@mui/material";
import Navbar from "@components/navigation/Navbar";
import SideDrawer from "@components/navigation/SideDrawer";
import { NavLink } from "../models/NavLink";
import HideOnScroll from "@components/navigation/HideOnScroll";

// this is to prevent the header being drawn over the top of the content
const Offset = styled("div")(({ theme }) => theme.mixins["toolbar"]);

const navLinks: NavLink[] = [
  { title: `dashboard`, path: `/dashboard` },
  { title: `profile`, path: `/profile` }
];

const Header = () => {
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
              <Navbar navLinks={navLinks} />
              <SideDrawer navLinks={navLinks} />
            </Container>
          </Toolbar>
        </AppBar>
      </HideOnScroll>
      <Offset />
    </>
  );
};

export default Header;
