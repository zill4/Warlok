/* This example requires Tailwind CSS v2.0+ */
import { Fragment, useState, useEffect } from 'react'
import { storage, firestore } from "../firebase"
import { useAuth } from "../authcontext"
import { Dialog, Transition } from '@headlessui/react'
import { CheckIcon } from '@heroicons/react/outline'
import Router from 'next/router'

import React from "react";

export default function VideoModal() {
  const [showModal, setShowModal] = React.useState(false);
  const [thumbnail, setThumbnail] = React.useState("");
  const [user, setUser] = React.useState();
  const { currentUser } = useAuth();
  const userDocRef = firestore.doc(`users/${currentUser.uid}`);

  const checkVideo = (event) => {
    event.preventDefault();
    var regex = (/youtube\.com.*(\?v=|\/embed\/)(.{11})/);
    var youtube_video_id = regex.exec(event.target.url.value).pop();
    if (youtube_video_id.length == 11) {
      var video_thumbnail = ('https://img.youtube.com/vi/' + youtube_video_id + '/maxresdefault.jpg');
      setThumbnail(video_thumbnail);
      userDocRef.collection('videos').add({
        videoLink: event.target.url.value,
        videoThumbnail: video_thumbnail,
        videoTitle: event.target.title.value
      })
    }
    else {
      throw error("invalid link");
    }
  }

  
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
    <>
      <div className="py-4">
        <div className="aspect-w-16 aspect-h-9 rounded-lg  py-4">
          <div className="rounded-lg w-64 h-64 content-center bg-gray-100 align-middle flex flex-wrap focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-100 focus-within:ring-indigo-500 justify-center">
            <div>
              <button className="bg-pink-500 text-white active:bg-pink-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                type="button"
                onClick={() => setShowModal(true)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </button>
              <p className="mt-2 block text-sm font-medium text-gray-900 truncate pointer-events-none">Add video</p>
            </div>
          </div>
        </div>
      </div>
      {showModal ? (
        <>
          <div
            className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
          >
            <div className="relative w-auto my-6 mx-auto max-w-3xl">
              {/*content*/}
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                {/*header*/}
                <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
                  <h3 className="text-3xl font-semibold">
                    Youtube Link
                  </h3>
                  <button
                    className="p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                    onClick={() => setShowModal(false)}
                  >
                    <span className="bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none">
                      ??
                    </span>
                  </button>
                </div>
                {/*body*/}
                <form className="mt-6 space-y-8" onSubmit={checkVideo}>
                  <div className="relative p-6 flex-auto">
                    <p className="my-4 text-blueGray-500 text-lg leading-relaxed">
                      YouTube Link
                    </p>
                    <input
                      id="url"
                      name="url"
                      type="url"
                      className="appearance-none  px-3 py-2 border border-gray-300 rounded-md shadow-xl placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 xl:text-xl"
                    />
                  </div>   
                  <div className="relative p-6 flex-auto">
                    <p className="my-4 text-blueGray-500 text-lg leading-relaxed">
                     Title
                    </p>
                    <input
                      id="title"
                      name="title"
                      type="title"
                      className="appearance-none  px-3 py-2 border border-gray-300 rounded-md shadow-xl placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 xl:text-xl"
                    />
                  </div>   
                  <button
                    type="submit"
                    className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    submit
                  </button>
                  {thumbnail.length > 1 ? 
                  <div>
                    <img src={thumbnail} />
                  </div>
                  :
                    <div>
                      </div>}
                </form>

                {/*footer*/}
                <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
                  <button
                    className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                  <button
                    className="bg-blue-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={() => setShowModal(false)}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
      ) : null}
    </>
  );
}
