import { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import { auth, googleProvider } from "../../firebase";
import { useNavigate } from "react-router-dom";
import VideoApp from "../../components/Video";

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (isRegistering && password !== confirmPassword) {
      return setError("As senhas não coincidem.");
    }

    setIsLoading(true);

    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
        if (auth.currentUser) {
          await sendEmailVerification(auth.currentUser);
          setSuccessMessage("Conta criada! Um link de verificação foi enviado para seu e-mail. Por favor, valide sua conta antes de entrar.");
          setIsRegistering(false);
          setEmail("");
          setPassword("");
          setConfirmPassword("");
        }
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        if (!user.emailVerified) {
          await signOut(auth);
          return setError("Seu e-mail ainda não foi verificado. Por favor, verifique sua caixa de entrada.");
        }

        navigate("/home");
      }
    } catch (err: any) {
      setError(
        err.message ||
        (isRegistering ? "Falha ao registrar." : "Falha ao fazer login."),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      if (!user.emailVerified) {
        await signOut(auth);
        return setError("Seu e-mail do Google ainda não foi verificado. Por favor, verifique sua conta Google antes de continuar.");
      }

      navigate("/home");
    } catch (err: any) {
      setError(err.message || "Falha ao fazer login com o Google.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError("");
    setConfirmPassword("");
  };

  return (
    <main
      className="min-h-screen flex w-full bg-surface font-body text-on-surface selection:bg-primary-container selection:text-on-primary-container overflow-x-hidden"
      style={{ minWidth: "320px" }}
    >
      <div className="flex flex-col lg:flex-row w-full relative">
        <div className="hidden lg:flex lg:w-1/3 bg-surface-container-low relative overflow-hidden items-center justify-center p-12">
          <div className="absolute inset-0 texture-overlay"></div>
          <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-outline-variant/15"></div>
        </div>

        <div className="w-full lg:w-2/3 bg-surface flex flex-col items-center justify-center relative p-6 sm:p-12">          
          <VideoApp />
          <div className="z-40 w-full max-w-[420px] relative lg:absolute lg:left-0 lg:top-1/2 lg:-translate-y-1/2 lg:-translate-x-1/2">
            <div className="bg-surface-container-lowest rounded-xl login-card-shadow p-6 sm:p-10 border border-outline-variant/5">
              <div className="mb-6">
                <h1 className="font-headline text-3xl text-on-surface font-extrabold tracking-tight mb-2 text-center">Tasks Manager</h1>
                <h1 className="font-headline text-2xl text-on-surface font-extrabold tracking-tight mb-1">
                  {isRegistering ? "Criar Conta" : "Acesso ao Sistema"}
                </h1>
                <p className="text-sm text-on-surface-variant">
                  {isRegistering
                    ? "Preencha seus dados para começar."
                    : "Bem-vindo de volta."}
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-lg text-sm text-center font-semibold">
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="mb-6 p-4 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg text-sm text-center font-semibold animate-in fade-in duration-300">
                  {successMessage}
                </div>
              )}
              <form className="space-y-6" onSubmit={handleAuth}>
                <div className="space-y-2">
                  <label
                    className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-label"
                    htmlFor="email"
                  >
                    E-mail
                  </label>
                  <div className="relative group">
                    <input
                      className="w-full px-4 py-4 bg-surface-container-highest border-none rounded-lg focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/40 text-on-surface transition-all placeholder:text-outline outline-none"
                      id="email"
                      placeholder="nome@email.com"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                      mail
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label
                      className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-label"
                      htmlFor="password"
                    >
                      Senha
                    </label>
                  </div>
                  <div className="relative group">
                    <input
                      className="w-full px-4 py-4 bg-surface-container-highest border-none rounded-lg focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/40 text-on-surface transition-all placeholder:text-outline outline-none"
                      id="password"
                      placeholder="••••••••"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                      lock
                    </span>
                  </div>
                </div>

                {isRegistering && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label
                        className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider font-label"
                        htmlFor="confirmPassword"
                      >
                        Confirmar Senha
                      </label>
                    </div>
                    <div className="relative group">
                      <input
                        className="w-full px-4 py-4 bg-surface-container-highest border-none rounded-lg focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/40 text-on-surface transition-all placeholder:text-outline outline-none"
                        id="confirmPassword"
                        placeholder="••••••••"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={isLoading}
                      />
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                        lock
                      </span>
                    </div>
                  </div>
                )}

                {!isRegistering && (
                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        className="w-4 h-4 rounded-sm border-surface-variant text-primary focus:ring-primary focus:outline-none"
                        type="checkbox"
                      />
                      <span className="text-sm text-on-surface-variant">
                        Lembrar dispositivo
                      </span>
                    </label>
                    <button
                      type="button"
                      className="text-sm text-primary font-semibold hover:underline decoration-2 underline-offset-4 bg-transparent border-none cursor-pointer"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>
                )}

                <button
                  className="w-full brushed-steel py-4 rounded-lg text-on-primary font-bold tracking-wide shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading
                    ? isRegistering
                      ? "Criando conta..."
                      : "Autenticando..."
                    : isRegistering
                      ? "Registrar"
                      : "Autenticar"}
                </button>

                <div className="text-center pt-4">
                  <p className="text-xs text-on-surface-variant">
                    {isRegistering
                      ? "Já possui acesso? "
                      : "Precisa de acesso? "}
                    <button
                      type="button"
                      onClick={toggleMode}
                      className="text-primary font-bold hover:underline bg-transparent border-none cursor-pointer p-0 m-0 text-xs"
                    >
                      {isRegistering ? "Fazer login" : "Registrar"}
                    </button>
                  </p>
                </div>

                <div className="flex items-center my-6">
                  <div className="flex-1 bg-outline-variant/30 h-px"></div>
                  <span className="px-4 text-xs text-on-surface-variant uppercase tracking-wider">
                    ou continuar com
                  </span>
                  <div className="flex-1 bg-outline-variant/30 h-px"></div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full py-4 rounded-lg bg-surface font-semibold text-on-surface border border-outline-variant/30 flex items-center justify-center gap-3 hover:bg-surface-container-high transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Login;
