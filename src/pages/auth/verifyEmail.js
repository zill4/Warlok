
import React, {useEffect, useState} from "react";
import Router from 'next/router'
import { auth } from "../../firebase";
import { checkActionCode, applyActionCode, sendPasswordResetEmail } from "firebase/auth";
// components
import OnboardUser from '../../components/onboardUser'

export default function VerifyEmail(props) {
    const [error, setError] = useState("")
    const [valid, isValid] = useState(false)

    useEffect(() => {
        auth.checkActionCode(props.actionCode).then(() =>{
            return auth.applyActionCode(props.actionCode)
        }).then((resp) => {
                if (resp.status === '200'){
                    isValid(true)
                    Router.push('/profile')
                }
          }).catch((error) => {
            // Invalid code.
            setError("incorrect code", error)
            Router.push('/profile')
          });
      }, [])


    return (
        <div >
            {valid ? 
                <div>
                    <OnboardUser />
                </div>
            :
               <h1> Link is invalid </h1> 
            } 
        </div>
    )
  }