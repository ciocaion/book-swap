import React, { useEffect, useState } from "react";
import { auth } from "./firebase";
import { User, signOut } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from 'next/router';
import { Box, Button } from "@chakra-ui/react";

const AuthDetails = () => {
  // Component initializing state variables
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [userID, setUserID] = useState<string | null>(null);
  const router = useRouter();

  // useEffect hook to listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) { //exists
        setAuthUser(user);
        setUserID(user.uid);
      } else { // do not exist
        setAuthUser(null);
        setUserID(null);
      }
    });

    // Cleanup function to unsubscribe from the auth state changes
    return () => unsubscribe();
  }, []);


  const userSignOut = () => {
    signOut(auth)
      .then(() => {
        console.log('Sign out successful');
        router.push('/');
      })
      .catch((error) => console.log(error));
  };

  return (
    <Box textAlign="center" mt={4}>
      {authUser ? (
        <>
          <Box as="p" padding={"1rem"}>{`${authUser.email}`}</Box>
          <Button colorScheme="teal" onClick={userSignOut} mt={4}>Sign Out</Button>
        </>
      ) : (
        <Box as="p">Signed out</Box>
      )}
    </Box>
  );
};

export default AuthDetails;
