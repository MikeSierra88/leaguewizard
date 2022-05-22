import React from 'react';
import { useUser, withPageAuthRequired } from '@auth0/nextjs-auth0';

const ProfilePage = withPageAuthRequired(() => {
  const { user } = useUser();

  return <h1>This is the profile page {user.nickname}</h1>;
});

export default ProfilePage;
