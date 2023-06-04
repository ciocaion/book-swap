import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Avatar, Box, ChakraProvider, Flex, Link, VStack, Text, Image, Button } from '@chakra-ui/react';
import useRequireAuth from '../utils/useRequireAuth';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { MdFavorite, MdThumbDown } from "react-icons/md";
import AuthDetails from '@/app/firebase/server/AuthDetails';

type BottomNavItem = {
  label: string;
  path: string;
};

const bottomNavItems: BottomNavItem[] = [
  { label: 'Home', path: '/home' },
  { label: 'Messages', path: '/messages' },
  { label: 'History', path: '/history' },
  { label: 'Profile', path: '/profile' },
];

const HistoryPage: React.FC = () => {
  const router = useRouter();
  const { pathname } = router;

  const currentUser = useRequireAuth();
  const likedBooks = useSelector((state: RootState) => state.book?.likedBooks || []);
  const dislikedBooks = useSelector((state: RootState) => state.book?.dislikedBooks || []);
  const [isNavigationOpen, setNavigationOpen] = useState(false);



  const handleNavItemClicked = (path: string) => {
    router.push(path);
  };

  const handleToggleNavigation = () => {
    setNavigationOpen(!isNavigationOpen);
  };

  if (!currentUser) {
    // Redirect to login page or render a loading state if authentication is in progress
    return <div>Loading...</div>;
  }

  return (
    <ChakraProvider>
      <Flex  direction={{ base: 'column', md: 'row' }}bg="#edf2f7" minH="100vh">
      <Button onClick={handleToggleNavigation}>☰</Button> {/* Hamburger menu button */}
    <div style={{ position: 'relative', zIndex: isNavigationOpen ? 1 : 'auto' }}>
      {isNavigationOpen && (
        <VStack
          position="absolute"
          top={0}
          left={0}
          align="flex-start"
          spacing={4}
          pr={8}
          borderRight="1px solid"
          borderColor="gray.200"
          bg="white"
          p={4}
          height="100vh"
          overflow="auto"
        >
          {/* Render navigation */}
          {bottomNavItems.map((item) => (
            <Link
              key={item.path}
              onClick={() => handleNavItemClicked(item.path)}
              color={pathname === item.path ? 'blue.500' : 'gray.500'}
              fontWeight={pathname === item.path ? 'bold' : 'normal'}
              p={2}
            >
              {item.label}
            </Link>
          ))}
          <AuthDetails />
        </VStack>
      )}</div>

        {/* Render your history page content here */}
        <Flex flex={1} justifyContent="center" alignItems="center" bg="gray.100">
          <Box p={4}>
            <VStack spacing={4} mt={4} maxWidth={400}>
              {likedBooks.map((book) => (
                <Flex key={book.id} alignItems="center" bg="white" p={4} borderRadius="md" boxShadow="md">
                  <Image src={book.image} alt="book" width={89} height={134} />
                  <Text fontSize="2xl" ml={5} fontWeight="bold" color={'white'}>
                   <MdFavorite color="red" />
                  </Text>
                </Flex>
              ))}
              {dislikedBooks.map((book) => (
                <Flex key={book.id} alignItems="center" bg="white" p={4} borderRadius="md" boxShadow="md">
                  <Image src={book.image} alt="book" width={89} height={134} />
                  <Text fontSize="2xl" ml={5} fontWeight="bold" color={'white'}>
                    <MdThumbDown color="blue" />
                  </Text>
                </Flex>
              ))}
            </VStack>
          </Box>
        </Flex>

      </Flex>
    </ChakraProvider>
  );
};

export default HistoryPage;
