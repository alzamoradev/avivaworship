'use client'

import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { Chrome, Mail, Lock, Eye, EyeOff } from 'lucide-react'

function LoginContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'authenticated') {
      router.push(callbackUrl)
    }
  }, [status, router, callbackUrl])

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    await signIn('google', { callbackUrl })
  }

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
    } else {
      router.push(callbackUrl)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-aviva-gold border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="-mt-16">
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          <img
            src="/hero-login.webp"
            alt="Worship"
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-aviva-black/60 via-aviva-black/40 to-aviva-black" />
          <div className="absolute inset-0 bg-gradient-to-t from-aviva-black via-transparent to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-md mx-auto px-4 pt-24 pb-16">
          {/* Logo */}
          <div className="text-center mb-8">
            <svg width="184" height="66" viewBox="0 0 184 66" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-16 w-auto mx-auto mb-6">
              <path d="M134.556 0.232727C134.132 0.232727 133.981 0.397004 133.845 0.807695C131.326 8.25491 128.779 15.7021 126.247 23.1493C125.918 24.135 125.576 25.1206 125.206 26.1884C125.111 25.9283 125.056 25.7914 125.001 25.6409C123.043 19.8775 121.086 14.1141 119.114 8.33704C118.252 5.80445 117.403 3.27185 116.527 0.752937C116.459 0.56128 116.24 0.273796 116.103 0.273796C113.474 0.246417 110.846 0.246417 108.135 0.246417C108.204 0.451763 108.245 0.58866 108.3 0.725557C112.749 12.8136 117.198 24.9016 121.62 36.9896C121.757 37.373 121.935 37.4688 122.29 37.4688C124.139 37.4551 125.987 37.4414 127.835 37.4688C128.245 37.4688 128.437 37.3456 128.601 36.9075C133.009 24.8742 137.431 12.8683 141.853 0.848765C141.922 0.670798 141.963 0.492832 142.045 0.246417C139.485 0.246417 137.007 0.260107 134.543 0.246417L134.556 0.232727Z" fill="#F2F0F0"/>
              <path d="M67.477 0.273778C67.3264 0.273778 67.121 0.561263 67.0526 0.766608C64.6021 7.92633 62.1654 15.0998 59.7286 22.2732C59.2905 23.5463 58.8524 24.8195 58.387 26.2021C58.2638 25.8736 58.1816 25.6682 58.1132 25.4492C55.3205 17.2353 52.5278 9.0352 49.7488 0.821367C49.5982 0.383296 49.4202 0.246399 48.9958 0.246399C47.4763 0.273778 45.943 0.246399 44.4235 0.246399H41.3296C41.4117 0.506504 41.4665 0.71185 41.5486 0.917195C43.0408 4.95566 44.5193 9.00782 46.0115 13.0463C48.9411 21.0137 51.8707 28.9811 54.8003 36.9622C54.9372 37.3592 55.1288 37.4688 55.4985 37.4688C57.3466 37.4414 59.1947 37.4414 61.0428 37.4688C61.4398 37.4688 61.6315 37.3592 61.782 36.9486C66.1901 24.9153 70.6256 12.882 75.0474 0.848747C75.1158 0.67078 75.1569 0.492814 75.239 0.260089C72.5969 0.260089 70.0369 0.260089 67.477 0.287468V0.273778Z" fill="#F2F0F0"/>
              <path d="M33.5947 29.3234C29.8437 19.6995 26.0927 10.0756 22.3554 0.451761C22.2185 0.109518 22.0679 0 21.7257 0C19.727 0.0136897 17.7283 0.0273794 15.7296 0C15.3737 0 15.2368 0.136897 15.0999 0.465451C10.4043 12.5535 5.70873 24.6141 1.01315 36.6885C0.958395 36.8391 0.917326 36.9896 0.848877 37.1813C1.04053 37.1813 1.19112 37.2087 1.34171 37.2087C3.54575 37.2087 5.7498 37.2087 7.95384 37.2087C8.32347 37.2087 8.47405 37.0855 8.61095 36.7158C10.5549 31.4727 12.5125 26.2432 14.4702 21.0137C15.8391 17.3312 17.2081 13.6623 18.6318 9.8566C18.7413 10.1167 18.8098 10.2673 18.8646 10.4042C22.1227 19.1245 25.3809 27.8449 28.6253 36.5789C28.7896 37.017 28.9813 37.2224 29.4604 37.2087C31.6644 37.1676 33.8685 37.195 36.0725 37.195H36.6612C36.5517 36.9075 36.4832 36.7022 36.4011 36.4968C35.4702 34.1011 34.5256 31.7054 33.5947 29.3097V29.3234Z" fill="#F2F0F0"/>
              <path d="M182.402 36.6885C177.693 24.6004 172.984 12.5124 168.288 0.424381C168.165 0.0958281 168.001 0 167.686 0C165.701 0.0136897 163.716 0.0273794 161.731 0C161.347 0 161.169 0.123208 161.019 0.50652C156.337 12.5672 151.628 24.6141 146.932 36.6748C146.864 36.8254 146.836 37.0033 146.768 37.2087C149.259 37.2087 151.669 37.2087 154.064 37.195C154.215 37.195 154.42 36.9486 154.489 36.7706C156.912 30.3091 159.321 23.8338 161.744 17.3723C162.662 14.8944 163.592 12.4166 164.551 9.82922C164.797 10.4863 165.003 11.0476 165.208 11.6089C168.329 19.9733 171.45 28.3377 174.572 36.7158C174.709 37.0992 174.887 37.2361 175.27 37.2224C176.584 37.195 177.912 37.2224 179.24 37.2224H182.553C182.484 37.017 182.443 36.8527 182.388 36.7158L182.402 36.6885Z" fill="#F2F0F0"/>
              <path d="M95.4037 0.273804H88.0112V37.1676H95.4037V0.273804Z" fill="#F2F0F0"/>
              <path d="M15.9212 64.9988L12.1975 50.652L8.41918 64.9988H5.43482L0 45.3814H3.36767L7.02283 59.7009L10.5137 45.3814H13.8266L17.5228 59.7009L21.1506 45.3814H24.3677L18.9876 64.9988H15.9212Z" fill="#F2BC15"/>
              <path d="M35.1001 55.3749C35.1001 48.7354 38.4404 44.738 44.3133 44.738C50.1862 44.738 53.4443 48.7217 53.4443 55.457C53.4443 62.1924 50.1314 65.6696 44.3544 65.6696C38.5773 65.6696 35.1138 61.9733 35.1138 55.3612L35.1001 55.3749ZM50.3094 55.3475C50.3094 50.3918 48.1875 47.5444 44.2859 47.5444C40.3843 47.5444 38.235 50.3781 38.235 55.4023C38.235 60.4264 40.4802 62.9864 44.2311 62.9864C47.9821 62.9864 50.3094 60.6591 50.3094 55.3338V55.3475Z" fill="#F2BC15"/>
              <path d="M78.6472 64.9988V59.9199C78.6472 57.8801 77.8806 56.9355 75.0742 56.9355H69.7352V64.9988H66.6687V45.3814H76.361C79.934 45.3814 82.2339 47.7087 82.2339 50.871C82.2339 53.1982 80.9882 55.0327 78.8389 55.5939C80.9334 56.032 81.7274 57.1272 81.7274 59.5229V64.9851H78.6609L78.6472 64.9988ZM75.6355 54.3756C78.2639 54.3756 79.2632 52.9518 79.2632 51.1858C79.2632 49.2967 78.1681 48.0235 75.8408 48.0235H69.7215V54.3756H75.6355Z" fill="#F2BC15"/>
              <path d="M106.821 51.1859C106.698 48.6806 105.192 47.4349 102.18 47.4349C99.3466 47.4349 97.9502 48.5301 97.9502 50.3919C97.9502 51.7745 98.7168 52.459 99.8668 52.9655C101.934 53.8554 104.234 53.7869 106.479 54.5672C108.628 55.3065 110.312 56.6891 110.312 59.6461C110.312 63.5477 107.424 65.697 102.687 65.697C97.9502 65.697 94.651 63.5751 94.5688 59.1396H97.608C97.6627 61.7133 99.6751 63.1507 102.687 63.1507C105.521 63.1507 107.232 61.8775 107.232 59.7283C107.232 58.4825 106.671 57.6337 105.165 57.0451C103.303 56.3058 101.003 56.3332 98.7031 55.4844C96.1979 54.5398 95.0343 53.034 95.0343 50.6109C95.0343 47.1885 97.3616 44.7654 102.057 44.7654C106.753 44.7654 109.71 47.2706 109.764 51.1996H106.78L106.821 51.1859Z" fill="#F2BC15"/>
              <path d="M135.638 64.9988V55.813H126.479V64.9988H123.317V45.3814H126.479V53.1435H135.638V45.3814H138.828V64.9988H135.638Z" fill="#F2BC15"/>
              <path d="M152.243 64.9988V45.3814H155.405V64.9988H152.243Z" fill="#F2BC15"/>
              <path d="M168.808 64.9988V45.3814H177.282C181.006 45.3814 183.401 48.1878 183.401 51.7061C183.401 55.2243 181.006 57.7843 177.282 57.7843H171.97V64.9851H168.808V64.9988ZM176.817 55.2243C179.39 55.2243 180.622 53.7184 180.622 51.6513C180.622 49.5842 179.377 48.0235 176.817 48.0235H171.97V55.2243H176.817Z" fill="#F2BC15"/>
            </svg>
            <p className="text-aviva-gold text-sm font-semibold tracking-[0.2em] uppercase mb-2">
              Cancionero digital
            </p>
            <h1 className="text-3xl font-black mb-2 tracking-tight">
              INICIAR SESIÓN
            </h1>
            <p className="text-aviva-text-muted">
              Accedé al cancionero de tu iglesia
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-aviva-dark-lighter/90 backdrop-blur-sm border border-aviva-gray rounded-2xl p-6 sm:p-8">
            {/* Credentials Form */}
            <form onSubmit={handleCredentialsSignIn} className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-aviva-text-muted mb-2 uppercase tracking-wide">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-aviva-text-muted" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="input-aviva pl-12"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-aviva-text-muted mb-2 uppercase tracking-wide">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-aviva-text-muted" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-aviva pl-12 pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-aviva-text-muted hover:text-aviva-text"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-aviva-black border-t-transparent rounded-full animate-spin mx-auto" />
                ) : (
                  'INGRESAR'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-aviva-gray"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-aviva-dark-lighter text-aviva-text-muted uppercase tracking-wide text-xs">o continúa con</span>
              </div>
            </div>

            {/* Google Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-900 font-semibold py-4 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {googleLoading ? (
                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Chrome size={20} />
                  Google
                </>
              )}
            </button>
          </div>

          {/* Info */}
          <div className="mt-6 text-center">
            <p className="text-xs text-aviva-text-muted/60">
              Uso exclusivo para miembros de la comunidad Aviva.
              <br />
              Nos reservamos el derecho de eliminar cuentas no autorizadas.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-aviva-gold border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
