import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../../authcontext"
import { storage, firestore } from "../../../firebase"
import Link from 'next/link'
import { useRouter } from 'next/router'

//images

import backgroundImg from '../../../../public/images/warlok_logo.png'
import profile_pic from '../../../../public/images/warlok_color.png'
// import { useParams } from "react-router-dom";


const people = [
  {
    name: '7am - 7pm ?',
    title: 'World of Warcraft',
    department: 'Lvling to 70',
    role: '12hrs',
    email: 'Monday',
    image: profile_pic,
  },
  {
    name: '7am - 7pm ?',
    title: 'World of Warcraft',
    department: 'Lvling to 70',
    role: '12hrs',
    email: 'Tuesday',
    image: profile_pic,
  },
  {
    name: '7am - 7pm ?',
    title: 'World of Warcraft',
    department: 'Lvling to 70',
    role: '12hrs',
    email: 'Wednesday',
    image: profile_pic,
  },
  {
    name: '7am - 7pm ?',
    title: 'World of Warcraft',
    department: 'Lvling to 70',
    role: '12hrs',
    email: 'Thursday',
    image: profile_pic,
  },
  {
    name: '7am - 7pm ?',
    title: 'World of Warcraft',
    department: 'Lvling to 70',
    role: '12hrs',
    email: 'Friday',
    image: profile_pic,
  },

  // More people...
]

const files = [
  {
    title: 'IMG_4985.HEIC',
    size: '3.9 MB',
    source:
      'https://images.unsplash.com/photo-1582053433976-25c00369fc93?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=512&q=80',
  },
  {
    title: 'IMG_4985.HEIC',
    size: '3.9 MB',
    source:
      'https://images.unsplash.com/photo-1582053433976-25c00369fc93?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=512&q=80',
  },
  {
    title: 'IMG_4985.HEIC',
    size: '3.9 MB',
    source:
      'https://images.unsplash.com/photo-1582053433976-25c00369fc93?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=512&q=80',
  },
  {
    title: 'IMG_4985.HEIC',
    size: '3.9 MB',
    source:
      'https://images.unsplash.com/photo-1582053433976-25c00369fc93?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=512&q=80',
  },
  // More files...
]

export function Thumbnails() {
  return (
    <ul role="list" className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8 mb-6 mt-6">
      {files.map((file) => (
        <li key={backgroundImg} className="relative">
          <div className="group block w-full aspect-w-16 aspect-h-9 rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-100 focus-within:ring-indigo-500 overflow-hidden">
            <img src={backgroundImg} alt="" className="object-cover pointer-events-none group-hover:opacity-75" />
            <button type="button" className="absolute inset-0 focus:outline-none">
              <span className="sr-only">View details for {file.title}</span>
            </button>
          </div>
          <p className="mt-2 block text-sm font-medium text-gray-900 truncate pointer-events-none">{file.title}</p>
          <p className="block text-sm font-medium text-gray-500 pointer-events-none">{file.size}</p>
        </li>
      ))}
    </ul>
  )
}

