export type CompanyFormDraft = {
  name: string;
  industry: string;
  description: string;
  website: string;
  incorporationDate: string;
  registrationNumber: string;
  taxIdentificationNumber: string;
  businessLicenseNumber: string;
  isRegisteredCompany: boolean;
  foundedYear: string;
  headquarters: string;
  companiesize: string;
  stage: string;
};

export type CompanyTabKey = "overview" | "team" | "settings";

export type TeamMemberDraft = {
  id: number;
  fullName: string;
  role: string;
  email: string;
  bio: string | null;
  linkedinUrl: string | null;
  orderIndex: number;
  founder: boolean;
};

export const emptyDraft: CompanyFormDraft = {
  name: "",
  industry: "",
  description: "",
  website: "",
  incorporationDate: "",
  registrationNumber: "",
  taxIdentificationNumber: "",
  businessLicenseNumber: "",
  isRegisteredCompany: false,
  foundedYear: "",
  headquarters: "",
  companiesize: "",
  stage: "",
};
