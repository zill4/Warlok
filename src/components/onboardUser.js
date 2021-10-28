import React, { useEffect, useState, useRef } from 'react'
import { CheckIcon } from '@heroicons/react/solid'
import { storage, firestore } from "../firebase"
import { useAuth } from "../authcontext"
import Router from 'next/router'

const steps = [
    { name: 'Step 1', href: '#', status: 'current' },
    { name: 'Step 2', href: '#', status: 'upcoming' },
    { name: 'Step 3', href: '#', status: 'upcoming' },
]



function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function OnboardUser() {
    const [step, setStep] = useState(0)
    const usernameRef = useRef()
    const bioRef = useRef()
    const usersRef = firestore.collection('users')
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [fileUrl, setFileUrl] = useState();

    // const { currentUser } = useAuth();
    //  const [ user, setUser ] = useState(""); 
    // const bioRef = useRef();
    // const userDocRef = firestore.doc(`users/${currentUser.uid}`);

    async function updateProfile (event)  {

        e.preventDefault()

        if (!usernameRef.current.value.match(/^[a-z0-9]+$/i)) {
            return setError("User name must contain only alphanumeric characters")
        }
        try{
            setError("")
            setLoading(true)
            usersRef.where('username', '==', usernameRef.current.value).get().then(snapshot => {
                if (!snapshot.empty) {
                    return setError("User name is taken");
                }
            })
        } catch (error) {
            setError(e)
        }
        

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
        setLoading(false)
        Router.push('/profile')

    }

    const onFileChange = async (event) => {
        const file = event.target.files[0];
        const storageRef = storage.ref();
        const fileRef = storageRef.child(file.name);
        await fileRef.put(file);
        setFileUrl(await fileRef.getDownloadURL());
    }
    function nextStep(e) {
        e.preventDefault()
        const updatedStep = step + 1;
        steps[step].status = 'complete'
        setStep(updatedStep)
        if (updatedStep < 3) {
            steps[updatedStep].status = 'current'
        }

    }
    function lastStep(e) {
        e.preventDefault()
        const updatedStep = step - 1;
        steps[step].status = 'upcoming'
        setStep(updatedStep)
        steps[updatedStep].status = 'current'
    }
    async function checkUsername(e) {
        e.preventDefault()
        if (!usernameRef.current.value.match(/^[a-z0-9]+$/i)) {
            return setError("User name must contain only alphanumeric characters")
        }
        try{
            setError("")
            setLoading(true)
            usersRef.where('username', '==', usernameRef.current.value).get().then(snapshot => {
                if (!snapshot.empty) {
                    return setError("User name is taken");
                }
            })
        } catch (error) {
            setError(e)
        }
        setLoading(false)
    }

   
    return (
        <div>
            <form className="space-y-8 divide-y divide-gray-200" onSubmit={updateProfile}>
                <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">
                    <div>
                        <div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Profile</h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                This information will be displayed publicly so be careful what you share.
                            </p>
                        </div>
                        <div className="">
                            {step === 0 ?
                                <div className="">
                                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                                        Username
                                    </label>
                                    <div className="mt-2 py-2 sm:mt-0 sm:col-span-2">
                                        <div className="max-w-lg flex rounded-md shadow-sm">
                                            <input
                                                id="username"
                                                name="username"
                                                type="username"
                                                onChange={checkUsername}
                                                ref={usernameRef}
                                                required
                                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                                :
                                <br></br>
                            }
                            {step === 1 ?
                                <div className="">
                                    <label htmlFor="about" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                                        Bio
                                    </label>
                                    <div className="mt-1 sm:mt-0 sm:col-span-2">
                                        <textarea
                                            id="bio"
                                            name="bio"
                                            type="bio"
                                            ref={bioRef}
                                            required
                                            rows={3}
                                            className="max-w-lg shadow-sm block w-full focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border border-gray-300 rounded-md"
                                            defaultValue={''}
                                        />
                                        <p className="mt-2 text-sm text-gray-500">Write a few sentences about yourself.</p>
                                    </div>
                                </div>
                                :
                                <br></br>
                            }
                            {step === 2 ?
                                <div className="">
                                    <label htmlFor="photo" className="block text-sm font-medium text-gray-700">
                                        Photo
                                    </label>
                                    <div className="mt-1 sm:mt-0 sm:col-span-2">
                                        <div className="flex items-center">
                                            <span className="h-12 w-12 rounded-full overflow-hidden bg-gray-100">
                                                <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                                                </svg>
                                            </span>
                                            <label
                                                htmlFor="file-upload"
                                                className="ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={onFileChange} />
                                                Change
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                :
                                <br></br>
                            }
                        </div>
                    </div>




                </div>

                <div className="py-7">
                    <div className="flex justify-center">
                        {step > 0 && step !== 3 ?
                            <button
                                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                onClick={lastStep}
                            >
                                Previous
                            </button>
                            :
                            <br></br>
                        }
                        {step < 2 ?
                            <button
                                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                onClick={nextStep}
                            >
                                Next
                            </button>
                            :
                            <br></br>
                        }
                        {step === 2 ?
                            <button
                                type="submit"
                                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                onClick={nextStep}
                            >
                                Finish
                            </button>
                            :
                            <br></br>
                        }
                    </div>
                </div>
            </form>
            <nav aria-label="Progress">
                <ol role="list" className="flex items-center">
                    {steps.map((step, stepIdx) => (
                        <li key={step.name} className={classNames(stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : '', 'relative')}>
                            {step.status === 'complete' ? (
                                <>
                                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                        <div className="h-0.5 w-full bg-indigo-600" />
                                    </div>
                                    <a
                                        href="#"
                                        className="relative w-8 h-8 flex items-center justify-center bg-indigo-600 rounded-full hover:bg-indigo-900"
                                    >
                                        <CheckIcon className="w-5 h-5 text-white" aria-hidden="true" />
                                        <span className="sr-only">{step.name}</span>
                                    </a>
                                </>
                            ) : step.status === 'current' ? (
                                <>
                                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                        <div className="h-0.5 w-full bg-gray-200" />
                                    </div>
                                    <a
                                        href="#"
                                        className="relative w-8 h-8 flex items-center justify-center bg-white border-2 border-indigo-600 rounded-full"
                                        aria-current="step"
                                    >
                                        <span className="h-2.5 w-2.5 bg-indigo-600 rounded-full" aria-hidden="true" />
                                        <span className="sr-only">{step.name}</span>
                                    </a>
                                </>
                            ) : (
                                <>
                                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                        <div className="h-0.5 w-full bg-gray-200" />
                                    </div>
                                    <a
                                        href="#"
                                        className="group relative w-8 h-8 flex items-center justify-center bg-white border-2 border-gray-300 rounded-full hover:border-gray-400"
                                    >
                                        <span
                                            className="h-2.5 w-2.5 bg-transparent rounded-full group-hover:bg-gray-300"
                                            aria-hidden="true"
                                        />
                                        <span className="sr-only">{step.name}</span>
                                    </a>
                                </>
                            )}
                        </li>
                    ))}
                </ol>
            </nav>
        </div>
    )
}