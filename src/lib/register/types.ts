export type RegisterFormState = {
  email: string;
  password: string;
  fullName: string;
  nationalId: string;
  horizon: string;
  tolerance: string;
  priorInvest: string;
  terms: boolean;
  licenseFile: File | null;
};

export function createEmptyRegisterForm(): RegisterFormState {
  return {
    email: "",
    password: "",
    fullName: "",
    nationalId: "",
    horizon: "",
    tolerance: "",
    priorInvest: "",
    terms: false,
    licenseFile: null,
  };
}
