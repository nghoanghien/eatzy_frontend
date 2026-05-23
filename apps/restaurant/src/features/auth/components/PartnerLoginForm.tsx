import AuthInput from "./AuthInput";
import { ChevronRight } from "@repo/ui/icons";

type LoginFormData = { email: string; password: string; rememberMe?: boolean };

type Props = {
  onForgotPassword?: () => void;
  onSubmit?: (data: LoginFormData) => void;
  isLoading?: boolean;
  error?: string | null;
  form: any;
};

export default function PartnerLoginForm({
  onForgotPassword,
  form,
  onSubmit: externalOnSubmit,
  isLoading = false,
  error = null
}: Props) {
  const { register, handleSubmit, formState: { errors, isSubmitting, isValid } } = form;

  const handleFormSubmit = async (data: LoginFormData) => {
    if (externalOnSubmit) {
      externalOnSubmit(data);
    }
  };

  return (
    <div className="w-full">
      {/* Error Message Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100/50 text-red-600 rounded-[24px] text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2 shadow-sm">
          <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <span className="text-red-500 font-black text-xs">!</span>
          </div>
          <div className="flex-1">
            <span className="font-bold text-[10px] uppercase tracking-wider text-red-300">Notice</span>
            <p className="font-bold text-red-600 mt-0.5 leading-tight">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="space-y-6">
        <div className="space-y-4">
          <AuthInput
            label="Email"
            type="email"
            placeholder="partner@example.com"
            error={errors.email?.message}
            autoComplete="email"
            {...register("email")}
          />
          <div className="space-y-3">
            <AuthInput
              label="Password"
              type="password"
              placeholder="Secure your partner account"
              error={errors.password?.message}
              autoComplete="current-password"
              {...register("password")}
            />

            <div className="flex justify-end px-2">
              <button
                type="button"
                className="text-[11px] font-bold text-gray-400 hover:text-[#1A1A1A] transition-colors uppercase tracking-widest"
                onClick={onForgotPassword}
              >
                Lost your password?
              </button>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || isSubmitting || !isValid}
          className={`w-full h-14 rounded-[22px] font-bold transition-all duration-300 flex items-center justify-center gap-3 active:scale-[0.98] ${(isLoading || isSubmitting || !isValid)
              ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
              : "bg-[#1A1A1A] text-white hover:bg-black hover:scale-[1.01] hover:shadow-xl hover:shadow-black/10 shadow-[0_15px_30px_rgba(0,0,0,0.1)]"
            }`}
        >
          {isLoading || isSubmitting ? (
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
              <span className="text-black font-bold">Authenticating...</span>
            </div>
          ) : (
            <>
              <span className="tracking-tight text-lg">Continue to Partner Portal</span>
              <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${!isValid ? 'opacity-30' : 'group-hover:translate-x-1'}`} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
