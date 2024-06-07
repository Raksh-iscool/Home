/*'use client'
import Image from 'next/image'
import {useAuthState} from 'react-firebase-hooks/auth'
import {auth} from '@/app/firebase/config'
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';

export default function Home() {
  const [user] = useAuthState(auth);
  const router = useRouter()
  const userSession = sessionStorage.getItem('user');

  console.log({user})
 
  if (!user && !userSession){
    router.push('/sign-up')
  }
  

  return (
    
      <button onClick={() => {
        signOut(auth)
        sessionStorage.removeItem('user')
        }}>
        Log out
      </button>
      
)}
*/
'use client'
import { useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/app/firebase/config';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import styles from './Home.module.css'; // Assuming you have a CSS module file for styling

export default function Home() {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const userSession = typeof window !== 'undefined' ? sessionStorage.getItem('user') : null;

  useEffect(() => {
    if (!user && !userSession) {
      router.push('/sign-in');
    }
  }, [user, userSession, router]);

  return (
    <div className={styles.container}>
      <div className={styles.navbar}>
        <h1>Home Page</h1>
        <button
          className={styles.logoutButton}
          onClick={() => {
            signOut(auth);
            sessionStorage.removeItem('user');
          }}
        >
          Log out
        </button>
      </div>
    </div>
  );
}
