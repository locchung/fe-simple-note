'use client'
import { signup } from "@/app/actions/auth"
import { authService } from "@/app/services/apiAuth";
import { FormControl, FormLabel, TextField, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import React, { useActionState, useEffect, useState } from "react"
import { toast, ToastContainer } from 'react-toastify';

export default function Signup() {
  const [emailError, setEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
  const [userNameError, setUserNameError] = useState(false);
  const [userNameErrorMessage, setUserNameErrorMessage] = useState('');
  const router = useRouter()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (emailError || passwordError || userNameError) {
      event.preventDefault();
      return;
    }

    const data = new FormData(event.currentTarget);
    const res = await authService.signUp({
      email: data.get('email') as string,
      password: data.get('password') as string,
      username: data.get('userName') as string,
    });

    if (res?.statusCode === 201) {
      router.push('/auth/login');
    }
  }

  const validateInputs = () => {
    const userName = document.getElementById('userName') as HTMLInputElement;
    const email = document.getElementById('email') as HTMLInputElement;
    const password = document.getElementById('password') as HTMLInputElement;
    let isValid = true;

    if (!userName.value) {
      setUserNameError(true);
      setUserNameErrorMessage('Please enter your name.');
      isValid = false;
    } else {
      setUserNameError(false);
      setUserNameErrorMessage('');
    }

    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      setEmailError(true);
      setEmailErrorMessage('Please enter a valid email address.');
      isValid = false;
    } else {
      setEmailError(false);
      setEmailErrorMessage('');
    }

    if (!password.value
        || !/[a-zA-Z]/.test(password.value)
        || !/[0-9]/.test(password.value)
        || !/[^a-zA-Z0-9]/.test(password.value)
        || password.value.length < 6) {
      setPasswordError(true);
      setPasswordErrorMessage('Password must be at least 6 characters long. \n It must contain at least one letter, one number, and one special character.');
      isValid = false;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    return isValid;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-black">Sign Up</h2>
        <FormControl className="mb-4" sx={{ width: '100%', mb: 2 }}>
          <FormLabel htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </FormLabel>
          <TextField
            error={userNameError}
            helperText={userNameErrorMessage}
            id="userName"
            type="userName"
            name="userName"
            placeholder="Nguyen Van A"
            autoComplete="name"
            autoFocus
            required
            fullWidth
            variant="outlined"
            color={userNameError ? 'error' : 'primary'}
            sx={{ ariaLabel: 'email' }}
          />
        </FormControl>

        <FormControl className="mb-4" sx={{ width: '100%', mb: 2 }}>
          <FormLabel htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </FormLabel>
          <TextField
            error={emailError}
            helperText={emailErrorMessage}
            id="email"
            type="email"
            name="email"
            placeholder="your@email.com"
            autoComplete="email"
            autoFocus
            required
            fullWidth
            variant="outlined"
            color={emailError ? 'error' : 'primary'}
            sx={{ ariaLabel: 'email' }}
          />
        </FormControl>

        <FormControl className="mb-6" sx={{ width: '100%', mb: 2 }}>
          <FormLabel htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </FormLabel>
          <TextField
            error={passwordError}
            helperText={passwordErrorMessage}
            name="password"
            placeholder="••••••"
            type="password"
            id="password"
            autoComplete="current-password"
            autoFocus
            required
            fullWidth
            variant="outlined"
            color={passwordError ? 'error' : 'primary'}
          />
        </FormControl>

        <button
          type="submit"
          onClick={validateInputs}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Sign Up
        </button>

      <Typography sx={{ textAlign: 'center' }}>
        Already have an account?{' '}
        <span
          onClick={() => router.push('/auth/login')}
          className="cursor-pointer underline underline-offset-1 hover:text-c2-400"
        >
          Login
        </span>
      </Typography>
      </form>

      <ToastContainer />
    </div>
  )
}
