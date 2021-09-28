import { useRef, useState } from "react"
import { useAuth } from "../../authcontext"
import { firestore } from "../../firebase"
import Router from 'next/router'
import Link from 'next/link'
import WarlokLogo from '../../../public/images/warlok_logo.png'
import WarlokLogoSmall from '../../../public/images/warlok_color.png'
import Image from 'next/image'

export default function SignUpPage() {
  const emailRef = useRef()
  const passwordRef = useRef()
  const usernameRef = useRef()
  const passwordConfirmRef = useRef()
  const { signup } = useAuth()
  const { currentUser } = useAuth()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
//   const history = useHistory()
  const usersRef = firestore.collection('users')

  async function handleSubmit(e) {
    e.preventDefault()

    if (passwordRef.current.value !== passwordConfirmRef.current.value) {
      return setError("Passwords do not match")
    }
    // Check for alphanumeric only
    if (!usernameRef.current.value.match(/^[a-z0-9]+$/i))
    {
      return setError("User name must contain only alphanumeric characters")
    }
    // Check if username does not exist
    
    try {
      setError("")
      setLoading(true)
      usersRef.where('username','==',usernameRef.current.value).get().then(snapshot => {
        if(!snapshot.empty)
        {
          return setError("User name is taken");
        }else{
          signup(emailRef.current.value, passwordRef.current.value).then(authUser =>{
            firestore.doc(`users/${authUser.user.uid}`).set({
                email : emailRef.current.value.toLowerCase(),
                username : usernameRef.current.value.toLowerCase(),
                avatar: "https://images.unsplash.com/photo-1608237652484-b478fac3bf7c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80"
                }).then(Router.push('/profile'));
            });
        }
        });
    } catch (error) {
      setError("Failed to create an account", error)
    }
    setLoading(false)
  }


    return (
      <div className="min-h-screen bg-white flex">
        <div className="flex-1 flex flex-col justify-center py-12 px-7 sm:px-6 lg:flex-none lg:px-80 xl:px-96">
          <div className="mx-auto w-full max-w-9/12 lg:w-96">
                     {/* Error if login fails */}
          {error && <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong class="font-bold"></strong>
                    <span class="block sm:inline">{error}</span>
                    <span class="absolute top-0 bottom-0 right-0 px-4 py-3">
                    </span>
          </div>}
            <div>
            <Image
                      className="h-8 w-auto sm:h-10"
                      src={WarlokLogo}
                      alt="Warlok"
                      width={200}
                      height={40}
                    />
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Sign Up</h2>
              <p className="mt-2 text-sm text-gray-600">
                Or{' '}
                <Link href="/login">
                <a className="font-medium text-indigo-600 hover:text-indigo-500">
                  Already have an account?
                </a>
                </Link>
              </p>
            </div>
  
            <div className="mt-8">
              <div>

              </div>
  
              <div className="mt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
          
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email address
                    </label>
                    <div className="mt-1">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        ref={emailRef}
                        autoComplete="email"
                        required
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                      Username
                    </label>
                    <div className="mt-1">
                      <input
                        id="username"
                        name="username"
                        type="username"
                        ref={usernameRef}
                        autoComplete="username"
                        required
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <div className="mt-1">
                      <input
                        id="password"
                        name="password"
                        type="password"
                        ref={passwordRef}
                        autoComplete="current-password"
                        required
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password Confirmation
                    </label>
                    <div className="mt-1">
                      <input
                        id="password"
                        name="password"
                        type="password"
                        ref={passwordConfirmRef}
                        autoComplete="current-password"
                        required
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember_me"
                        name="remember_me"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-900">
                        Remember me
                      </label>
                    </div>
  
                    {/* <div className="text-sm">
                      <Link href="forgotPassword">
                      <a className="font-medium text-indigo-600 hover:text-indigo-500">
                          Forgot your password?
                      </a>
                      </Link>
                    </div> */}
                  </div>
  
                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Sign up
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        <div className="hidden lg:block relative w-0 flex-1">
          <img
            className="absolute inset-0 object-cover w-full h-full"
            src="https://images.unsplash.com/photo-1535949134169-aa64c1a54f86?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1046&q=80"
            alt=""
          />
        </div>
      </div>
    )
  }
  