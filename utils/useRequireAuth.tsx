import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../app/firebase/server/firebase';
import { User } from 'firebase/auth';

const useRequireAuth = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        router.push('/');
      }
    });

    return () => unsubscribe();
  }, [router]);

  return user;
};

export default useRequireAuth;
