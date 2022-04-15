import AppBar from "@mui/material/AppBar";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import { styled } from "@mui/system";
import { Typography } from "@mui/material";

// this is to prevent the header being drawn over the top of the content
const Offset = styled("div")(({ theme }) => theme.mixins['toolbar']);

const Header = () => {
  return(
    <>
      <AppBar position="fixed">
        <Toolbar>
          <Container maxWidth="lg" sx={{ display: `flex`, justifyContent: `space-between` }}>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ mr: 2, display: { xs: 'none', md: 'flex' } }}
            >
              LeagueWizard
            </Typography>
          </Container>
        </Toolbar>
      </AppBar>
      <Offset />
    </>
  );
}

export default Header;
