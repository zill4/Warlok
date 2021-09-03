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

export default function Help() {
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
    <div className="max-w-3xl mx-auto py-10 px-4 xl:px-6 lg:py-12 lg:px-8">
      <h1 className="text-3xl font-extrabold text-blue-gray-900">HELP</h1>

      <form className="mt-6 space-y-8" onSubmit={updateProfile}>
        <div className="pt-8 grid grid-cols-1 gap-y-6 xl:grid-cols-6 xl:gap-x-6">
          <div className="xl:col-span-6">
            <h2 className="text-xl font-medium text-blue-gray-900">Have an issue or want to learn more?</h2>
            <p className="mt-1 text-l text-blue-gray-500">
              Leave us a message a way to contact you and we'll be in touch.
            </p>
          </div>

          <div className="xl:col-span-3">
            <label htmlFor="email_address" className="block text-xl font-medium text-blue-gray-900">
              Email address
            </label>
            <input
              type="text"
              name="email_address"
              id="email_address"
              autoComplete="email"
              className="mt-1 block w-full border-blue-gray-300 rounded-md shadow-xl text-blue-gray-900 xl:text-xl focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="xl:col-span-3">
            <label htmlFor="phone_number" className="block text-xl font-medium text-blue-gray-900">
              Phone number
            </label>
            <input
              type="text"
              name="phone_number"
              id="phone_number"
              autoComplete="tel"
              className="mt-1 block w-full border-blue-gray-300 rounded-md shadow-xl text-blue-gray-900 xl:text-xl focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="xl:col-span-6">
            <label htmlFor="description" className="block text-xl font-medium text-blue-gray-900">
              Message
            </label>
            <div className="mt-1">
              <textarea
                id="description"
                name="description"
                rows={4}
                className="block w-full border border-blue-gray-300 rounded-md shadow-xl xl:text-xl focus:ring-blue-500 focus:border-blue-500"
                defaultValue={''}
              />
            </div>
          </div>

          <p className="text-xl text-blue-gray-500 xl:col-span-6">
            Need answers now?! Call or email us directly at Justin@warlok.net - (949)873-3619
          </p>
        </div>

        <div className="pt-8 flex justify-end">

          <button
            type="submit"
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-xl text-xl font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  </div>
  )
}
