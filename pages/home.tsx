import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Avatar, Box, Button, ChakraProvider, Flex, Icon, Image, Text, VStack, Link } from '@chakra-ui/react';
import { ChevronRightIcon, CloseIcon, StarIcon } from '@chakra-ui/icons';
import useRequireAuth from '../utils/useRequireAuth';
import { useDispatch } from 'react-redux';
import { likeBook, dislikeBook } from '../redux/store';
import { getStorage, ref, listAll, getDownloadURL } from 'firebase/storage';
import { app } from '../app/firebase/server/firebase';
import AuthDetails from '../app/firebase/server/AuthDetails';

const storage = getStorage(app);

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

type Book = {
  id: number;
  title: string;
  image: string;
};

const HomePage: React.FC = () => {
  const [currentBookIndex, setCurrentBookIndex] = useState(0);
  const [noNewBooks, setNoNewBooks] = useState(false);
  const router = useRouter();
  const { pathname } = router;
  const [books, setBooks] = useState<Book[]>([]);
  const currentUser = useRequireAuth();
  const [isNavigationOpen, setNavigationOpen] = useState(false);



  const handleNavItemClicked = (path: string) => {
    router.push(path);
  };

  const handleToggleNavigation = () => {
    setNavigationOpen(!isNavigationOpen);
  };

  const dispatch = useDispatch();

  useEffect(() => {
    fetchBooksFromStorage();
  }, []);

  const fetchBooksFromStorage = async () => {
    try {
      const storageRef = ref(storage, 'bookPictures');
      const booksList = await listAll(storageRef);

      const downloadURLs = await Promise.all(
        booksList.prefixes.map(async (prefixRef) => {
          const bookList = await listAll(prefixRef);
          const bookURLs = await Promise.all(
            bookList.items.map(async (itemRef) => {
              const downloadURL = await getDownloadURL(itemRef);
              return downloadURL;
            })
          );
          return bookURLs;
        })
      );

      const flattenedURLs = downloadURLs.flat();

      // Exclude books of the logged-in user
      const filteredBooks = flattenedURLs.map((bookURL, index) => ({
        id: index + 1,
        title: `Book ${index + 1}`,
        image: bookURL,
      }));

      setBooks(filteredBooks);
    } catch (error) {
      console.error('Error fetching books from storage:', error);
    }
  };

  const handleLike = () => {
    if (currentBookIndex < books.length - 1) {
      dispatch(likeBook(currentBook));
      setCurrentBookIndex((prevIndex) => prevIndex + 1);
    } else {
      setNoNewBooks(true);
    }
  };

  const handleDislike = () => {
    if (currentBookIndex < books.length - 1) {
      dispatch(dislikeBook(currentBook));
      setCurrentBookIndex((prevIndex) => prevIndex + 1);
    } else {
      setNoNewBooks(true);
    }
  };

  const currentBook = books[currentBookIndex];

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

        {/* Render your home page content here */}
        <Box flex={1} p={4} bg="gray.100">
          {noNewBooks ? (
            <Box p={4}>
              <Flex justifyContent="center" alignItems="center" height="100%">
                <Image src="/images/old.jpg" alt="No new books" maxH={400} objectFit="cover" borderRadius="md" />
              </Flex>
              <Text fontSize="2xl" textAlign="center" mt={4}>
                No new books
              </Text>
            </Box>
          ) : (
            <Flex direction="column" alignItems="center">
              {currentBook && (
                <>
                  <Image src={currentBook.image} width={89} height={134} objectFit="cover" borderRadius="md" />
                  <VStack spacing={4} mt={4}>
                    <Text fontSize="2xl" color={'gray.100'}></Text>
                    <Flex>
                      <Button
                        onClick={handleLike}
                        leftIcon={<Icon as={StarIcon} boxSize={5} />}
                        colorScheme="green"
                        disabled={currentBookIndex === books.length - 1} // Disable the button when on the last book
                      >
                        Like
                      </Button>
                      <Button
                        onClick={handleDislike}
                        leftIcon={<Icon as={CloseIcon} boxSize={5} />}
                        colorScheme="red"
                        disabled={currentBookIndex === books.length - 1} // Disable the button when on the last book
                        ml={4}
                      >
                        Dislike
                      </Button>
                    </Flex>
                  </VStack>
                  <Box mt={4} textAlign="center">
                    {currentBookIndex === books.length - 1 ? (
                      <Text>No new books</Text>
                    ) : null}
                  </Box>
                </>
              )}
            </Flex>
          )}
        </Box>
      </Flex>
    </ChakraProvider>
  );
};

export default HomePage;
