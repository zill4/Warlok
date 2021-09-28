import React, { useEffect, useRef } from "react";
import { storage, firestore } from "../../firebase"
import { useAuth } from "../../authcontext"
import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import 'react-calendar/dist/Calendar.css';
import {
  BellIcon,
  BookmarkAltIcon,
  CashIcon,
  CogIcon,
  FireIcon,
  HomeIcon,
  InboxIcon,
  KeyIcon,
  MenuIcon,
  PhotographIcon,
  SearchCircleIcon,
  UserIcon,
  ViewGridAddIcon,
  XIcon,
} from '@heroicons/react/outline'
import Router from 'next/router'
// icons
import { ChevronLeftIcon } from '@heroicons/react/solid'
import { faCalendarAlt, faUserPlus, faUserCircle, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// sub-pages
import Account from './account';
import CalendarSettings from './calendar';
import Links from './links';
import Help from './help';

const navigation = [
  { name: 'Home', href: '#', icon: HomeIcon },
  { name: 'Trending', href: '#', icon: FireIcon },
  { name: 'Bookmarks', href: '#', icon: BookmarkAltIcon },
  { name: 'Messages', href: '#', icon: InboxIcon },
  { name: 'Profile', href: '#', icon: UserIcon },
]
const navMap = {
  '/settings#account': 0,
  '/settings#links' : 1,
  '/settings#calendar': 2,
  '/settings#help': 3,
  '/settings': 0
};
const subNavigation = [
  {
    name: 'account',
    description: 'Change profile pic, name, and bio.',
    href: '/settings#account',
    icon: CogIcon,
    current: false,
  },
  {
    name: 'links',
    description: 'Set website and social links.',
    href: '/settings#links',
    icon: <FontAwesomeIcon icon={faUserPlus}/>,
    current: false,
  },
  {
    name: 'calendar',
    description: 'Change profile related settings',
    href: '/settings#calendar',
    icon: KeyIcon,
    current: false,
  },
  {
    name: 'help',
    description: 'Change profile related settings',
    href: '/settings#help',
    icon: PhotographIcon,
    current: false,
  },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Settings() {
  const usernameRef = useRef()
  const [fileUrl, setFileUrl] = useState();
  const { currentUser } = useAuth();
  const [ user, setUser ] = useState(""); 
  const {asPath} = Router;
  const [role, setRole] = useState(asPath);
  const updateProfile = (event) => {
    event.preventDefault();
    const name = event.target.username;
    if (!name) { return }
    firestore.doc(`users/${currentUser.uid}`).set({
      username: usernameRef.current.value.toLowerCase(),
      avatar: fileUrl
    })

  }
  const onFileChange = async (event) => {
    const file = event.target.files[0];
    const storageRef = storage.ref();
    const fileRef = storageRef.child(file.name);
    await fileRef.put(file);
    setFileUrl(await fileRef.getDownloadURL());
  }


  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)


  const navChange = async (href) =>
  {
    if(href === '/settings#account' || href === '/settings')
      setRole('/settings#account');
    if(href === '/settings#calendar')
      setRole('/settings#calendar');
    if(href === '/settings#help')
      setRole('/settings#help');
    if(href === '/settings#links')
      setRole('/settings#links');
  }
  
  useEffect(() => {
    const {pathname} = Router
    navChange(asPath);
    if(pathname.includes('/settings') && !currentUser ){
        Router.push('/')
    }
    else
    {
        const getUser = async() => {
            const userCollection = await firestore.doc(`users/${currentUser.uid}`).get()
            setUser(await userCollection.data());
            }
          getUser()
    }
  }, [])

  return (
      <div>
        {!currentUser ? <br></br> : 
    <div className="h-screen flex bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 overflow-hidden">
      <Transition.Root show={mobileMenuOpen} as={Fragment}>
        <Dialog
          as="div"
          static
          className="fixed inset-0 flex z-40 lg:hidden"
          open={mobileMenuOpen}
          onClose={setMobileMenuOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-blue-gray-600 bg-opacity-75" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white focus:outline-none">
              <Transition.Child
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute top-0 right-0 -mr-12 pt-4">
                  <button
                    type="button"
                    className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="sr-only">Close sidebar</span>
                    <XIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </button>
                </div>
              </Transition.Child>
              <div className="pt-5 pb-4">
                <div className="flex-shrink-0 flex items-center px-4">
                  <img
                    className="h-8 w-auto"
                    src="https://tailwindui.com/img/logos/workflow-mark.svg?color=blue&shade=600"
                    alt="Workflow"
                  />
                </div>
                <nav aria-label="Sidebar" className="mt-5">
                  <div className="px-1 space-y-1">
                    {navigation.map((item) => (
                      <a
                        key={item.name}
                        className="group p-2 rounded-md flex items-center text-base font-medium text-blue-gray-600 hover:bg-blue-gray-50 hover:text-blue-gray-900"
                      >
                        <item.icon
                          className="mr-4 h-6 w-6 text-blue-gray-400 group-hover:text-blue-gray-500"
                          aria-hidden="true"
                        />
                        {item.name}
                      </a>
                    ))}
                  </div>
                </nav>
              </div>
              <div className="flex-shrink-0 flex border-t border-blue-gray-200 p-4">
                <a href="#" className="flex-shrink-0 group block">
                  <div className="flex items-center">
                    <div>
                      <img
                        className="inline-block h-10 w-10 rounded-full"
                        src={user.avatar}
                        alt="avatar"
                      />
                    </div>
                    <div className="ml-3">
                      <p className="text-base font-medium text-blue-gray-700 group-hover:text-blue-gray-900">
                        Lisa Marie
                      </p>
                      <p className="text-sm font-medium text-blue-gray-500 group-hover:text-blue-gray-700">
                        Account Settings
                      </p>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </Transition.Child>
          <div className="flex-shrink-0 w-14" aria-hidden="true">
            {/* Force sidebar to shrink to fit close icon */}
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      {/* <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-20">
          <div className="flex flex-col h-0 flex-1 overflow-y-auto bg-blue-600">
            <div className="flex-1 flex flex-col">
              <div className="flex-shrink-0 bg-blue-700 py-4 flex items-center justify-center">
                <img
                  className="h-8 w-auto"
                  src="https://tailwindui.com/img/logos/workflow-mark.svg?color=white"
                  alt="Workflow"
                />
              </div>
              <nav aria-label="Sidebar" className="py-6 flex flex-col items-center space-y-3">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="flex items-center p-4 rounded-lg text-blue-200 hover:bg-blue-700"
                  >
                    <item.icon className="h-6 w-6" aria-hidden="true" />
                    <span className="sr-only">{item.name}</span>
                  </a>
                ))}
              </nav>
            </div>
            <div className="flex-shrink-0 flex pb-5">
              <a href="#" className="flex-shrink-0 w-full">
                <img
                  className="block mx-auto h-10 w-10 rounded-full"
                  src="https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.5&w=256&h=256&q=80"
                  alt=""
                />
                <div className="sr-only">
                  <p>Lisa Marie</p>
                  <p>Account settings</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div> */}

      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Mobile top navigation */}
        <div className="lg:hidden">
          <div className="bg-blue-600 py-2 px-4 flex items-center justify-between sm:px-6">
            <div>
              <img
                className="h-8 w-auto"
                src="https://tailwindui.com/img/logos/workflow-mark.svg?color=white"
                alt="Workflow"
              />
            </div>
            <div>
              <button
                type="button"
                className="-mr-3 h-12 w-12 inline-flex items-center justify-center bg-blue-600 rounded-md text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setMobileMenuOpen(true)}
              >
                <span className="sr-only">Open sidebar</span>
                <MenuIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        <main className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col overflow-y-auto xl:overflow-hidden">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="bg-white border-b border-blue-gray-200 xl:hidden">
              <div className="max-w-3xl mx-auto py-3 px-4 flex items-start sm:px-6 lg:px-8">
                <a href="#" className="-ml-1 inline-flex items-center space-x-3 text-sm font-medium text-blue-gray-900">
                  <ChevronLeftIcon className="h-5 w-5 text-blue-gray-400" aria-hidden="true" />
                  <span>Settings</span>
                </a>
              </div>
            </nav>

            <div className="flex-1 flex xl:overflow-hidden">
              {/* Secondary sidebar */}
              <nav
                aria-label="Sections"
                className="hidden flex-shrink-0 w-64 bg-white border-r border-blue-gray-200 xl:flex xl:flex-col"
              >
                <div className="flex-shrink-0 h-16 px-6 border-b border-blue-gray-200 flex items-center">
                  <p className="text-lg font-medium text-blue-gray-900">Settings</p>
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto">
                <button onClick={() => setRole("/settings#account")}>
                    <a className={classNames(
                      role === "/settings#account" ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                      'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                    )}>
                    <FontAwesomeIcon icon={faUserCircle} className="flex-shrink-0 mt-5 h-6 w-6 text-blue-gray-400" aria-hidden="true"/>
                    <div className="ml-3 text-sm">
                        <p className="font-bold text-blue-gray-900">Account</p>
                        <p className="mt-1 text-blue-gray-500">Change profile pic, name, and bio.</p>
                    </div>
                    </a>
                  </button>
                  {/* <button onClick={() => setRole("/settings#calendar")}>
                    <a className={classNames(
                      role === "/settings#calendar" ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                      'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                    )}>
                    <FontAwesomeIcon icon={faCalendarAlt} className="flex-shrink-0 mt-5 h-6 w-6 text-blue-gray-400" aria-hidden="true"/>
                    <div className="ml-3 text-sm">
                        <p className="font-bold text-blue-gray-900">Calendar</p>
                        <p className="mt-1 text-blue-gray-500">Set stream and content release schedule.</p>
                    </div>
                    </a>
                  </button> */}
                  <button onClick={() => setRole("/settings#links")}>
                    <a className={classNames(
                      role === "/settings#links" ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                      'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                    )}>
                    <FontAwesomeIcon icon={faUserPlus} className="flex-shrink-0 mt-5 h-6 w-6 text-blue-gray-400" aria-hidden="true"/>
                    <div className="ml-3 text-sm">
                        <p className="font-bold text-blue-gray-900">Links</p>
                        <p className="mt-1 text-blue-gray-500">Set website and social links.</p>
                    </div>
                    </a>
                  </button>
                  <button onClick={() => setRole("/settings#help")}>
                    <a className={classNames(
                      role === "/settings#help" ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                      'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                    )}>
                    <FontAwesomeIcon icon={faQuestionCircle} className="flex-shrink-0 mt-5 h-6 w-6 text-blue-gray-400" aria-hidden="true"/>
                    <div className="ml-3 text-sm">
                        <p className="font-bold text-blue-gray-900">Help</p>
                        <p className="mt-1 text-blue-gray-500">Questions? Get answers!</p>
                    </div>
                    </a>
                  </button>
                </div>
              </nav>

              {/* Main content */}
              { role === '/settings#account' | role === '/settings' ? <Account /> : <br></br>}
              { role === '/settings#calendar' ? <CalendarSettings /> : <br></br>}
              { role === '/settings#links' ? <Links /> : <br></br>}
              { role === '/settings#help' ? <Help /> : <br></br>}
            </div>
          </div>
        </main>
      </div>
    </div>
        }
    </div>
  )
}
