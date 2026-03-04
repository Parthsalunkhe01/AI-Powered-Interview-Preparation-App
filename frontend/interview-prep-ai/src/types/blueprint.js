export const Blueprint = {
  targetRole: "",
  yearsOfExperience: "",
  skills: [],
  targetCompanies: [],
};

export const PageMode = Object.freeze({
  LOADING: "loading",
  EMPTY: "empty",
  VIEW: "view",
  CREATE: "create",
  EDIT: "edit",
  SAVING: "saving",
  DELETING: "deleting",
});