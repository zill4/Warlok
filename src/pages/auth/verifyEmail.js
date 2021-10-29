
import React, {useEffect, useState} from "react";
import Router from 'next/router'
import { auth } from "../../firebase";
import { useAuth } from "../../authcontext"
import { checkActionCode, applyActionCode, sendPasswordResetEmail } from "firebase/auth";
// components
import OnboardUser from '../../components/onboardUser'

export default function VerifyEmail(props) {
    const [error, setError] = useState("")
    const [valid, isValid] = useState(false)
    const { currentUser } = useAuth()
    
    async function checkCode() {
        auth.checkActionCode(props.actionCode).then(() =>{
            return auth.applyActionCode(props.actionCode)
        }).then((resp) => {
                if (resp.status === '200'){
                    isValid(true)
                }
          }).catch((error) => {
            // Invalid code.
            setError("incorrect code", error)
          });
    }
    useEffect(() => {
            checkCode()
      }, [])


    return (
        <div>
            <OnboardUser />
        </div>
    )
  }