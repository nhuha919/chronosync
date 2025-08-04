import { useState } from 'react';
import { auth, provider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { login, googleLogin } from '../services/authService';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    const res = await login(form);
    localStorage.setItem('token', res.data.token);
    // Redirect to dashboard
  };

  const handleGoogle = async () => {
    const result = await signInWithPopup(auth, provider);
    const idToken = await result.user.getIdToken();
    const res = await googleLogin(idToken);
    localStorage.setItem('token', res.data.token);
    // Redirect to dashboard
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <h1 className="text-red-500 text-4xl font-bold">Tailwind is working!</h1>

      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold mb-1 text-center">Create an account</h2>
        <p className="text-sm text-gray-500 mb-6 text-center">
          Enter your email below to create your account
        </p>

        <div className="flex gap-4 mb-6">
          <button
            onClick={handleGoogle}
            className="flex-1 border border-gray-300 py-2 rounded-md flex items-center justify-center gap-2 hover:bg-gray-100 transition"
          >
            <span className="text-lg">G</span> Google
          </button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-400">OR CONTINUE WITH</span>
          </div>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              name="email"
              type="email"
              placeholder="m@example.com"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-black"
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              name="password"
              type="password"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-black"
              onChange={handleChange}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-900 transition"
          >
            Create account
          </button>
        </form>
      </div>
    </div>
  );
}
