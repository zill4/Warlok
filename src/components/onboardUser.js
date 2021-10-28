import React, { useEffect, useState, useRef } from 'react'
import { CheckIcon } from '@heroicons/react/solid'

const steps = [
    { name: 'Step 1', href: '#', status: 'current' },
    { name: 'Step 2', href: '#', status: 'upcoming' },
    { name: 'Step 3', href: '#', status: 'upcoming' },
    { name: 'Step 4', href: '#', status: 'upcoming' },
]



function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export default function OnboardUser() {
    // Check for alphanumeric only
    const [step, setStep] = useState(0)

    // if (!usernameRef.current.value.match(/^[a-z0-9]+$/i)) {
    //     return setError("User name must contain only alphanumeric characters")
    // }
    function nextStep(e) {
        e.preventDefault()
        const updatedStep = step + 1;
        steps[step].status = 'complete'
        setStep(updatedStep)
        if (updatedStep < 4) {
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

    useEffect(() => {

    }, [])

    return (
        <div>
            <form className="space-y-8 divide-y divide-gray-200">
                <div className="space-y-8 divide-y divide-gray-200 sm:space-y-5">
                    <div>
                        <div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Profile</h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                This information will be displayed publicly so be careful what you share.
                            </p>
                        </div>
                        <div className="mt-6 sm:mt-5 space-y-6 sm:space-y-5">

                            {step === 0 ?
                                <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                                        Username
                                    </label>
                                    <div className="mt-1 sm:mt-0 sm:col-span-2">
                                        <div className="max-w-lg flex rounded-md shadow-sm">
                                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                                                workcation.com/
                                            </span>
                                            <input
                                                type="text"
                                                name="username"
                                                id="username"
                                                autoComplete="username"
                                                className="flex-1 block w-full focus:ring-indigo-500 focus:border-indigo-500 min-w-0 rounded-none rounded-r-md sm:text-sm border-gray-300"
                                            />
                                        </div>
                                    </div>
                                </div>
                                :
                                <br></br>
                            }
                            {step === 1 ?
                                <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                                    <label htmlFor="about" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                                        About
                                    </label>
                                    <div className="mt-1 sm:mt-0 sm:col-span-2">
                                        <textarea
                                            id="about"
                                            name="about"
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
                                <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-center sm:border-t sm:border-gray-200 sm:pt-5">
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
                                            <button
                                                type="button"
                                                className="ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                                Change
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                :
                                <br></br>
                            }
                            {step === 3 ?
                                <div className="sm:grid sm:grid-cols-3 sm:gap-4 sm:items-start sm:border-t sm:border-gray-200 sm:pt-5">
                                    <label htmlFor="cover-photo" className="block text-sm font-medium text-gray-700 sm:mt-px sm:pt-2">
                                        Cover photo
                                    </label>
                                    <div className="mt-1 sm:mt-0 sm:col-span-2">
                                        <div className="max-w-lg flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                            <div className="space-y-1 text-center">
                                                <svg
                                                    className="mx-auto h-12 w-12 text-gray-400"
                                                    stroke="currentColor"
                                                    fill="none"
                                                    viewBox="0 0 48 48"
                                                    aria-hidden="true"
                                                >
                                                    <path
                                                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                        strokeWidth={2}
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                                <div className="flex text-sm text-gray-600">
                                                    <label
                                                        htmlFor="file-upload"
                                                        className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                                                    >
                                                        <span>Upload a file</span>
                                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                                                    </label>
                                                    <p className="pl-1">or drag and drop</p>
                                                </div>
                                                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                            </div>
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
                        {step > 0 && step !== 4 ?
                            <button
                                type="submit"
                                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                onClick={lastStep}
                            >
                                Previous
                            </button>
                            :
                            <br></br>
                        }
                        {step < 3 ?
                            <button
                                type="submit"
                                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                onClick={nextStep}
                            >
                                Next
                            </button>
                            :
                            <br></br>
                        }
                        {step === 3 ?
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