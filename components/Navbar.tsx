import Toolbar from "@mui/material/Toolbar";
import Stack from "@mui/material/Stack";
import MuiNextLink from "@components/MuiNextLink";

const Navbar = ({ navLinks }) => {
  return (
    <Toolbar
      component="nav"
      sx={{ display: { xs: `none`, md: `flex` } }}
    >
      <Stack direction="row" spacing={4}>
        {navLinks.map(({ title, path }, i) => (
          <MuiNextLink
            key={`${title}${i}`}
            href={path}
            variant="button"
            activeClassName="active"
            underline="none"
            sx={{
              color: (theme) => theme.palette.common.white,
              opacity: 0.7
            }}
          >
            {title}
          </MuiNextLink>
        ))}
      </Stack>
    </Toolbar>
  );
};

export default Navbar;
