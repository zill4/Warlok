import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../authcontext";
import { storage, firestore } from "../../firebase";
import Router from 'next/router';
import Link from 'next/link';
// Components
import VideoModal from '../../components/videoModal';
import LinkModal from '../../components/linkModal';

// Images
import profile_pic from "../../public/images/warlok_color.png";
import { DotsVerticalIcon } from '@heroicons/react/solid'
import { faTwitch } from '@fortawesome/free-brands-svg-icons';
import { faClock, faGamepad, faSign, faInfoCircle} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const people = [
  // {
  //   name: '7am - 7pm ?',
  //   title: 'World of Warcraft',
  //   department: 'Lvling to 70',
  //   role: '12hrs',
  //   email: 'Monday',
  //   image: profile_pic,
  // },
  // {
  //   name: '7am - 7pm ?',
  //   title: 'World of Warcraft',
  //   department: 'Lvling to 70',
  //   role: '12hrs',
  //   email: 'Tuesday',
  //   image: profile_pic,
  // },
  // {
  //   name: '7am - 7pm ?',
  //   title: 'World of Warcraft',
  //   department: 'Lvling to 70',
  //   role: '12hrs',
  //   email: 'Wednesday',
  //   image: profile_pic,
  // },
  // {
  //   name: '7am - 7pm ?',
  //   title: 'World of Warcraft',
  //   department: 'Lvling to 70',
  //   role: '12hrs',
  //   email: 'Thursday',
  //   image: profile_pic,
  // },
  // {
  //   name: '7am - 7pm ?',
  //   title: 'World of Warcraft',
  //   department: 'Lvling to 70',
  //   role: '12hrs',
  //   email: 'Friday',
  //   image: profile_pic,
  // },

  // More people...
]
const projects = [
  { name: 'Graph API', initials: 'GA', href: '#', members: 16, bgColor: 'bg-pink-600' },
  { name: 'Component Design', initials: 'CD', href: '#', members: 12, bgColor: 'bg-purple-600' },
  { name: 'Templates', initials: 'T', href: '#', members: 16, bgColor: 'bg-yellow-500' },
  { name: 'React Components', initials: 'RC', href: '#', members: 8, bgColor: 'bg-green-500' },
]
const files = [
  // {
  //   title: 'IMG_4985.HEIC',
  //   size: '3.9 MB',
  //   source:
  //     'https://images.unsplash.com/photo-1582053433976-25c00369fc93?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=512&q=80',
  // },
  // {
  //   title: 'IMG_4985.HEIC',
  //   size: '3.9 MB',
  //   source:
  //     'https://images.unsplash.com/photo-1582053433976-25c00369fc93?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=512&q=80',
  // },
  // {
  //   title: 'IMG_4985.HEIC',
  //   size: '3.9 MB',
  //   source:
  //     'https://images.unsplash.com/photo-1582053433976-25c00369fc93?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=512&q=80',
  // },
  // {
  //   title: 'IMG_4985.HEIC',
  //   size: '3.9 MB',
  //   source:
  //     'https://images.unsplash.com/photo-1582053433976-25c00369fc93?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=512&q=80',
  // },
  // More files...
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
      <VideoModal/>
      }
    </div>
  )
}
export function Links() {
  
  return (
    <div>
    {projects.length < 0 ? 
    <div>
    <h2 className="text-gray-500 text-xs font-medium uppercase tracking-wide">Pinned Projects</h2>
    <ul role="list" className="mt-3 grid grid-cols-1 gap-5 sm:gap-6 sm:grid-cols-1 lg:grid-cols-1">
      {projects.map((project) => (
        <li key={project.name} className=" flex shadow-sm rounded-md">
          <div
            className={classNames(
              project.bgColor,
              'flex-shrink-0 flex items-center justify-center w-16 text-white text-sm font-medium rounded-l-md'
            )}
          >
            <FontAwesomeIcon icon={faTwitch} />
          </div>
          <div className="flex-1 flex items-center justify-between border-t border-r border-b border-gray-200 bg-white rounded-r-md truncate">
            <div className="flex-1 px-4 py-2 text-sm truncate">
              <a href={project.href} className="text-gray-900 font-medium hover:text-gray-600">
                {project.name}
              </a>
              <p className="text-gray-500">{project.members} Members</p>
            </div>
            <div className="flex-shrink-0 pr-2">
              <button
                type="button"
                className="w-8 h-8 bg-white inline-flex items-center justify-center text-gray-400 rounded-full bg-transparent hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <span className="sr-only">Open options</span>
                <DotsVerticalIcon className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  </div>
    : 
      <LinkModal/>
      }
    </div>
  )
}
export function Calendar() {
  var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
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
                            <div className="text-xl font-medium text-gray-900 pr-4"> Slaying lv. 42 Dragons! 🐉</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                            <div className="text-xl font-medium text-gray-900 pr-4"> #Example @CreatorName </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link href="/settings#calendar">
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

export default function Profile  () {
  const { currentUser } = useAuth();
  const [ user, setUser ] = useState(""); 
  const [showModal, setModal] = useState(false);

  
  console.log(showModal);
  useEffect(() => {
    const {pathname} = Router
    if(pathname == '/profile' && !currentUser ){
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
                        alt="avatar"
                        src={user.avatar}// 800 x 800 
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
                    <div
                        className="bg-purple-500 active:bg-lightBlue-600 uppercase text-white font-bold hover:shadow-md shadow text-xs px-4 py-2 rounded outline-none focus:outline-none sm:mr-2 mb-1 ease-linear transition-all duration-150"
                        type="button"
                      >
                      <Link href="settings">
                        <a> Edit Profile</a>
                      </Link>
                      </div>
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
                  <div className="w-1/2">
                    <Thumbnails />
                  </div>
                  <div className="w-1/2">
                    <Links/>
                    {/* <div className="lg:order-1 px-3 items-stretch flex text-center mt-2">
                        <ul>
                          <li>
                              <span className="text-xl font-bold block uppercase tracking-wide text-blueGray-600 mr-2 ml-2">
                                  <i className="fab fa-twitch"></i>
                                  <br/>
                                  <span className="text-sm text-blueGray-400">
                                  Twitch
                                  </span>
                              </span>
                          </li>
                          <li>
                            <span className="text-xl font-bold block uppercase tracking-wide text-blueGray-600 mr-2 ml-2">
                              <i className="fab fa-youtube"></i>
                                    <br/>
                                    <span className="text-sm text-blueGray-400">
                                    YouTube
                                    </span>
                              </span>
                          </li>
                          <li>
                              <span className="text-xl font-bold block uppercase tracking-wide text-blueGray-600 mr-2 ml-2">
                            <i className="fab fa-tiktok"></i>
                                  <br/>
                                  <span className="text-sm text-blueGray-400">
                                  TikTok
                                  </span>
                            </span>
                          </li>
                          <li>
                              <span className="text-xl font-bold block uppercase tracking-wide text-blueGray-600 mr-2 ml-2">
                                  <i className="fab fa-twitter"></i>
                                  <br/>
                                  <span className="text-sm text-blueGray-400">
                                  Twitter
                                  </span>
                            </span>
                          </li>
                          <li>
                              <span className="text-xl font-bold block uppercase tracking-wide text-blueGray-600 mr-2 ml-2">
                            <i className="fab fa-instagram"></i>
                                  <br/>
                                  <span className="text-sm text-blueGray-400">
                                  Instagram
                                  </span>
                            </span>
                          </li>
                          <li>
                              <span className="text-xl font-bold block uppercase tracking-wide text-blueGray-600 mr-2 ml-2">
                            <i className="fab fa-facebook"></i>
                                  <br/>
                                  <span className="text-sm text-blueGray-400">
                                  Facebook
                                  </span>
                            </span>
                          </li>
                        </ul>
                    </div> */}
                    
                  </div>
                    
                  </div>
                  {/* <div className=" mb-6 mt-6 rounded flex justify-around flex-wrap"> */}
                    {/* <div className="px-4 lg:order-2 flex mt-6 mb-5 text-4xl text-center">
                        
                    </div>
                  
                    <div className=" px-4 lg:order-3 lg:text-right lg:self-center text-4xl">
                        
                    </div> */}
                    {/* <div className=" lg:order-1 px-3 items-stretch flex text-center mt-6">
                    </div> */}
                  {/* </div> */}
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