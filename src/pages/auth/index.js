import React, { useEffect, useState } from "react";
// components
import ChangeEmail from './changeEmail'
import VerifyEmail from './verifyEmail'
import ResetPassword from './resetPassword'
import { useRouter } from 'next/router'


export default function Settings() {
    const router = useRouter();
    const mode = router.asPath.match("[?&]" + "mode" + "=([^&]+).*$").pop();
    const oobCode = router.asPath.match("[?&]" + "oobCode" + "=([^&]+).*$").pop();

    return (
        <div className="bg-white min-h-full px-4 py-16 sm:px-6 sm:py-24 md:grid md:place-items-center lg:px-8">
            <div className="max-w-max mx-auto">
                <main className="sm:flex ">
                    {mode === 'verifyEmail' ? <VerifyEmail actionCode={oobCode} /> : <div></div>}
                    {mode === 'resetPassword' ? <ResetPassword actionCode={oobCode} /> : <div></div>}
                    {mode === 'changeEmail' ? <ChangeEmail actionCode={oobCode} /> : <div></div>}
                </main>
            </div>
        </div>
    )
}
