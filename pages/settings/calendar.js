import React, { useEffect, useRef } from "react";
import { storage, firestore } from "../../firebase"
import { useAuth } from "../../authcontext"
import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
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
import { ChevronLeftIcon } from '@heroicons/react/solid'

const navigation = [
  { name: 'Home', href: '#', icon: HomeIcon },
  { name: 'Trending', href: '#', icon: FireIcon },
  { name: 'Bookmarks', href: '#', icon: BookmarkAltIcon },
  { name: 'Messages', href: '#', icon: InboxIcon },
  { name: 'Profile', href: '#', icon: UserIcon },
]
const subNavigation = [
  {
    name: 'Account',
    description: 'Change profile related settings',
    href: '',
    icon: CogIcon,
    current: true,
  },
  {
    name: 'Notifications',
    description: 'Enim, nullam mi vel et libero urna lectus enim. Et sed in maecenas tellus.',
    href: '#',
    icon: BellIcon,
    current: false,
  },
  // {
  //   name: 'Security',
  //   description: 'Semper accumsan massa vel volutpat massa. Non turpis ut nulla aliquet turpis.',
  //   href: '#',
  //   icon: KeyIcon,
  //   current: false,
  // },
  // {
  //   name: 'Appearance',
  //   description: 'Magna nulla id sed ornare ipsum eget. Massa eget porttitor suscipit consequat.',
  //   href: '#',
  //   icon: PhotographIcon,
  //   current: false,
  // },
  // {
  //   name: 'Billing',
  //   description: 'Orci aliquam arcu egestas turpis cursus. Lectus faucibus netus dui auctor mauris.',
  //   href: '#',
  //   icon: CashIcon,
  //   current: false,
  // },
  // {
  //   name: 'Integrations',
  //   description: 'Nisi, elit volutpat odio urna quis arcu faucibus dui. Mauris adipiscing pellentesque.',
  //   href: '#',
  //   icon: ViewGridAddIcon,
  //   current: false,
  // },
  // {
  //   name: 'Additional Resources',
  //   description: 'Quis viverra netus donec ut auctor fringilla facilisis. Nunc sit donec cursus sit quis et.',
  //   href: '#',
  //   icon: SearchCircleIcon,
  //   current: false,
  // },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Calendar() {
  const usernameRef = useRef()
  const [fileUrl, setFileUrl] = useState();
  const { currentUser } = useAuth();
  const [ user, setUser ] = useState(""); 
  
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




  useEffect(() => {
    const {pathname} = Router
    if(pathname == '/settings' && !currentUser ){
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
         
    <div className="flex-1 max-h-screen xl:overflow-y-auto">
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:py-12 lg:px-8">
      <h1 className="text-3xl font-extrabold text-blue-gray-900">CALENDAR</h1>

      <form className="mt-6 space-y-8 divide-y divide-y-blue-gray-200" onSubmit={updateProfile}>
        <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-6 sm:gap-x-6">
          <div className="sm:col-span-6">
            <h2 className="text-xl font-medium text-blue-gray-900">Profile</h2>
            <p className="mt-1 text-sm text-blue-gray-500">
              Update the content people can view on your public profile.
            </p>
          </div>


          <div>
        <label htmlFor="username" className="block text-sm font-medium ">
          Username
        </label>
        <div className="mt-1">
          <input
            id="username"
            name="username"
            type="username"
            ref={usernameRef}
            autoComplete="username"
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>

          <div className="sm:col-span-6">
            <label htmlFor="photo" className="block text-sm font-medium text-blue-gray-900">
              Photo
            </label>
            <div className="mt-1 flex items-center">
              <img
                className="inline-block h-12 w-12 rounded-full"
                src={user.avatar}
                alt="avatar"
              />
              <div className="ml-4 flex">
                <div className="relative bg-white py-2 px-3 border border-blue-gray-300 rounded-md shadow-sm flex items-center cursor-pointer hover:bg-blue-gray-50 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-blue-gray-50 focus-within:ring-blue-500">
                  <label
                    htmlFor="user_photo"
                    className="relative text-sm font-medium text-blue-gray-900 pointer-events-none"
                  >
                    <span>Change</span>
                    <span className="sr-only"> user photo</span>
                  </label>
                  <input
                    type="file"
                    onChange={onFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer border-gray-300 rounded-md"
                  />
                </div>
                <button
                  type="button"
                  className="ml-3 bg-transparent py-2 px-3 border border-transparent rounded-md text-sm font-medium text-blue-gray-900 hover:text-blue-gray-700 focus:outline-none focus:border-blue-gray-300 focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-gray-50 focus:ring-blue-500"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>

          <div className="sm:col-span-6">
            <label htmlFor="description" className="block text-sm font-medium text-blue-gray-900">
              Bio
            </label>
            <div className="mt-1">
              <textarea
                id="description"
                name="description"
                rows={4}
                className="block w-full border border-blue-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500"
                defaultValue={''}
              />
            </div>
            <p className="mt-3 text-sm text-blue-gray-500">
              If it makes people laugh it must be good right?
            </p>
          </div>

          <div className="sm:col-span-6">
            <label htmlFor="url" className="block text-sm font-medium text-blue-gray-900">
              Manage links
            </label>
            <input
              type="text"
              name="url"
              id="url"
              className="mt-1 block w-full border-blue-gray-300 rounded-md shadow-sm text-blue-gray-900 sm:text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="pt-8 grid grid-cols-1 gap-y-6 sm:grid-cols-6 sm:gap-x-6">
          <div className="sm:col-span-6">
            <h2 className="text-xl font-medium text-blue-gray-900">Personal Information</h2>
            <p className="mt-1 text-sm text-blue-gray-500">
              This information will be displayed publicly so be careful what you share.
            </p>
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="email_address" className="block text-sm font-medium text-blue-gray-900">
              Email address
            </label>
            <input
              type="text"
              name="email_address"
              id="email_address"
              autoComplete="email"
              className="mt-1 block w-full border-blue-gray-300 rounded-md shadow-sm text-blue-gray-900 sm:text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="phone_number" className="block text-sm font-medium text-blue-gray-900">
              Phone number
            </label>
            <input
              type="text"
              name="phone_number"
              id="phone_number"
              autoComplete="tel"
              className="mt-1 block w-full border-blue-gray-300 rounded-md shadow-sm text-blue-gray-900 sm:text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="country" className="block text-sm font-medium text-blue-gray-900">
              Country
            </label>
            <input
              type="text"
              name="country"
              id="country"
              autoComplete="country"
              className="mt-1 block w-full border-blue-gray-300 rounded-md shadow-sm text-blue-gray-900 sm:text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="sm:col-span-3">
            <label htmlFor="language" className="block text-sm font-medium text-blue-gray-900">
              Language
            </label>
            <input
              type="text"
              name="language"
              id="language"
              className="mt-1 block w-full border-blue-gray-300 rounded-md shadow-sm text-blue-gray-900 sm:text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <p className="text-sm text-blue-gray-500 sm:col-span-6">
            This account was created on{' '}
            <time dateTime="2017-01-05T20:35:40">January 5, 2017, 8:35:40 PM</time>.
          </p>
        </div>

        <div className="pt-8 flex justify-end">
          <button
            type="button"
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-blue-gray-900 hover:bg-blue-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  </div>
  )
}