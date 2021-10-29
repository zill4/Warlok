import { useEffect, useState } from "react";
// import { Link, useHistory } from "react-router-dom";
// import { useHistory } from "react-router-dom";
import { firestore } from '../firebase';
import smallLogo from '../../public/images/warlok_color.png';
import logo from '../../public/images/warlok_logo.png';
import { Fragment } from 'react'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { BellIcon, MenuIcon, XIcon } from '@heroicons/react/outline'
import { AuthContext, useAuth } from "../authcontext"
import Router from 'next/router'
import Link from 'next/link'
import Image from 'next/image'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const dummyUser = {
  avatar: "https://images.unsplash.com/photo-1608237652484-b478fac3bf7c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
}

export default function Navbar() {

  const { logout } = useAuth()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  // const history = useHistory()
  const [user, setUser] = useState(dummyUser);
  const { currentUser } = useAuth();
  async function handleLogout(e) {
    e.preventDefault()

    try {
      setError("")
      setLoading(true)
      await logout()
      //   history.push("/")
    } catch (error) {
      setError(error)
    }
    setLoading(false)
    Router.push('/')
  }

  useEffect(() => {

    const getUser = async () => {
      if (!currentUser)
        return;
      const userCollection = await firestore.doc(`users/${currentUser.uid}`).get()
      setUser(await userCollection.data());
      if (user === undefined)
      {
        handleLogout();
      }
    }
    try {
      setError("")
      setLoading(true)
      getUser()
    } catch (error) {
      setError(error)
      handleLogout();
    }
    setLoading(false)
  
  }, [])

  const NavigationAuth = () => (

    <Fragment>
      {/* <a href="/inbox" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
              Inbox */}
      {/* <Link to="/inbox">Inbox</Link> */}
      {/* </a> */}
      <Link href="/">
        <a onClick={handleLogout} className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium" >
          Sign Out
          {/* <Link to="/" onClick={handleLogout}>Sign Out</Link>  */}
        </a>
      </Link>
      <Link href="/profile">
        <a className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium" >
          Profile
        </a>
      </Link>

    </Fragment>

  );

  const MenuView = () =>
  (
    <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
      <button className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
        <span className="sr-only">View notifications</span>
        <BellIcon className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Profile dropdown */}
      <Menu as="div" className="ml-3 relative z-10">
        {({ open }) => (
          <div>
            <div>
              <Menu.Button className="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <span className="sr-only">Open user menu</span>
                <img
                  className="h-8 w-8 rounded-full"
                  src={user === undefined ? '' : user.avatar}
                  alt="avatar"
                />
              </Menu.Button>
            </div>
            <Transition
              show={open}
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items
                static
                className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
              >
                <Menu.Item>
                  {({ active }) => (
                    <Link href="/profile">
                      <a
                        className={classNames(
                          active ? 'bg-gray-100' : '',
                          'block px-4 py-2 text-sm text-gray-700'
                        )}
                      >
                        Your Profile
                      </a>
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <Link href="/settings">
                      <a
                        className={classNames(
                          active ? 'bg-gray-100' : '',
                          'block px-4 py-2 text-sm text-gray-700'
                        )}
                      >
                        Settings
                      </a>
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <Link href="/">
                      <a
                        onClick={handleLogout}
                        className={classNames(
                          active ? 'bg-gray-100' : '',
                          'block px-4 py-2 text-sm text-gray-700'
                        )}
                      >
                        Sign Out
                      </a>
                    </Link>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </div>
        )}
      </Menu>
    </div>
  );


  return (

    <Disclosure as="nav" className="bg-white shadow">
      {currentUser ?
            currentUser.emailVerified ?
            ({ open }) => (
              <div>
                <div className="max-w-full mx-auto px-2 sm:px-6 lg:px-8">
                  <div className="relative flex justify-between h-16">
                    <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                      {/* Mobile menu button */}
                      <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                        <span className="sr-only">Open main menu</span>
                        {open ? (
                          <XIcon className="block h-6 w-6" aria-hidden="true" />
                        ) : (
                          <MenuIcon className="block h-6 w-6" aria-hidden="true" />
                        )}
                      </Disclosure.Button>
                    </div>
                    <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
                      <div className="flex-shrink-0 flex items-center">
                        <Link href="/profile">
                          <a className="block lg:hidden h-8 w-auto">
                            <Image
                              // import smallLogo from '../images/warlok_color.png';
                              // import logo from '../images/warlok_logo.png';
                              className="block lg:hidden h-8 w-auto"
                              src={smallLogo}
                              alt="Warlok"
                              height={50}
                              width={50}
                            />
                          </a>
                        </Link>
                        <Link href="/profile">
                          <a className="hidden lg:block">
                            <Image
                              className="hidden lg:block h-8 w-auto"
                              src={logo}
                              alt="Warlok"
                              height={30}
                              width={130}
                            />
                          </a>
                        </Link>
    
    
                      </div>
                      <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                        {/* Current: "border-indigo-500 text-gray-900", Default: "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700" */}
    
                        <NavigationAuth />
    
                        {/* <a
                        href="/"
                        className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                      >
                        Home
                      </a>
                      <a
                        href="/Profile"
                        className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                      >
                        Profile
                      </a>
                      <a
                        href="/"
                        className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                      >
                        Projects
                      </a>
                      <a
                        href="#"
                        className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                      >
                        Calendar
                      </a> */}
                      </div>
                    </div>
                    <MenuView />
                  </div>
                </div>
    
                <Disclosure.Panel className="sm:hidden">
                  <div className="pt-2 pb-4 space-y-1">
                    {/* Current: "bg-indigo-50 border-indigo-500 text-indigo-700", Default: "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700" */}
                    <a
                      href="#"
                      className="bg-indigo-50 border-indigo-500 text-indigo-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
                    >
                      Dashboard
                    </a>
                    <a
                      href="#"
                      className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
                    >
                      Team
                    </a>
                    <a
                      href="#"
                      className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
                    >
                      Projects
                    </a>
                    <a
                      href="#"
                      className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
                    >
                      Calendar
                    </a>
                  </div>
                </Disclosure.Panel>
              </div>
            )
          : <br></br>  : <div></div>}
              
    </Disclosure>
  )

}