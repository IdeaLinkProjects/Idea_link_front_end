import { readRememberedEmail } from "./rememberEmailStorage";

export type LoginFormState = {
  email: string;
  password: string;
  remember: boolean;
};

export function createInitialLoginForm(): LoginFormState {
  return {
    email: readRememberedEmail(),
    password: "",
    remember: false,
  };
}
