import React, { useContext, useState, useEffect } from "react"
import { auth, firestore } from "./firebase"
import { doc, setDoc } from "firebase/firestore"; 



export function UpdateProfile() {

    // Create
    function addLink(uid, linkName, link)
    {
        // using a static list of link types

        // Dynamic method 
        db.collection("users").doc(uid).set({
            [linkName]: link
          })

        // static method
        // YouTube: Link
        // Instagram: Link
        // Twitch: Link
        // etc.

    }

    function addVideoLink()
    {
        // verify Twitch or YouTube video link
        // YouTubeLink : Link
        // TwitchLink : Link
        // Thumbnail need to parse link (Twitch vs. YouTube)
    }

    function addBio(bio)
    {
        db.collection("users").doc(uid).set({
            bio: bio
          })
    }

    function addCalendarEvent()
    {
        // Currently only for Twitch Calendar (API?)
        // This is probably better formatted as its own sub-document: Events
        // Events -
        // eventID -
        // day: Wednesday
        // date: DateTimeObject
        // StartTime: startTime
        // EndTime: EndTime
        // duration: duration
        // Title: Title
        // Category: Category
        // Thumbnail: image
        // Tags: [#Tags]
        // Creators: [@Creators]
        // Summary: Summary
    }
    // Read
    function getLinks()
    {

    }
    function getVideoLinks()
    {

    }
    function getBio()
    {

    }
    function getCalendarEvents()
    {

    }
    // Update
    function updateLinks()
    {

    }

    function updateVideoLinks()
    {

    }

    function updateBio()
    {

    }

    function updateCalendarEvent()
    {

    }
    // Delete
    function deleteBio()
    {

    }
    function deleteCalendarEvent()
    {
        
    }
    function deleteLinks()
    {

    }

    function deleteVideoLinks()
    {

    }

}

export default UpdateProfile;