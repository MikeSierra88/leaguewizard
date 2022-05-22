import React from 'react';
import Toolbar from '@mui/material/Toolbar';
import Stack from '@mui/material/Stack';
import MuiNextLink from '@components/navigation/MuiNextLink';
import { NavLink } from '../../models/NavLink';

type Props = {
  navLinks: NavLink[],
};

const Navbar = ({ navLinks }: Props) => {
  return (
    <Toolbar component="nav" sx={{ display: { xs: `none`, md: `flex` } }}>
      <Stack direction="row" spacing={4}>
        {navLinks.map(({ title, path }, i) => (
          <MuiNextLink
            key={`${title}${i}`}
            href={path}
            variant="button"
            activeClassName="active"
            underline="hover"
            sx={{
              color: (theme) => theme.palette.common.white,
              opacity: 0.7,
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
