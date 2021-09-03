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
// Links
import { faCalendarAlt, faClock , faSign, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from 'next/link';
import CalModal from '../../components/calModal';
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

export default function CalendarSettings() {
  const usernameRef = useRef();
  const [value, onChange] = useState(new Date());
  const [fileUrl, setFileUrl] = useState();
  const { currentUser } = useAuth();
  const [user, setUser] = useState("");
  var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var today = new Date();
  var date = days[today.getDay()];
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
      <div className="px-2">
        <h1 className="text-3xl font-extrabold text-blue-gray-900">CALENDAR</h1>

        <form className="mt-6 space-y-8 " onSubmit={updateProfile}>
          <div className="flex flex-col">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8 mb-6 mt-6">
              <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left  font-medium text-gray-500 uppercase tracking-wider"
                        >
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-6 w-10">
                              <FontAwesomeIcon icon={faCalendarAlt} />
                            </div>
                            <div className="text-sm font-medium text-gray-900"> Date</div>
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left  font-medium text-gray-500 uppercase tracking-wider"
                        >
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-6 w-10">
                              <FontAwesomeIcon icon={faClock} />
                            </div>

                            <div className="text-sm font-medium text-gray-900"> Time</div>
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left  font-medium text-gray-500 uppercase tracking-wider"
                        >
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-6 w-10">
                              <FontAwesomeIcon icon={faSign} />
                            </div>
                            <div className="text-sm font-medium text-gray-900"> title </div>
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left  font-medium text-gray-500 uppercase tracking-wider"
                        >
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-6 w-10">
                              <FontAwesomeIcon icon={faInfoCircle} />
                            </div>
                            <div className="text-sm font-medium text-gray-900"> #Tags / @Creators </div>
                          </div>
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Edit</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {/* <div className="flex items-center">
                            <div className="text-xl font-medium text-gray-900 pr-4"> {date} </div>
                            <div className="px-2 py-1.5 inline-flex text-sm leading-5 font-semibold rounded-full bg-purple-300 "> 7 PM - 12 AM PDT</div>
                          </div> */}

                          <CalModal />
                        </td>

                        <td className="px-1 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                              Start Time
                            </label>
                            <div className="pr-2"></div>
                            <select
                              id="startTime"
                              name="startTime"
                              className="px-2 py-1.5 inline-flex text-sm leading-5 font-semibold rounded-full bg-indigo-300"
                              defaultValue="7:00"
                            >
                              <option>12:00</option>
                              <option>12:30</option>
                              <option>1:00</option>
                              <option>1:30</option>
                              <option>2:00</option>
                              <option>2:30</option>
                              <option>3:00</option>
                              <option>3:30</option>
                              <option>4:00</option>
                              <option>4:30</option>
                              <option>5:00</option>
                              <option>5:30</option>
                              <option>6:00</option>
                              <option>6:30</option>
                              <option>7:00</option>
                              <option>7:30</option>
                              <option>8:00</option>
                              <option>8:30</option>
                              <option>9:00</option>
                              <option>9:30</option>
                              <option>10:00</option>
                              <option>10:30</option>
                              <option>11:00</option>
                              <option>11:30</option>
                            </select>
                            <div className="pr-2"></div>
                            <select
                              id="amPm"
                              name="amPm"
                              className="px-2 py-1.5 inline-flex text-sm leading-5 font-semibold rounded-full bg-pink-300"
                              defaultValue="pm"
                            >
                              <option>am</option>
                              <option>pm</option>
                            </select>
                          </div>
                          <div className="py-2 flex items-center">
                            <label htmlFor="endTime" className="text-sm font-medium text-gray-700">
                              End Time
                            </label>
                            <div className="pr-2"></div>
                            <select
                              id="endTime"
                              name="endTime"
                              className="px-2 py-1.5 inline-flex text-sm leading-5 font-semibold rounded-full bg-pink-300"
                              defaultValue="10:00"
                            >
                              <option>12:00</option>
                              <option>12:30</option>
                              <option>1:00</option>
                              <option>1:30</option>
                              <option>2:00</option>
                              <option>2:30</option>
                              <option>3:00</option>
                              <option>3:30</option>
                              <option>4:00</option>
                              <option>4:30</option>
                              <option>5:00</option>
                              <option>5:30</option>
                              <option>6:00</option>
                              <option>6:30</option>
                              <option>7:00</option>
                              <option>7:30</option>
                              <option>8:00</option>
                              <option>8:30</option>
                              <option>9:00</option>
                              <option>9:30</option>
                              <option>10:00</option>
                              <option>10:30</option>
                              <option>11:00</option>
                              <option>11:30</option>
                            </select>
                            <div className="pr-2"></div>
                            <select
                              id="amPm"
                              name="amPm"
                              className="px-2 py-1.5 inline-flex text-sm leading-5 font-semibold rounded-full bg-indigo-300 "
                              defaultValue="pm"
                            >
                              <option>am</option>
                              <option>pm</option>
                            </select>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <label htmlFor="title" className="block text-xl font-medium pr-2">
                              Title
                            </label>
                            <div className="mt-1">
                              <input
                                id="title"
                                name="title"
                                type="title"
                                autoComplete="title"
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-xl placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 xl:text-xl"
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                          <label htmlFor="tags" className="block text-xl font-medium pr-2">
                              Tags
                            </label>
                            <div className="mt-1">
                              <input
                                id="tags"
                                name="tags"
                                type="tags"
                                autoComplete="tag"
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-xl placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 xl:text-xl"
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link href="/settings#calendar">
                            <a className="text-indigo-600 hover:text-indigo-900">
                              Add Event
                            </a>
                          </Link>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
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
    </div >
  )
}
