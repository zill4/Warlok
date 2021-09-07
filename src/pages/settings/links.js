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



function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Links() {
  const usernameRef = useRef()
  const [fileUrl, setFileUrl] = useState();
  const { currentUser } = useAuth();
  const [user, setUser] = useState("");

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
    const { pathname } = Router
    if (pathname == '/settings' && !currentUser) {
      Router.push('/')
    }
    else {
      const getUser = async () => {
        const userCollection = await firestore.doc(`users/${currentUser.uid}`).get()
        setUser(await userCollection.data());
      }
      getUser()
    }
  }, [])


  return (

    <div className="flex-1 max-h-screen xl:overflow-y-auto">
      <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:py-12 lg:px-8">
        <h1 className="text-3xl font-extrabold text-blue-gray-900">LINKS</h1>

        <form className="mt-6 space-y-8" onSubmit={updateProfile}>
          <div>
            <label htmlFor="twitch-link" className="block text-sm font-medium text-gray-700">
              Twitch
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                twitch.tv/
              </span>
              <input
                type="text"
                name="twitch-link"
                id="twitch-link"
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300"
                placeholder="TwitchHandle"
              />
            </div>
          </div>
          <div>
            <label htmlFor="youtube-link" className="block text-sm font-medium text-gray-700">
              Youtube
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                youtube.com/channel/
              </span>
              <input
                type="text"
                name="youtube-link"
                id="youtube-link"
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300"
                placeholder="ChannelName"
              />
            </div>
          </div>
          <div>
            <label htmlFor="twitch-link" className="block text-sm font-medium text-gray-700">
              Tiktok
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                tiktok.com/
              </span>
              <input
                type="text"
                name="twitch-link"
                id="twitch-link"
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300"
                placeholder="@TiktokHandle"
              />
            </div>
          </div>
          <div>
            <label htmlFor="website-link" className="block text-sm font-medium text-gray-700">
              Website
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
              https://
              </span>
              <input
                type="text"
                name="website-link"
                id="website-link"
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300"
                placeholder="www.example.com"
              />
            </div>
          </div>
          <div>
            <label htmlFor="twitter-link" className="block text-sm font-medium text-gray-700">
              Twitter
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                twitter.com/
              </span>
              <input
                type="text"
                name="twittter-link"
                id="twitter-link"
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300"
                placeholder="TwitterHandle"
              />
            </div>
          </div>
          <div>
            <label htmlFor="merch-link" className="block text-sm font-medium text-gray-700">
              Merch
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                https://
              </span>
              <input
                type="text"
                name="merch-link"
                id="merch-link"
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300"
                placeholder="www.example.com"
              />
            </div>
          </div>
          <div>
            <label htmlFor="facebook-link" className="block text-sm font-medium text-gray-700">
              Facebook
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                facebook.com/
              </span>
              <input
                type="text"
                name="facebook-link"
                id="facebook-link"
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300"
                placeholder="FacebookHandle"
              />
            </div>
          </div>
          <div>
            <label htmlFor="twitch-link" className="block text-sm font-medium text-gray-700">
              Reddit
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                reddit.com/r/
              </span>
              <input
                type="text"
                name="reddit-link"
                id="reddit-link"
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300"
                placeholder="RedditCommunity"
              />
            </div>
          </div>
          <div>
            <label htmlFor="discord-link" className="block text-sm font-medium text-gray-700">
              Discord
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
              discord.com/invite/
              </span>
              <input
                type="text"
                name="discord-link"
                id="discord-link"
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300"
                placeholder="InviteLink"
              />
            </div>
          </div>
          <div>
            <label htmlFor="linkedin-link" className="block text-sm font-medium text-gray-700">
              LinkedIn
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
              linkedin.com/in/
              </span>
              <input
                type="text"
                name="linkedin-link"
                id="linkedin-link"
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300"
                placeholder="InLink"
              />
            </div>
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
