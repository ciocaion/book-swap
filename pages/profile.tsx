import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getAuth } from 'firebase/auth';
import { Alert, AlertIcon, Box, ChakraProvider, Stack, Button, Heading, Menu, MenuButton, MenuList, MenuItemOption, MenuOptionGroup, FormControl, FormLabel, Input, VStack, Link, Flex, Textarea } from '@chakra-ui/react';
import theme from '@/app/chakra.theme';
import { getDoc, getFirestore, collection, doc, setDoc, getDocs, updateDoc } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytesResumable, listAll, deleteObject, StorageReference } from 'firebase/storage';
import useRequireAuth from '../utils/useRequireAuth';
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

type UserProfile = {
  pictureURL?: string;
  name: string;
  description: string;
  interests: string[];
};

type UserBook = {
  title: string;
  author: string;
  genres: string[];
  picture: string;
  token: string;
};

const ProfilePage: React.FC = () => {
  const router = useRouter();
  const { pathname } = router;
  const currentUser = useRequireAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const auth = getAuth();
  const userId = auth.currentUser?.uid;
  const [userBooks, setUserBooks] = useState<UserBook[]>([]);
  const [selectedPicture, setSelectedPicture] = useState<File | null>(null);
  const [isProfileUpdated, setIsProfileUpdated] = useState(false);
  const [isNavigationOpen, setNavigationOpen] = useState(false);



  const handleNavItemClicked = (path: string) => {
    router.push(path);
  };

  const handleToggleNavigation = () => {
    setNavigationOpen(!isNavigationOpen);
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (userId) {
          const firestore = getFirestore();
          const userDocRef = doc(firestore, 'userProfiles', userId);
          const userDocSnap = await getDoc(userDocRef);
    
          if (userDocSnap.exists()) {
            const userProfileData = userDocSnap.data() as UserProfile;
            
            // Fetch profile picture URL from Firebase Storage
            const storage = getStorage();
            const profilePicturesRef = ref(storage, `profilePictures/${userId}`);
            const profilePicturesList = await listAll(profilePicturesRef);
            
            if (profilePicturesList.items.length > 0) {
              const imageFile = profilePicturesList.items[0]; // Fetch the first image file
              const profilePictureUrl = await getDownloadURL(imageFile);
              userProfileData.pictureURL = profilePictureUrl; // Add the profile picture URL to the userProfileData object
            }
    
            setUserProfile({
              ...userProfileData,
              description: userProfileData.description || '',
            });            
            localStorage.setItem('userProfile', JSON.stringify(userProfileData));
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };
    
  


    const fetchUserBooks = async () => {
      try {
        if (userId) {
          const firestore = getFirestore();
          const userBooksRef = doc(firestore, 'userBooks', userId);
          const userBooksSnapshot = await getDoc(userBooksRef);

          if (userBooksSnapshot.exists()) {
            const userBooksData = userBooksSnapshot.data();
            const books = userBooksData?.books || [];

            const updatedUserBooks = books.map((book: any) => {
              const pictureURL = book.picture;
              return { ...book, picture: pictureURL };
            });

            setUserBooks(updatedUserBooks);
          }
        }
      } catch (error) {
        console.error('Error fetching user books:', error);
      }
    };

    fetchUserBooks();
    fetchUserProfile();
  }, [userId]);

  useEffect(() => {
    const storedUserProfile = localStorage.getItem('userProfile');
    if (storedUserProfile) {
      setUserProfile(JSON.parse(storedUserProfile));
    }
  }, []);

  useEffect(() => {
    const fetchBookGenres = async () => {
      try {
        const firestore = getFirestore();
        const bookGenresRef = collection(firestore, 'bookGenres');
        const snapshot = await getDocs(bookGenresRef);
        const bookGenres = snapshot.docs.map((doc) => doc.data().book);
        setGenres(bookGenres);
      } catch (error) {
        console.error('Error fetching book genres:', error);
      }
    };

    fetchBookGenres();
  }, []);

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };


  const handlePictureUpload = async () => {
    try {
      if (!selectedPicture) {
        return; // If no picture is selected, return early
      }
  
      const file = selectedPicture; // Get the selected picture file
      const storage = getStorage(); // Get the Firebase storage instance
      const userId = auth.currentUser?.uid; // Get the current user's ID
      const timestamp = Date.now(); // Get the current timestamp
      const picturePath = `bookPictures/${userId}/${bookTitle}_${timestamp}`; // Generate the path for the uploaded picture
  
      const pictureRef = ref(storage, picturePath); // Create a reference to the picture path in the storage
  
      const uploadTask = uploadBytesResumable(pictureRef, file); // Upload the picture file to the storage
  
      uploadTask.on(
        'state_changed',
        (_snapshot) => {
          // handle upload progress or other events if needed
        },
        (error) => {
          // handle error
          console.error('Error uploading picture:', error); // Log the error if there's an error during upload
        },
        async () => {
          // upload complete
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref); // Get the download URL of the uploaded picture
  
          // Reset form values and close the modal
          setBookTitle('');
          setBookAuthor('');
          setSelectedGenres([]);
          setSelectedPicture(null);
  
          setIsModalOpen(false);
  
          const userBook: UserBook = {
            title: bookTitle,
            author: bookAuthor,
            genres: selectedGenres,
            picture: downloadURL,
            token: '',
          };
  
          setUserBooks((prevUserBooks) => [...prevUserBooks, userBook]); // Update the user's books list in the local state
  
          const firestore = getFirestore(); // Get the Firebase Firestore instance
          const userBooksRef = collection(firestore, 'userBooks'); // Reference the 'userBooks' collection
          const userBookDocRef = doc(userBooksRef, userId); // Reference the document for the current user's books
          await setDoc(userBookDocRef, { books: [...userBooks, userBook] }, { merge: true }); // Add the userBook to Firestore
        }
      );
    } catch (error) {
      console.error('Error uploading picture:', error); // Log the error if there's an error in the picture upload process
    }
  };
  
  const handleUpload = async () => {
    try {
      const auth = getAuth(); // Get the Firebase authentication instance
      const userId = auth.currentUser?.uid; // Get the current user's ID
      if (!userId) {
        throw new Error('User ID not found'); // Throw an error if the user ID is not found
      }
  
      const firestore = getFirestore(); // Get the Firebase Firestore instance
      const userBooksRef = collection(firestore, 'userBooks'); // Reference the 'userBooks' collection
      const timestamp = Date.now(); // Get the current timestamp
      const picturePath = `bookPictures/${userId}/${bookTitle}_${timestamp}`; // Generate the path for the uploaded picture
  
      // Create a new document in Firestore with the book details
      await setDoc(doc(userBooksRef, userId), {
        title: bookTitle,
        author: bookAuthor,
        genres: selectedGenres,
        picture: picturePath,
      });
  
      setIsModalOpen(false); // Close the modal after successful upload
    } catch (error) {
      console.error('Error uploading book:', error); // Log the error if there's an error in the book upload process
    }
    handlePictureUpload(); // Call the handlePictureUpload function to upload the picture
  };
  


  const handleDeleteBook = async (book: UserBook) => {
    try {
      const firestore = getFirestore();
      const storage = getStorage();
  
      // Step 1: Delete the book document from Firestore
      const userBooksRef = collection(firestore, 'userBooks');
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error('User ID not found');
      }
      const userBookDocRef = doc(userBooksRef, userId);
      const userBookDocSnapshot = await getDoc(userBookDocRef);
      if (userBookDocSnapshot.exists()) {
        const userBooksData = userBookDocSnapshot.data();
        const books = userBooksData?.books || [];
        const updatedBooks = books.filter((b: UserBook) => b.title !== book.title);
        await updateDoc(userBookDocRef, { books: updatedBooks });
      }
  
      // Step 2: Retrieve the URL of the book image from Firestore
      const imagePath = book.picture;
  
      // Step 3: Extract the file path from the URL
      const filePath = decodeURIComponent(imagePath.substring(imagePath.lastIndexOf('/') + 1, imagePath.indexOf('?')));
  
      // Step 4: Log the file path
      console.log('File path:', filePath);
  
      // Step 5: Delete the corresponding file from Firebase Storage
      const storageRef = ref(storage, filePath);
      await deleteObject(storageRef);
  
      // Perform any additional cleanup or actions required
  
      // Update the state to reflect the deleted book
      setUserBooks((prevUserBooks) => prevUserBooks.filter((b: UserBook) => b.title !== book.title));
    } catch (error) {
      console.error('Error deleting book:', error);
    }
  };
  
  const handleSaveChanges = async () => {
    if (!userId || !userProfile) {
      return;
    }

    try {
      const firestore = getFirestore();
      const userDocRef = doc(firestore, 'userProfiles', userId);
      await setDoc(userDocRef, {
        ...userProfile,
        description: userProfile.description || '',
      });

      setIsProfileUpdated(true);
    } catch (error) {
      console.error('Error saving changes:', error);
    }
};


  useEffect(() => {
    if (isProfileUpdated) {
      const timeout = setTimeout(() => {
        setIsProfileUpdated(false); // Reset the flag to hide the success message
      }, 3000); // Delay in milliseconds (3 seconds)

      return () => clearTimeout(timeout); // Cleanup function to clear the timeout when the component is unmounted or the flag changes
    }
  }, [isProfileUpdated]);



  if (!currentUser || !userId) {
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

<Box
      width="100%"
      minHeight="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      bg="gray.100"
    >
      <Box maxH="100%" width={{ base: '100%', md: '80%' }} p={4}>
        <Heading as="h1" mb={4} textAlign="center"> {/* Center align the text */}
          Your Profile
        </Heading>
        <Box textAlign="center" mb={4}>
          <div
            style={{
              borderRadius: '50%',
              width: '200px',
              height: '200px',
              overflow: 'hidden',
              margin: '0 auto' // Center align the avatar
            }}
          >
                <img
                  src={userProfile?.pictureURL}
                  alt="avatar"
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                />
              </div>
            </Box>
            <Box mb={4}>
              <Heading as="h2" size="md" mb={2}>
                Name
              </Heading>
              <Input
                variant="outline"
                value={userProfile?.name}
                onChange={(e) => {
                  if (userProfile) {
                    setUserProfile({
                      ...userProfile,
                      name: e.target.value,
                    });
                   }
                 }}
                isDisabled={!userProfile}
                />
            </Box>
            <Box mb={4}>
              <Heading as="h2" size="md" mb={2}>
                About me
              </Heading>
              <Textarea
                variant="outline"
                minWidth="500px"
                value={userProfile?.description}
                onChange={(e) => {
                  if (userProfile) {
                    setUserProfile({
                      ...userProfile,
                      name: e.target.value,
                    });
                   }
                 }}
                isDisabled={!userProfile}
                />
            </Box>
            <Box mb={4}>
              <Heading as="h2" size="md" mb={2}>
                Interests
              </Heading>
              <Box width="fit-content">
                <Stack spacing={2}>
                  {userProfile?.interests.map((interest) => (
                    <Box
                      key={interest}
                      bg="blue.500"
                      style={{ color: '#202020', backgroundColor: theme.colors.customButton }}
                      py={1}
                      px={5}
                      borderRadius="md"
                    >
                      {interest}
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Box>
            <Box mb={4}>
              <Heading as="h2" size="md" mb={2}>
                Books on the shelf
              </Heading>
              <Box display="flex" flexWrap="wrap" justifyContent="center">
                {userBooks.length > 0 ? (
                  userBooks.map((book) => (
                    <Box key={book.title} display="inline-block" width="200px" mr={4} className="">
                      <Button variant="link" onClick={() => handleDeleteBook(book)}>
                        X
                      </Button>
                      <img src={book.picture} alt={book.title} style={{ maxWidth: '100px' }} />
                      <Heading as="h3" size="sm" mt={2} maxWidth="50%">
                        {book.title}
                      </Heading>
                      <Heading as="h4" size="xs" mt={1}>
                        {book.author}
                      </Heading>
                    </Box>
                  ))
                ) : (
                  <p>No books found.</p>
                )}
              </Box>
            </Box>
            <Box mb={4}>
              <Heading as="h2" size="md" mb={2}>
                Upload Book
              </Heading>
              <Button colorScheme="blue" onClick={handleModalOpen}>
                Upload
              </Button>
            </Box>
            {isProfileUpdated && (
              <Alert status="success">
                <AlertIcon />
                Profile updated!
              </Alert>
            )}
            <Button colorScheme="blue" onClick={handleSaveChanges}>
              Save Changes
            </Button>
          </Box>
        </Box>

        {isModalOpen && (
          <Box
            position="fixed"
            top={0}
            left={0}
            width="100vw"
            height="100vh"
            display="flex"
            justifyContent="center"
            alignItems="center"
            bg="rgba(0, 0, 0, 0.5)"
          >
            <Box bg="white" p={4} borderRadius="md">
              <Heading as="h2" size="md" mb={4}>
                Upload Book
              </Heading>
              <FormControl>
                <FormLabel>Title</FormLabel>
                <Input
                  placeholder="Enter book title"
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Author</FormLabel>
                <Input
                  placeholder="Enter book author"
                  value={bookAuthor}
                  onChange={(e) => setBookAuthor(e.target.value)}
                />
              </FormControl>
              <FormControl mt={4}>
                <FormLabel>Select Genres</FormLabel>
                <Menu closeOnSelect={false}>
                  <MenuButton as={Button} variant="outline">
                    Select Genres
                  </MenuButton>
                  <MenuList minWidth="240px" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    <MenuOptionGroup title="Select Genres" type="checkbox">
                      {genres.map((genre) => (
                        <MenuItemOption
                          key={genre}
                          value={genre}
                          onClick={() =>
                            setSelectedGenres((prevGenres) => [...prevGenres, genre])
                          }
                        >
                          {genre}
                        </MenuItemOption>
                      ))}
                    </MenuOptionGroup>
                  </MenuList>
                </Menu>
              </FormControl>
              <Box mb={4}>
                <FormControl mt={4}>
                  <FormLabel>Picture</FormLabel>
                  <Input
                    type="file"
                    onChange={(e) =>
                      setSelectedPicture(e.target.files?.[0] || null)
                    }
                  />
                </FormControl>
              </Box>
              <Button colorScheme="blue" mt={4} onClick={handleUpload}>
                Upload
              </Button>
              <Button colorScheme="gray" mt={4} ml={2} onClick={handleModalClose}>
                Cancel
              </Button>
            </Box>
          </Box>
        )}
      </Flex>
    </ChakraProvider>
  );
};
export default ProfilePage;

