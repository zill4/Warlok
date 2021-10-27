import React, {useEffect, useState} from "react";
// components
import ChangeEmail from './changeEmail'
import VerifyEmail from './verifyEmail'
import ResetPassword from './resetPassword'
import { useRouter  } from 'next/router'


export default function Settings() {
    const router = useRouter();
    const mode = router.asPath.match("[?&]" + "mode" + "=([^&]+).*$").pop();
    const oobCode = router.asPath.match("[?&]" + "oobCode" + "=([^&]+).*$").pop();

  return (
        <div>
        {mode === 'verifyEmail'? <VerifyEmail actionCode={oobCode}/> : <div></div>}
        {mode === 'resetPassword'? <ResetPassword actionCode={oobCode}/> : <div></div>}
        {mode === 'changeEmail'? <ChangeEmail actionCode={oobCode}/> : <div></div>}
        </div>
    )
}
