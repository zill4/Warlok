
import React, {useEffect, useState} from "react";
import Router from 'next/router'
import { auth } from "../../firebase";
import { checkActionCode, applyActionCode, sendPasswordResetEmail } from "firebase/auth";


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
          });
      }, [])


    return (
        <div>
            {valid ? 
                <div>
                    <h1> Account verified! </h1>
                </div>
            :
               <h1> Link is invalid </h1> 
            } 
        </div>
    )
  }