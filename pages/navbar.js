import { useEffect, useState } from "react";
// import { Link, useHistory } from "react-router-dom";
// import { useHistory } from "react-router-dom";
import { firestore } from '../firebase';
import smallLogo from '../public/images/warlok_color.png';
import logo from '../public/images/warlok_logo.png';
import { Fragment } from 'react'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { BellIcon, MenuIcon, XIcon } from '@heroicons/react/outline'
import { AuthContext, useAuth } from "../authcontext"
import Image from 'next/image'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}


export default function Navbar() {

    const { logout } = useAuth()
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    // const history = useHistory()
    const [ user, setUser ] = useState(""); 
    const { currentUser } = useAuth();
    const avatar = "";

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
      }

      useEffect(() => {
        const getUser = async() => {
          if (!currentUser)
            return;
          const userCollection = await firestore.doc(`users/${currentUser.uid}`).get()
          setUser(await userCollection.data());
          }
        getUser()
      }, [])

    const NavigationAuth = () => (
      
        <Fragment>
            <a href="/inbox" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
              Inbox
            {/* <Link to="/inbox">Inbox</Link> */}
            </a>
          <a href="/" onClick={handleLogout} className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium" >
            Sign Out
             {/* <Link to="/" onClick={handleLogout}>Sign Out</Link>  */}
          </a>  
          <a href="/profile" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium" >
            Profile
             {/* <Link to="/profile">Profile</Link>  */}
          </a>  
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
                                  // height="50%"
                                  // width="50%"
                                  className="h-8 w-8 rounded-full"
                                  src={user.avatar}
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
                                  {({ active}) => (
                                    <a
                                      href="/profile"
                                      className={classNames(
                                        active ? 'bg-gray-100' : '',
                                        'block px-4 py-2 text-sm text-gray-700'
                                      )}
                                    >
                                      Your Profile
                                    {/* <Link to="/profile" >Your Profile</Link>  */}
                                    </a>
                                  )}
                                </Menu.Item>
                                <Menu.Item>
                                  {({ active }) => (
                                    <a
                                      href="/settings"
                                      className={classNames(
                                        active ? 'bg-gray-100' : '',
                                        'block px-4 py-2 text-sm text-gray-700'
                                      )}
                                    >
                                      Settings
                                    {/* <Link to="/settings" >Settings</Link>  */}
                                    </a>
                                  )}
                                </Menu.Item>
                                <Menu.Item>
                                  {({ active }) => (
                                    <a
                                      href="/"
                                      className={classNames(
                                        active ? 'bg-gray-100' : '',
                                        'block px-4 py-2 text-sm text-gray-700'
                                      )}
                                    >
                                      Sign Out
                                    {/* <Link to="/" onClick={handleLogout}>Sign Out</Link>  */}
                                    </a>
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
    { currentUser ?  
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
                  <a href="/feed">
                  <img
                 // import smallLogo from '../images/warlok_color.png';
                  // import logo from '../images/warlok_logo.png';
                    className="block lg:hidden h-8 w-auto"
                    src="images/warlok_color.png"
                    alt="Warlok"
                  />
                    {/* <Link to="/feed"></Link>  */}
                  </a>
                  <a href="/feed">
                  <img
                    className="hidden lg:block h-8 w-auto"
                    src="images/warlok_logo.png"
                    alt="Warlok"
                  />
                    {/* <Link to="/feed"></Link>  */}
                  </a>
                  
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
      : <div></div> }
    </Disclosure>
  )

}