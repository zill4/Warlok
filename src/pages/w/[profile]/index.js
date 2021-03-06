import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../../authcontext";
import { storage, firestore } from "../../../firebase";
import { useRouter } from 'next/router';
import Link from 'next/link';
import Error from 'next/error';

// Components
import VideoModal from '../../../components/videoModal';
import LinkModal from '../../../components/linkModal';

// Images
import profile_pic from "../../../../public/images/warlok_color.png";
import { DotsVerticalIcon } from '@heroicons/react/solid'
import { faTwitch, faYoutube, faTwitter, faTiktok, faFacebook, faReddit, faDiscord, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { faClock, faGamepad, faSign, faInfoCircle, faGlobe, faTshirt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { user } from "firebase-functions/v1/auth";
import link from "next/link";

const people = [

]
const projects = [
  { name: 'Graph API', initials: 'GA', href: '#', members: 16, bgColor: 'bg-pink-600' },
  { name: 'Component Design', initials: 'CD', href: '#', members: 12, bgColor: 'bg-purple-600' },
  { name: 'Templates', initials: 'T', href: '#', members: 16, bgColor: 'bg-yellow-500' },
  { name: 'React Components', initials: 'RC', href: '#', members: 8, bgColor: 'bg-green-500' },
]
const files = [

]

export function Thumbnails() {

  return (
    <div>
      {files.length > 0 ?
        <ul role="list" className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8 mb-6 mt-6">
          {files.map((file) => (
            <li key="images/TwitchGlitchWhite.png" className="relative">
              <div className="group block w-full aspect-w-16 aspect-h-9 rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-100 focus-within:ring-indigo-500 overflow-hidden">
                <img src="images/TwitchGlitchWhite.jpg" alt="" className="object-cover pointer-events-none group-hover:opacity-75" />
                <button type="button" className="absolute inset-0 focus:outline-none">
                  <span className="sr-only">View details for {file.title}</span>
                </button>
              </div>
              <p className="mt-2 block text-sm font-medium text-gray-900 truncate pointer-events-none">{file.title}</p>
              <p className="block text-sm font-medium text-gray-500 pointer-events-none">{file.size}</p>
            </li>
          ))}
        </ul>
        :
        // <VideoModal />
        <div></div>
      }
    </div>
  )
}

export function Calendar() {
  var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var today = new Date();
  var date = days[today.getDay()];
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
                        <FontAwesomeIcon icon={faGamepad} />
                      </div>
                      <div className="text-sm font-medium text-gray-900"> category</div>
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
                {people.length > 0 ?
                  <div>
                    {people.map((person) => (
                      <tr key={person.email}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <FontAwesomeIcon icon={faClock} />
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
                          <Link href="/settings">
                            <a className="text-indigo-600 hover:text-indigo-900">
                              Edit
                            </a>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </div>
                  :

                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-xl font-medium text-gray-900 pr-4"> {date}</div>
                        <div className="px-2 py-1.5 inline-flex text-sm leading-5 font-semibold rounded-full bg-purple-300 "> 7 PM - 12 AM PDT</div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="px-2 py-1.5 inline-flex text-sm leading-5 font-semibold rounded-full bg-pink-300 ">RPG</div>
                        <div className="pr-2"></div>
                        <div className="px-2 py-1.5 inline-flex text-sm leading-5 font-semibold rounded-full bg-indigo-300 ">Action Adventure</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-xl font-medium text-gray-900 pr-4"> Slaying lv. 42 Dragons! ????</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-xl font-medium text-gray-900 pr-4"> #Example @CreatorName </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href="/settings">
                        <a className="text-indigo-600 hover:text-indigo-900">
                          Edit
                        </a>
                      </Link>
                    </td>
                  </tr>

                }

              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}


function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}
const dummyUser = {
  username: 'loading...',
  avatar: "https://images.unsplash.com/photo-1608237652484-b478fac3bf7c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
}

export default function PublicProfile() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const [user, setUser] = useState("");
  const [userVideos, setUserVideos] = useState();
  // const { profile } = useParams();


  useEffect(() => {
    const getUser = async () => {

      if (router && router.query.profile) {
        const userCollection = await firestore.collection('users').where('username', '==', router.query.profile).get();
        const userVideoCollection = await firestore.doc(`users/${userCollection.docs[0]._delegate._document.key.path.segments[6]}`).collection('videos').get()
        setUserVideos(await userVideoCollection);
        //console.log(userCollection);
        if (userCollection.empty) {

        } else {
          if (!user) {
            setUser(await userCollection.docs[0].data());
          }
          //console.log("user", user.username);
        }
      }
    }
    getUser()
  }, [router])

  return (
    <div>
      {!user ? <main
        className="min-h-screen bg-cover bg-top sm:bg-top"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1606422699425-f7122890005f?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2555&q=80")',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-16 text-center sm:px-6 sm:py-24 lg:px-8 lg:py-48">
          <p className="text-sm font-semibold text-white text-opacity-50 uppercase tracking-wide">404 error</p>
          <h1 className="mt-2 text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
            Sorry looks like this profile doesn't exist yet!
          </h1>
          <p className="mt-2 text-lg font-medium text-white text-opacity-50">
            Consider asking them to sign up or creating the account yourself 
          </p>
          <div className="mt-6">
            <Link href="/">
            <a
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white text-opacity-75 bg-pink-400 bg-opacity-75 sm:bg-opacity-25 sm:hover:bg-opacity-50"
            >
              Go back home
            </a>
            </Link>
          </div>
        </div>
      </main> :
        <div>
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
                          alt="avatar"
                          src={user === undefined ? '' : user.avatar}
                          className="shadow-xl rounded-full h-auto align-middle border-none "
                        />
                      </div>
                    </div>
                    <div className="w-full lg:w-4/12 px-4 lg:order-3 lg:text-right lg:self-center">
                    </div>
                    <div className="w-full lg:w-4/12 px-4 lg:order-1">
                      <div className="flex justify-center py-4 lg:pt-4 pt-8">

                        <div className="mr-4 p-3 text-center" >
                          <h5 className="text-6xl font-semibold leading-normal text-blueGray-700 mb-2 " >
                            {user === undefined ? '' : user.username}
                          </h5>
                        </div>
                      </div>
                      <div className="justify-center lg:mr-4 p-3 items-stretch flex text-center">
                        {/* <span className="text-xl font-bold block uppercase tracking-wide text-blueGray-600 mr-2 ml-2">
                            69
                            <br />
                            <span className="text-sm text-blueGray-400">
                              ???? Pepe's
                            </span>
                          </span>
                          <span className="text-xl font-bold block uppercase tracking-wide text-blueGray-600 mr-2 ml-2">
                            420
                            <br />
                            <span className="text-sm text-blueGray-400">
                              Posts
                            </span>
                          </span>
                          <span className="text-xl font-bold block uppercase tracking-wide text-blueGray-600 mr-2 ml-2">
                            0
                            <br />
                            <span className="text-sm text-blueGray-400">
                              Likes
                            </span>
                          </span> */}
                      </div>
                      <div className="justify-center lg:mr-4 p-3 items-stretch flex text-center">
                        <div
                          className="bg-purple-500 active:bg-lightBlue-600 uppercase text-white font-bold hover:shadow-md shadow text-xs px-4 py-2 rounded outline-none focus:outline-none sm:mr-2 mb-1 ease-linear transition-all duration-150"
                          type="button"
                        >
                          <Link href="/settings">
                            <a> Edit Profile</a>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-center mt-2">

                    <p className="text-black text-lg font-medium">
                      {user.bio === undefined ? "set up bio in settings!" : user.bio}
                    </p>
                    <div className="border-t border-blueGray-200 mb-6 mt-6 rounded flex justify-around flex-wrap">
                      <div className="w-1/2">
                      {userVideos !== undefined ?
                          <ul role="list" className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8 mb-6 mt-6">
                            {userVideos.docs.map((file) => (
                              <li className="relative">
                                <div className="group block w-full aspect-w-16 aspect-h-9 rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-100 focus-within:ring-indigo-500 overflow-hidden">
                                  <img src={file.data().videoThumbnail} alt="video thumbnail" className="object-cover pointer-events-none group-hover:opacity-75" />
                                </div>
                                <a href={file.data().videoLink} className="mt-2 block text-sm font-medium text-gray-900">{file.data().videoTitle}</a>
                                {/* <p className="block text-sm font-medium text-gray-500 pointer-events-none">{file.size}</p> */}
                              </li>
                            ))}
                                   </ul>
                            :
                            <div></div>
                      }
                      </div>
                      <div className="w-1/2">
                        <div>
                          {user !== undefined ?
                            <div>
                              <h2 className="text-gray-500 text-xs font-medium uppercase tracking-wide">Pinned Links</h2>
                              <ul role="list" className="mt-3 grid grid-cols-1 gap-5 sm:gap-6 sm:grid-cols-1 lg:grid-cols-1">
                                {/* TWITCH */}
                                {user.twitch !== undefined ?
                                  <li className="flex shadow-sm rounded-md">
                                    <div
                                      className='flex-shrink-0 flex items-center justify-center w-16 text-white bg-purple-600 text-xl font-medium rounded-l-md'>
                                      <FontAwesomeIcon icon={faTwitch} />
                                    </div>

                                    <div className="flex-1 flex items-center justify-between border-t border-r border-b border-gray-200 bg-white rounded-r-md truncate">
                                      <div className="flex-1 px-4 py-2 text-sm truncate">
                                        <a href={user.twitch} className="text-xl text-blue-600 font-medium hover:text-pink-200">
                                          {user.twitchId}
                                        </a>
                                        {/* <p className="text-gray-500">{link.members} Members</p> */}
                                      </div>
                                      <div className="flex-shrink-0 pr-2">
                                        <button
                                          type="button"
                                          className="w-8 h-8 bg-white inline-flex items-center justify-center text-gray-400 rounded-full bg-transparent hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >
                                        </button>
                                      </div>
                                    </div>
                                  </li>
                                  : <div></div>}
                                {/* YOUTUBE */}
                                {user.youtube !== undefined ?
                                  <li className="flex shadow-sm rounded-md">
                                    <div
                                      className='flex-shrink-0 flex items-center justify-center w-16 text-pink bg-red-600 text-xl font-medium rounded-l-md'>
                                      <FontAwesomeIcon icon={faYoutube} />
                                    </div>

                                    <div className="flex-1 flex items-center justify-between border-t border-r border-b border-gray-200 bg-white rounded-r-md truncate">
                                      <div className="flex-1 px-4 py-2 text-sm truncate">
                                        <a href={user.youtube} className="text-xl text-blue-600 font-medium hover:text-pink-200">
                                          {user.youtubeId}
                                        </a>
                                        {/* <p className="text-gray-500">{link.members} Members</p> */}
                                      </div>
                                      <div className="flex-shrink-0 pr-2">
                                        <button
                                          type="button"
                                          className="w-8 h-8 bg-white inline-flex items-center justify-center text-gray-400 rounded-full bg-transparent hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >

                                        </button>
                                      </div>
                                    </div>
                                  </li>
                                  : <div></div>}
                                {/* tiktok */}
                                {user.tiktok !== undefined ?
                                  <li className="flex shadow-sm rounded-md">
                                    <div
                                      className='flex-shrink-0 flex items-center justify-center w-16 text-white bg-gradient-to-r from-blue-400 via-black to-red-500 text-xl font-medium rounded-l-md'>
                                      <FontAwesomeIcon icon={faTiktok} />
                                    </div>

                                    <div className="flex-1 flex items-center justify-between border-t border-r border-b border-gray-200 bg-white rounded-r-md truncate">
                                      <div className="flex-1 px-4 py-2 text-sm truncate">
                                        <a href={user.tiktok} className="text-xl text-blue-600 font-medium hover:text-pink-200">
                                          {user.tiktokId}
                                        </a>
                                        {/* <p className="text-gray-500">{link.members} Members</p> */}
                                      </div>
                                      <div className="flex-shrink-0 pr-2">
                                        <button
                                          type="button"
                                          className="w-8 h-8 bg-white inline-flex items-center justify-center text-gray-400 rounded-full bg-transparent hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >

                                        </button>
                                      </div>
                                    </div>
                                  </li>
                                  : <div></div>}
                                {/* Website 2 */}
                                {user.website !== undefined ?
                                  <li className="flex shadow-sm rounded-md">
                                    <div
                                      className='flex-shrink-0 flex items-center justify-center w-16 text-white bg-indigo-400 text-xl font-medium rounded-l-md'>
                                      <FontAwesomeIcon icon={faGlobe} />
                                    </div>

                                    <div className="flex-1 flex items-center justify-between border-t border-r border-b border-gray-200 bg-white rounded-r-md truncate">
                                      <div className="flex-1 px-4 py-2 text-sm truncate">
                                        <a href={user.website} className="text-xl text-blue-600 font-medium hover:text-pink-200">
                                          {user.websiteId}
                                        </a>
                                        {/* <p className="text-gray-500">{link.members} Members</p> */}
                                      </div>
                                      <div className="flex-shrink-0 pr-2">
                                        <button
                                          type="button"
                                          className="w-8 h-8 bg-white inline-flex items-center justify-center text-gray-400 rounded-full bg-transparent hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >

                                        </button>
                                      </div>
                                    </div>
                                  </li>
                                  : <div></div>}

                                
                                {/* twitter */}
                                {user.twitter !== undefined ?
                                  <li className="flex shadow-sm rounded-md">
                                    <div
                                      className='flex-shrink-0 flex items-center justify-center w-16 text-pink bg-blue-400 text-xl font-medium rounded-l-md'>
                                      <FontAwesomeIcon icon={faTwitter} />
                                    </div>

                                    <div className="flex-1 flex items-center justify-between border-t border-r border-b border-gray-200 bg-white rounded-r-md truncate">
                                      <div className="flex-1 px-4 py-2 text-sm truncate">
                                        <a href={user.twitter} className="text-xl text-blue-600 font-medium hover:text-pink-200">
                                          {user.twitterId}
                                        </a>
                                        {/* <p className="text-gray-500">{link.members} Members</p> */}
                                      </div>
                                      <div className="flex-shrink-0 pr-2">
                                        <button
                                          type="button"
                                          className="w-8 h-8 bg-white inline-flex items-center justify-center text-gray-400 rounded-full bg-transparent hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >

                                        </button>
                                      </div>
                                    </div>
                                  </li>
                                  : <div></div>}
                                {/* merch */}
                                {user.merch !== undefined ?
                                  <li className="flex shadow-sm rounded-md">
                                    <div
                                      className='flex-shrink-0 flex items-center justify-center w-16 text-pink bg-pink-600 text-xl font-medium rounded-l-md'>
                                      <FontAwesomeIcon icon={faTshirt} />
                                    </div>

                                    <div className="flex-1 flex items-center justify-between border-t border-r border-b border-gray-200 bg-white rounded-r-md truncate">
                                      <div className="flex-1 px-4 py-2 text-sm truncate">
                                        <a href={user.merch} className="text-xl text-blue-600 font-medium hover:text-pink-200">
                                          Merch
                                        </a>
                                        {/* <p className="text-gray-500">{link.members} Members</p> */}
                                      </div>
                                      <div className="flex-shrink-0 pr-2">
                                        <button
                                          type="button"
                                          className="w-8 h-8 bg-white inline-flex items-center justify-center text-gray-400 rounded-full bg-transparent hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >

                                        </button>
                                      </div>
                                    </div>
                                  </li>
                                  : <div></div>}
                                {/* facebook */}
                                {user.facebook !== undefined ?
                                  <li className="flex shadow-sm rounded-md">
                                    <div
                                      className='flex-shrink-0 flex items-center justify-center w-16 text-pink bg-blue-300 text-xl font-medium rounded-l-md'>
                                      <FontAwesomeIcon icon={faFacebook} />
                                    </div>

                                    <div className="flex-1 flex items-center justify-between border-t border-r border-b border-gray-200 bg-white rounded-r-md truncate">
                                      <div className="flex-1 px-4 py-2 text-sm truncate">
                                        <a href={user.facebook} className="text-xl text-blue-600 font-medium hover:text-pink-200">
                                          {user.facebookId}
                                        </a>
                                        {/* <p className="text-gray-500">{link.members} Members</p> */}
                                      </div>
                                      <div className="flex-shrink-0 pr-2">
                                        <button
                                          type="button"
                                          className="w-8 h-8 bg-white inline-flex items-center justify-center text-gray-400 rounded-full bg-transparent hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >

                                        </button>
                                      </div>
                                    </div>
                                  </li>
                                  : <div></div>}
                                {/* reddit */}
                                {user.reddit !== undefined ?
                                  <li className="flex shadow-sm rounded-md">
                                    <div
                                      className='flex-shrink-0 flex items-center justify-center w-16 text-pink bg-orange-400 text-xl font-medium rounded-l-md'>
                                      <FontAwesomeIcon icon={faReddit} />
                                    </div>

                                    <div className="flex-1 flex items-center justify-between border-t border-r border-b border-gray-200 bg-white rounded-r-md truncate">
                                      <div className="flex-1 px-4 py-2 text-sm truncate">
                                        <a href={user.reddit} className="text-xl text-blue-600 font-medium hover:text-pink-200">
                                          {user.redditId}
                                        </a>
                                        {/* <p className="text-gray-500">{link.members} Members</p> */}
                                      </div>
                                      <div className="flex-shrink-0 pr-2">
                                        <button
                                          type="button"
                                          className="w-8 h-8 bg-white inline-flex items-center justify-center text-gray-400 rounded-full bg-transparent hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >

                                        </button>
                                      </div>
                                    </div>
                                  </li>
                                  : <div></div>}
                                {/* discord */}
                                {user.discord !== undefined ?
                                  <li className="flex shadow-sm rounded-md">
                                    <div
                                      className='flex-shrink-0 flex items-center justify-center w-16 text-pink bg-purple-600 text-xl font-medium rounded-l-md'>
                                      <FontAwesomeIcon icon={faDiscord} />
                                    </div>

                                    <div className="flex-1 flex items-center justify-between border-t border-r border-b border-gray-200 bg-white rounded-r-md truncate">
                                      <div className="flex-1 px-4 py-2 text-sm truncate">
                                        <a href={user.discord} className="text-xl text-blue-600 font-medium hover:text-pink-200">
                                          Discord Channel Invite
                                        </a>
                                        {/* <p className="text-gray-500">{link.members} Members</p> */}
                                      </div>
                                      <div className="flex-shrink-0 pr-2">
                                        <button
                                          type="button"
                                          className="w-8 h-8 bg-white inline-flex items-center justify-center text-gray-400 rounded-full bg-transparent hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >

                                        </button>
                                      </div>
                                    </div>
                                  </li>
                                  : <div></div>}
                                {/* LinkedIn */}
                                {user.linkedin !== undefined ?
                                  <li className="flex shadow-sm rounded-md">
                                    <div
                                      className='flex-shrink-0 flex items-center justify-center w-16 text-pink bg-indigo-400 text-xl font-medium rounded-l-md'>
                                      <FontAwesomeIcon icon={faLinkedin} />
                                    </div>

                                    <div className="flex-1 flex items-center justify-between border-t border-r border-b border-gray-200 bg-white rounded-r-md truncate">
                                      <div className="flex-1 px-4 py-2 text-sm truncate">
                                        <a href={user.linkedin} className="text-xl text-blue-600 font-medium hover:text-pink-200">
                                          {user.LinkedinId}
                                        </a>
                                        {/* <p className="text-gray-500">{link.members} Members</p> */}
                                      </div>
                                      <div className="flex-shrink-0 pr-2">
                                        <button
                                          type="button"
                                          className="w-8 h-8 bg-white inline-flex items-center justify-center text-gray-400 rounded-full bg-transparent hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        >

                                        </button>
                                      </div>
                                    </div>
                                  </li>
                                  : <div></div>}

                              </ul>
                            </div>
                            :
                            <LinkModal />
                          }
                        </div>
                      </div>
                    </div>
                    {/* <Calendar /> */}
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