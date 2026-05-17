import { Lock, Mail, Phone, User } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useAppServices } from "../../app/use-app-services";
import type { AuthFormProps } from "./auth-form-props";
import { RegisterFormSchema } from "./auth-form-schema";
import { getFormError, getUnknownErrorMessage } from "./form-error";

export function RegisterForm({ close, setMode }: AuthFormProps) {
  const { api, session } = useAppServices();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const result = RegisterFormSchema.safeParse(
      Object.fromEntries(new FormData(event.currentTarget)),
    );
    if (!result.success) {
      setError(getFormError(result.error));
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await api.user.register(result.data);
      session.setUser(user);
      close();
    } catch (requestError) {
      setError(getUnknownErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={submit}>
      <div>
        <h2 className="text-3xl font-black">Create your account</h2>
        <p className="text-sm text-base-content/60">
          Save vocabulary, streaks, and AI chat progress.
        </p>
      </div>
      <label className="input input-bordered flex items-center gap-2">
        <User aria-hidden="true" size={18} />
        <input name="name" placeholder="Name" />
      </label>
      <label className="input input-bordered flex items-center gap-2">
        <Phone aria-hidden="true" size={18} />
        <input maxLength={11} name="phone" placeholder="Phone number" />
      </label>
      <label className="input input-bordered flex items-center gap-2">
        <Mail aria-hidden="true" size={18} />
        <input name="email" placeholder="Email" type="email" />
      </label>
      <label className="input input-bordered flex items-center gap-2">
        <Lock aria-hidden="true" size={18} />
        <input name="password" placeholder="Password" type="password" />
      </label>
      {error ? <div className="alert alert-error py-2">{error}</div> : null}
      <button className="btn btn-primary" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Creating..." : "Create account"}
      </button>
      <button
        className="btn btn-link"
        onClick={() => {
          setMode("login");
        }}
        type="button"
      >
        I already have an account
      </button>
    </form>
  );
}
