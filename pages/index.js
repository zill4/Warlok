import Head from 'next/head'
import { AuthProvider } from '../authcontext'
import Navbar from './navbar'
import About from './about'
import Landing from './landing'

export default function Home() {
  return (
    // <div className="flex flex-col items-center justify-center min-h-screen py-2">
    <div>
        <Navbar />
        <Landing />
    </div>
  )
}