export function Calendar() {
  return (
    <div className="flex flex-col">
      <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8 mb-6 mt-6">
        <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
          <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Time
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Category
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Title
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Duration / Tags / #
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {people.map((person) => (
                  <tr key={person.email}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img className="h-10 w-10 rounded-full" src={person.image} alt="" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{person.name}</div>
                          <div className="text-sm text-gray-500">{person.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{person.title}</div>
                      <div className="text-sm text-gray-500">{person.department}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{person.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a href="#" className="text-indigo-600 hover:text-indigo-900">
                        Edit
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}




export default function PublicProfile  () {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [ user, setUser ] = useState(""); 
  const { profile } = router.query;
  // const { profile } = useParams();

  useEffect(() => {
    const getUser = async() => {
      const userCollection = await firestore.collection('users').where('username', '==', profile).get();
      //console.log(userCollection);
      if (userCollection.empty) {
            setUser("404");
      } else {
      setUser(await userCollection.docs[0].data());
        
      //console.log("user", user.username);
         }
      }
    getUser()
  }, [])
  return (
    <div>
           {user === '404' ?
            <div className="w-full flex items-center justify-center h-screen text-center text-7xl">
                <h1>404 Profile not found</h1>
            </div>: 
      <div >
        <section className="inset-y-2  h-500-px">
          <div
            className="top-auto bottom-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden h-70-px"
            style={{ transform: "translateZ(0)" }}
          >
            <svg
              className="absolute bottom-0 overflow-hidden"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
              version="1.1"
              viewBox="0 0 2560 100"
              x="0"
              y="0"
            >
              <polygon
                className="text-blueGray-200 fill-current"
                points="2560 0 2560 100 0 100"
              ></polygon>
            </svg>
          </div>
        </section>
        <section className="relative py-16 bg-blueGray-200">
          <div className="container mx-auto px-4">
            <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-xl rounded-lg -mt-10">
              <div className="px-6 ">
                <div className="mb-6 mt-6 rounded flex flex-wrap justify-center bk bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
                  <div className="w-full lg:w-3/12 px-4 lg:order-2 flex justify-center mt-6 mb-5">
                    <div className="relative">
                      <img
                        alt="..."
                        src={user.avatar}// 800 x 800 
                        className="shadow-xl rounded-full h-auto align-middle border-none "
                      />
                    </div>
                  </div>
                  <div className="w-full lg:w-4/12 px-4 lg:order-3 lg:text-right lg:self-center">
                  <button
                        type="button"
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Connect
                      </button>
                  </div>
                  <div className="w-full lg:w-4/12 px-4 lg:order-1">
                    <div className="flex justify-center py-4 lg:pt-4 pt-8">

                      <div className="mr-4 p-3 text-center" >
                        <h5 className="text-6xl font-semibold leading-normal text-blueGray-700 mb-2 " >
                          {user.username}
                        </h5>
                      </div>
                    </div>
                    <div className="justify-center lg:mr-4 p-3 items-stretch flex text-center">
                      <span className="text-xl font-bold block uppercase tracking-wide text-blueGray-600 mr-2 ml-2">
                            69
                            <br/>
                            <span className="text-sm text-blueGray-400">
                            🐸 Pepe's
                            </span>
                      </span>
                      <span className="text-xl font-bold block uppercase tracking-wide text-blueGray-600 mr-2 ml-2">
                            420
                            <br/>
                            <span className="text-sm text-blueGray-400">
                            Posts
                            </span>
                      </span>
                      <span className="text-xl font-bold block uppercase tracking-wide text-blueGray-600 mr-2 ml-2">
                            0
                            <br/>
                            <span className="text-sm text-blueGray-400">
                            Likes
                            </span>
                      </span>
                    </div>
                    <div className="justify-center lg:mr-4 p-3 items-stretch flex text-center">


                    </div>
                  </div>
                </div>
                <div className="text-center mt-2">
                  
                  <p className="text-black text-lg font-medium">
                                This is the autobiography of the E, and if you ever fuck with me
              You'll get taken by a stupid dope brotha who will smother
              Word to the motherfucker, straight outta Compton
                  </p>
                  <div className="border-t border-blueGray-200 mb-6 mt-6 rounded flex justify-around flex-wrap">
                        <Thumbnails/>
                    {/* <div className="px-4 lg:order-2 flex mt-6 mb-5 text-4xl text-center">
                    </div> */}
                    {/* <div className=" px-4 lg:order-3 lg:text-right lg:self-center text-4xl">
                        
                    </div> */}
                    <div className=" lg:order-1 px-3 items-stretch flex text-center mt-6">
                      <span className="text-xl font-bold block uppercase tracking-wide text-blueGray-600 mr-2 ml-2">
                            <i className="fab fa-twitch"></i>
                            <br/>
                            <span className="text-sm text-blueGray-400">
                            Twitch
                            </span>
                      </span>
                      <span className="text-xl font-bold block uppercase tracking-wide text-blueGray-600 mr-2 ml-2">
                      <i className="fab fa-youtube"></i>
                            <br/>
                            <span className="text-sm text-blueGray-400">
                            YouTube
                            </span>
                      </span>
                      <span className="text-xl font-bold block uppercase tracking-wide text-blueGray-600 mr-2 ml-2">
                      <i className="fab fa-tiktok"></i>
                            <br/>
                            <span className="text-sm text-blueGray-400">
                            TikTok
                            </span>
                      </span>
                      <span className="text-xl font-bold block uppercase tracking-wide text-blueGray-600 mr-2 ml-2">
                            <i className="fab fa-twitter"></i>
                            <br/>
                            <span className="text-sm text-blueGray-400">
                            Twitter
                            </span>
                      </span>
                      <span className="text-xl font-bold block uppercase tracking-wide text-blueGray-600 mr-2 ml-2">
                      <i className="fab fa-instagram"></i>
                            <br/>
                            <span className="text-sm text-blueGray-400">
                            Instagram
                            </span>
                      </span>
                      <span className="text-xl font-bold block uppercase tracking-wide text-blueGray-600 mr-2 ml-2">
                      <i className="fab fa-facebook"></i>
                            <br/>
                            <span className="text-sm text-blueGray-400">
                            Facebook
                            </span>
                      </span>
                    </div>
                  </div>

          <Calendar />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
        }
      </div>
  );
}