import { Fragment } from 'react'
import Link from 'next/link'
import { Popover, Transition } from '@headlessui/react'
import { MailIcon, MenuIcon, PhoneIcon, XIcon, CameraIcon } from '@heroicons/react/outline'
import {
    AnnotationIcon,
    ChevronDownIcon,
    ChatAlt2Icon,
    ChatAltIcon,
    DocumentReportIcon,
    HeartIcon,
    InboxIcon,
    PencilAltIcon,
    QuestionMarkCircleIcon,
    ReplyIcon,
    SparklesIcon,
    TrashIcon,
    UsersIcon,
  } from '@heroicons/react/outline'
import WarlokLogoSmall from '../../../public/images/warlok_color.png'
import WarlokLogo from '../../../public/images/warlok_logo.png'
import Image from 'next/image'

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
  }
  
const solutions = [
  {
    name: 'Pact: Inbox',
    description: 'A shared inbox for you and your team.',
    href: '/#pact',
    icon: InboxIcon,
  },
  {
    name: 'Portal: Profile',
    description: 'Speak directly to your customers in a more meaningful way.',
    href: '/#portal',
    icon: AnnotationIcon,
  },
  { name: 'Arcana: Feed', description: "Your customers' data will be safe and secure.", href: '/#arcana', icon: ChatAlt2Icon },
  {
    name: 'Patron: Business Card',
    description: "Connect with third-party tools that you're already using.",
    href: '/#patron',
    icon: QuestionMarkCircleIcon,
  },
]
export default function About() {
  return (
    
    <div className="bg-white overflow-hidden">

<header>
        <Popover className="relative bg-white">
          {({ open }) => (
            <div>
              <div className="flex justify-between items-center max-w-7xl mx-auto px-4 py-6 sm:px-6 md:justify-start md:space-x-10 lg:px-8">
                <div className="flex justify-start lg:w-0 lg:flex-1">
                <Link href="/">
                    <a>
                    <Image
                      className="h-8 w-auto sm:h-10"
                      src={WarlokLogo}
                      alt="Warlok"
                      width={200}
                      height={40}
                    />
                    </a>
                    </Link>
                </div>
                <div className="-mr-2 -my-2 md:hidden">
                  <Popover.Button className="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                    <span className="sr-only">Open menu</span>
                    <MenuIcon className="h-6 w-6" aria-hidden="true" />
                  </Popover.Button>
                </div>
                <Popover.Group as="nav" className="hidden md:flex space-x-10">
                  <Popover className="relative">
                    {({ open }) => (
                      <div>
                        <Popover.Button
                          className={classNames(
                            open ? 'text-gray-900' : 'text-gray-500',
                            'group bg-white rounded-md inline-flex items-center text-base font-medium hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                          )}
                        >
                          <span>Solutions</span>
                          <ChevronDownIcon
                            className={classNames(
                              open ? 'text-gray-600' : 'text-gray-400',
                              'ml-2 h-5 w-5 group-hover:text-gray-500'
                            )}
                            aria-hidden="true"
                          />
                        </Popover.Button>

                        <Transition
                          show={open}
                          as={Fragment}
                          enter="transition ease-out duration-200"
                          enterFrom="opacity-0 translate-y-1"
                          enterTo="opacity-100 translate-y-0"
                          leave="transition ease-in duration-150"
                          leaveFrom="opacity-100 translate-y-0"
                          leaveTo="opacity-0 translate-y-1"
                        >
                          <Popover.Panel
                            static
                            className="absolute z-10 -ml-4 mt-3 transform w-screen max-w-md lg:max-w-2xl lg:ml-0 lg:left-1/2 lg:-translate-x-1/2"
                          >
                            <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden ">
                              <div className="relative grid gap-6 bg-white px-5 py-6 sm:gap-8 sm:p-8 lg:grid-cols-2">
                                {solutions.map((item) => (
                                  <a
                                    key={item.name}
                                    href={item.href}
                                    className="-m-3 p-3 flex items-start rounded-lg hover:bg-gray-50"
                                  >
                                    <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 text-white sm:h-12 sm:w-12">
                                      <item.icon className="h-6 w-6" aria-hidden="true" />
                                    </div>
                                    <div className="ml-4">
                                      <p className="text-base font-medium text-gray-900">{item.name}</p>
                                      <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                                    </div>
                                  </a>
                                ))}
                              </div>
                            </div>
                          </Popover.Panel>
                        </Transition>
                      </div>
                    )}
                  </Popover>
                  <Link href="/about">
                  <a className="text-base font-medium text-gray-500 hover:text-gray-900">
                    About
                  </a>
                  </Link>
                  <Link href="/contact">
                    <a className="text-base font-medium text-gray-500 hover:text-gray-900">
                      Contact
                    </a>
                  </Link>
                </Popover.Group>
                <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0">
                  <Link href="/login">
                  <a className="whitespace-nowrap text-base font-medium text-gray-500 hover:text-gray-900">
                    Login
                  </a>
                  </Link>
                  <Link href="/signup">
                    <a
                      href="/signup"
                      className="ml-8 whitespace-nowrap inline-flex items-center justify-center bg-gradient-to-r from-purple-600 to-indigo-600 bg-origin-border px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white hover:from-purple-700 hover:to-indigo-700"
                    >
                      Sign Up
                    </a>
                  </Link>
                </div>
              </div>

              <Transition
                show={open}
                as={Fragment}
                enter="duration-200 ease-out"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="duration-100 ease-in"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Popover.Panel
                  focus
                  static
                  className="absolute z-30 top-0 inset-x-0 p-2 transition transform origin-top-right md:hidden"
                >
                  <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 bg-white divide-y-2 divide-gray-50">
                    <div className="pt-5 pb-6 px-5">
                      <div className="flex items-center justify-between">
                        <div>
                        <Image
                            className="h-8 w-auto"
                            src={WarlokLogoSmall}
                            alt="Warlok"
                            height={50}
                            width={50}
                          />
                        </div>
                        <div className="-mr-2">
                          <Popover.Button className="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                            <span className="sr-only">Close menu</span>
                            <XIcon className="h-6 w-6" aria-hidden="true" />
                          </Popover.Button>
                        </div>
                      </div>
                      <div className="mt-6">
                        <nav className="grid grid-cols-1 gap-7">
                          {solutions.map((item) => (
                            <a
                              key={item.name}
                              href={item.href}
                              className="-m-3 p-3 flex items-center rounded-lg hover:bg-gray-50"
                            >
                              <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-md bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                                <item.icon className="h-6 w-6" aria-hidden="true" />
                              </div>
                              <div className="ml-4 text-base font-medium text-gray-900">{item.name}</div>
                            </a>
                          ))}
                        </nav>
                      </div>
                    </div>
                    <div className="py-6 px-5">
                      <div className="grid grid-cols-2 gap-4">
                        <Link href="/about">
                          <a className="text-base font-medium text-gray-900 hover:text-gray-700">
                            About
                          </a>
                        </Link>
                        <Link href="contact">
                          <a className="text-base font-medium text-gray-900 hover:text-gray-700">
                            Contact
                          </a>
                        </Link>
                      </div>
                      <div className="mt-6">
                        <Link href="/signup">
                          <a
                            className="w-full flex items-center justify-center bg-gradient-to-r from-purple-600 to-indigo-600 bg-origin-border px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white hover:from-purple-700 hover:to-indigo-700"
                          >
                            Sign Up
                          </a>
                        </Link>
                        <p className="mt-6 text-center text-base font-medium text-gray-500">
                          Already have an account?
                          <Link href="/login">
                            <a className="text-gray-900">
                            Login
                            </a>
                          </Link>
                        </p>
                      </div>
                    </div>
                  </div>
                </Popover.Panel>
              </Transition>
            </div>
          )}
        </Popover>
      </header>

      <div className="relative max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="hidden lg:block bg-gray-50 absolute top-0 bottom-0 left-3/4 w-screen" />
        <div className="mx-auto text-base max-w-prose lg:grid lg:grid-cols-2 lg:gap-8 lg:max-w-none">
          <div>
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Why Warlok?</h2>
            <h3 className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Can't get ahold of anyone!
            </h3>
          </div>
        </div>
        <div className="mt-8 lg:grid lg:grid-cols-2 lg:gap-8">
          <div className="relative lg:row-start-1 lg:col-start-2">
            <svg
              className="hidden lg:block absolute top-0 right-0 -mt-20 -mr-20"
              width={404}
              height={384}
              fill="none"
              viewBox="0 0 404 384"
              aria-hidden="true"
            >
              <defs>
                <pattern
                  id="de316486-4a29-4312-bdfc-fbce2132a2c1"
                  x={0}
                  y={0}
                  width={20}
                  height={20}
                  patternUnits="userSpaceOnUse"
                >
                  <rect x={0} y={0} width={4} height={4} className="text-gray-200" fill="currentColor" />
                </pattern>
              </defs>
              <rect width={404} height={384} fill="url(#de316486-4a29-4312-bdfc-fbce2132a2c1)" />
            </svg>
            <div className="relative text-base mx-auto max-w-prose lg:max-w-none">
              <figure>
                <div className="aspect-w-12 aspect-h-7 lg:aspect-none">
                  <img
                    className="rounded-lg shadow-lg object-cover object-center"
                    src="https://images.unsplash.com/photo-1569824837256-f1eb4f71a102?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2092&q=80"
                    alt="It's a long road to the top."
                    width={1184}
                    height={1376}
                  />
                </div>
                {/* <figcaption className="mt-3 flex text-sm text-gray-500">
                  <CameraIcon className="flex-none w-5 h-5 text-gray-400" aria-hidden="true" />
                  <span className="ml-2">Photograph by Marcus O???Leary</span>
                </figcaption> */}
              </figure>
            </div>
          </div>
          <div className="mt-8 lg:mt-0">
            <div className="text-base max-w-prose mx-auto lg:max-w-none">
              <p className=" text-gray-500 py-2 font-semibold ">
                Making a name for yourself as a creator is no easy endeavor.
              </p>
            </div>
            <div className="mt-5 prose prose-indigo text-gray-500 mx-auto lg:max-w-none lg:row-start-1 lg:col-start-1">
              <p>
                But getting ahold of a crerator is even harder! Warlok was created to help serve
                content creators with genuine engagement from legit businesses, real fans, and other creators looking to collaborate.
              </p>
              <p className="py-2" >
                We all wish we had Jerry Meguire representing us, showing us the money, and having our backs when things get sticky, but not every agency is like Jerry and when your just starting out its hard to even get the attention of an agency.
              </p>
              <p className="py-2">
                Warlok is here as a tool to help creators easily represent themselves so you can focus on what you do best, create content.
              </p>
              <ul>
                <li className="py-.5 font-semibold ">An all in one profile page to showcase your content.</li>
                <li className="py-.5 font-semibold ">Schedule recommended content and optimum times with our scheduler.</li>
                <li className="py-.5 font-semibold ">Connect with real businesses, fans, and creators in your network.</li>
              </ul>
              <p className="py-2">
                This is just the beginning, Warlok is committed to putting creators first. 
                In the future we hope to provide additional tools to help creators optimize viewership, capitalize on THEIR content, and grow a devoted community.
              </p>
              <h3 className="py-2 font-semibold ">Sounds good?</h3>
              <p>
                We're excited to get to work! Sign up if you think Warlok might be useful to you, and if your not sure and want to learn more, feel free to contact us via email at Justin@warlok.net or give use a call at (949)873-3619.
              </p>
              <p className="py-2 font-semibold ">
                What's your magic?
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
