import { Box, Button, Checkbox, VStack, FormControl, FormErrorMessage, Menu, MenuButton, MenuList, MenuItem, FormLabel, Input, Stack, Text, Textarea, Select, CheckboxGroup, MenuItemOption, MenuOptionGroup, Divider, MenuDivider } from '@chakra-ui/react';
import { ChakraProvider } from '@chakra-ui/react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { createUserWithEmailAndPassword, getAuth, fetchSignInMethodsForEmail } from "firebase/auth";
import { firestore, collection, getDocs, doc, setDoc } from "../app/firebase/server/firebase";
import router, { useRouter } from 'next/router';
import { ChangeEventHandler, useEffect, useState } from 'react';
import { getStorage, ref, uploadBytes } from 'firebase/storage';

const SignUp = () => {
  const [genres, setGenres] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);  
  const [profilePicture, setProfilePicture] = useState<File | null>(null);

  const router = useRouter(); // Access the router object from Next.js

  const { handleSubmit, register, formState: { errors }, setError, clearErrors } = useForm<{ email: string; password: string; profileName: string; profileDescription: string; }>();

  useEffect(() => {
    // Fetch book genres when the component mounts
    fetchBookGenres();
  }, []);

  const fetchBookGenres = async () => {
    const bookGenresRef = collection(firestore, "bookGenres"); // Reference to the "bookGenres" collection in Firestore
    const snapshot = await getDocs(bookGenresRef); // Fetch the documents from the collection
    const bookGenres = snapshot.docs.map((doc) => doc.data().book); // Extract the "book" field from each document
    setGenres(bookGenres); // Update the genres state with the fetched book genres
  };

  const handleProfilePictureChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    setProfilePicture(file ?? null);
  };
  
  const uploadProfilePicture = async (userId: string) => {
    if (profilePicture) {
      const storage = getStorage();
      const storageRef = ref(storage, `profilePictures/${userId}/${profilePicture.name}`);
      await uploadBytes(storageRef, profilePicture);
    }
  };
  

  const onSubmit: SubmitHandler<{ email: string; password: string; profileName: string; profileDescription: string; }> = async (data) => {
    const { email, password, profileName, profileDescription } = data; // Destructure form data
    const authInstance = getAuth(); // Get the authentication instance from Firebase
    try {
      const signInMethods = await fetchSignInMethodsForEmail(authInstance, email); // Check if the email already exists
      if (signInMethods.length > 0) {
        // Set an error if the email already exists
        setError('email', { type: 'manual', message: 'Username already exists' });
      } else {
        const userCredential = await createUserWithEmailAndPassword(authInstance, email, password); // Create a new user account
        const user = userCredential.user; // Get the user object
        const userProfile = {
          name: profileName || '', // Ensure a valid value or use an empty string as fallback
          description: profileDescription || '', // Ensure a valid value or use an empty string as fallback
          interests: selectedGenres || [] // Store the selected genres as user interests
        };
        const userDocRef = doc(firestore, 'userProfiles', user.uid);
        await setDoc(userDocRef, userProfile);

        if (profilePicture) {
          await uploadProfilePicture(user.uid); // Upload the profile picture
        }
        console.log("User profile created successfully");
        router.push('/profile'); // Navigate to the user's profile page after successful profile creation
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <ChakraProvider>
      <Box width="100vw" height="100vh" display="flex" justifyContent="center" alignItems="center" bg="gray.100">
        <Box bg="white" p={8} borderRadius="md" boxShadow="lg">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={4}>
              <FormControl>
                <FormLabel>Profile Picture</FormLabel>
                <Input type="file" onChange={handleProfilePictureChange} />
              </FormControl>
              <FormControl isInvalid={!!errors.email} isRequired>
                <FormLabel>Email</FormLabel>
                <Input type="email" placeholder="Enter your email" autoComplete="off" {...register('email', { required: 'Email is required' })} onFocus={() => clearErrors('email')} />
                <FormErrorMessage>{errors.email && errors.email.message?.toString()}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.password} isRequired>
                <FormLabel>Password</FormLabel>
                <Input type="password" placeholder="Password" autoComplete="off" {...register('password', { required: 'Password is required' })} />
                <FormErrorMessage>{errors.password && errors.password.message?.toString()}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.profileName} isRequired>
                <FormLabel>Profile name</FormLabel>
                <Input type="text" placeholder="" autoComplete="off" {...register('profileName', { required: 'Profile name is required' })} />
                <FormErrorMessage>{errors.profileName && errors.profileName.message?.toString()}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.profileDescription} isRequired>
                <FormLabel>Profile description</FormLabel>
                <Textarea placeholder="" autoComplete="off" {...register('profileDescription', { required: 'Profile description is required' })} />
                <FormErrorMessage>{errors.profileDescription && errors.profileDescription.message?.toString()}</FormErrorMessage>
              </FormControl>
              <Menu closeOnSelect={false}>
                <MenuButton as={Button} colorScheme='blue'>
                  Select Genres
                </MenuButton>
                <MenuList minWidth='240px' style={{ maxHeight: '200px', overflowY: 'auto' }}>
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
              {errors.email && (
                <Text color="red" fontSize="sm">
                  {errors.email.message?.toString()}
                </Text>
              )}
              <Button type="submit" colorScheme="blue" width="full">
                Sign Up
              </Button>
            </Stack>
          </form>
        </Box>
      </Box>
    </ChakraProvider>
  );
};

export default SignUp;
