import { useRouter } from 'next/router';
import Lottie, { useLottie } from "lottie-react";
import animationData from '../public/animation.json';
import { Button, Stack, ChakraProvider, Flex } from '@chakra-ui/react';
import theme from '@/app/chakra.theme';


const WelcomePage = () => {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/login');
  };

  const handleSignUp = () => {
    router.push('/signup');
  };

  const options = {
    animationData: animationData,
    loop: true
  };
  
  const { View } = useLottie(options);

  return (
    <ChakraProvider theme={theme}>
     <Flex width="100vw" height="100vh" justifyContent="center" alignItems="center" bg="gray.100">
      <div>
        <h1 style={{ textAlign: 'center', fontFamily: 'Playfair Display, serif', fontSize: '48px', fontWeight: '400' }}>
          Welcome to
        </h1>
        <p style={{ textAlign: 'center', fontFamily: 'Playfair Display, serif', fontSize: '52px', fontWeight: '700', lineHeight: '0px' }}>
          BookSwap
        </p>

        <div style={{ textAlign: 'center', width: '400px', height: '400px', margin: '0 auto' }}>
            <Lottie animationData={options.animationData} loop={options.loop} width="100%" height="100%" />
          </div>
          <div style={{ textAlign: 'center', fontFamily: 'Lato', fontSize: '18px' }}>
            <p>Interested in finding your next book?</p>
            <div>
            <Stack spacing={4}>
              <Button onClick={handleLogin} style={{ color: "#202020", backgroundColor: theme.colors.customButton, marginTop:"32px"}}>Log in</Button>
              <p>Or</p>
              <Button onClick={handleSignUp} style={{ color: "#FFFFFF", backgroundColor: theme.colors.signupButton}}>Sign Up</Button>
            </Stack>
            </div>
          </div>
      </div>
      </Flex>
    </ChakraProvider>
  );
};

export default WelcomePage;
