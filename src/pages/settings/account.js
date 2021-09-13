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
import Link from 'next/link'
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

]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Account() {
  const usernameRef = useRef();
  const [fileUrl, setFileUrl] = useState();
  const { currentUser } = useAuth();
  const [ user, setUser ] = useState(""); 
  const bioRef = useRef();
  const userDocRef = firestore.doc(`users/${currentUser.uid}`);
  
  const updateProfile = (event) => {

    event.preventDefault();

    const name = event.target.username;

    if (!name) { return }
    if (fileUrl !== undefined) {

    userDocRef.update({
      username: usernameRef.current.value.toLowerCase(),
      avatar: fileUrl,
      bio: bioRef.current.value
    })

    } else {
      userDocRef.update({
        username: usernameRef.current.value.toLowerCase(),
        bio: bioRef.current.value
      })
    }

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
    <div className="max-w-3xl mx-auto py-10 px-4 xl:px-6 lg:py-12 lg:px-8">
      <h1 className="text-3xl font-extrabold text-blue-gray-900">Account</h1>

      <form className="mt-6 space-y-8" onSubmit={updateProfile}>
        <div className="grid grid-cols-1 gap-y-6 xl:grid-cols-6 xl:gap-x-6">
          <div className="xl:col-span-6">
            <h2 className="text-xl font-medium text-blue-gray-900">Profile</h2>
            <p className="mt-1 text-xl text-blue-gray-500">
              Update the content people can view on your public profile.
            </p>
          </div>


          <div>
        <label htmlFor="username" className="block text-xl font-medium ">
          Username
        </label>
        <div className="mt-1">
          <input
            id="username"
            name="username"
            type="username"
            ref={usernameRef}
            defaultValue={user.username}
            autoComplete="username"
            className="appearance-none block  px-3 py-2 border border-gray-300 rounded-md shadow-xl placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 xl:text-xl"
          />
        </div>
      </div>

          <div className="xl:col-span-6">
            <label htmlFor="photo" className="block text-xl font-medium text-blue-gray-900">
              Photo
            </label>
            <div className="mt-1 flex items-center">
              <img
                className="inline-block h-12 w-12 rounded-full"
                src={user.avatar}
                alt="avatar"
              />
              <div className="ml-4 flex">
                <div className="relative bg-white py-2 px-3 border border-blue-gray-300 rounded-md shadow-xl flex items-center cursor-pointer hover:bg-blue-gray-50 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-blue-gray-50 focus-within:ring-blue-500">
                  <label
                    htmlFor="user_photo"
                    className="relative text-xl font-medium text-blue-gray-900 pointer-events-none"
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
                  className="ml-3 bg-transparent py-2 px-3 border border-transparent rounded-md text-xl font-medium text-blue-gray-900 hover:text-blue-gray-700 focus:outline-none focus:border-blue-gray-300 focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-gray-50 focus:ring-blue-500"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>

          <div className="xl:col-span-6">
            <label htmlFor="description" className="block text-xl font-medium text-blue-gray-900">
              Bio
            </label>
            <div className="mt-1">
              <textarea
                id="bio"
                name="bio"
                ref={bioRef}
                rows={4}
                defaultValue={user.bio === undefined ? "" : user.bio}
                className="block w-full border border-blue-gray-300 rounded-md shadow-xl xl:text-xl focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <p className="mt-3 text-xl text-blue-gray-500">
              If it makes people laugh it must be good right?
            </p>
          </div>
        </div>
        <div className="pt-8 flex justify-end">
          <button
            type="button"
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-blue-gray-900 hover:bg-blue-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Link href="/profile">
              Cancel
            </Link>
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
