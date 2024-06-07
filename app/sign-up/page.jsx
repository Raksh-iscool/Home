
'use client';
import { useState } from 'react';
import { useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth, provider, db } from '@/app/firebase/config';
import { signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc, query, where, collection, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import bcrypt from 'bcryptjs';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [createUserWithEmailAndPassword, user, loading, error] = useCreateUserWithEmailAndPassword(auth);
  const router = useRouter();

  const handleSignUp = async () => {
    try {
      // Validate inputs
      if (!email || !password || !username) {
        setErrorMessage('All fields are required');
        return;
      }

      // Check if username already exists
      const usernameQuery = query(collection(db, 'users'), where('username', '==', username));
      const usernameSnapshot = await getDocs(usernameQuery);
      
      if (!usernameSnapshot.empty) {
        setErrorMessage('Username already exists');
        return;
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user with email and password
      const res = await createUserWithEmailAndPassword(email, password);
      
      if (!res || !res.user) {
        throw new Error('User creation failed');
      }
      
      const user = res.user;

      // Store user information in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        username: username,
        password: hashedPassword // Store hashed password
      });

      console.log({ res });
      sessionStorage.setItem('user', true);
      setEmail('');
      setPassword('');
      setUsername('');
      router.push('/sign-in');
    } catch (e) {
      if (e.code === 'auth/email-already-in-use') {
        setErrorMessage('User already exists with this email address');
      } else if (e.code === 'auth/invalid-email') {
        setErrorMessage('Invalid email address');
      } else if (e.code === 'auth/weak-password') {
        setErrorMessage('Password should be at least 6 characters');
      } else {
        setErrorMessage('An unexpected error occurred');
        console.error(e);
      }
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const res = await signInWithPopup(auth, provider);
      
      if (!res || !res.user) {
        throw new Error('Google sign-in failed');
      }

      const user = res.user;

      // Check if user already exists in Firestore
      const userDoc = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDoc);

      if (!userDocSnap.exists()) {
        // Store user information in Firestore
        await setDoc(userDoc, {
          uid: user.uid,
          email: user.email,
          username: user.displayName || '', // Google sign-in may provide a display name
          password: 'Google sign-in does not provide a password'
        });
      }

      console.log({ res });
      sessionStorage.setItem('user', true);
      setEmail('');
      setPassword('');
      setUsername('');
      router.push('/');
    } catch (e) {
      setErrorMessage(e.message);
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-10 rounded-lg shadow-xl w-96">
        <h1 className="text-white text-2xl mb-5">Sign Up</h1>
        {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
        />
        <button 
          onClick={handleSignUp}
          className="w-full p-3 bg-indigo-600 rounded text-white hover:bg-indigo-500"
        >
          Sign Up
        </button>
        <button 
          onClick={handleGoogleSignUp}
          className="w-full p-3 bg-red-600 rounded text-white hover:bg-red-500 mt-4"
        >
          Sign Up with Google
        </button>
      </div>
    </div>
  );
};

export default SignUp;
