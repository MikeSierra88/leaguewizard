import React from 'react';
import { Slide, useScrollTrigger } from '@mui/material';

type Props = {
  children: any,
};

const HideOnScroll = ({ children }: Props) => {
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction={'down'} in={!trigger}>
      {children}
    </Slide>
  );
};

export default HideOnScroll;
