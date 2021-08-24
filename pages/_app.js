import 'tailwindcss/tailwind.css'

import { AuthProvider } from "../authcontext"
import Navbar from "../components/navbar"

function MyApp({ Component, pageProps }) {

  return(
      <AuthProvider>
          <Navbar />
          <Component {...pageProps} />
      </AuthProvider>
  );
}

export default MyApp
