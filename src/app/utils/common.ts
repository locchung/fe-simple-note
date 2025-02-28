import { LOCAL_STORAGE_KEY } from "../constants/localStorage";
import { IAuth } from "../interfaces/types";


export const getUserAuth = (): IAuth | undefined => {
  const userObj = localStorage.getItem(LOCAL_STORAGE_KEY.USER);
  if (!userObj) return undefined;
  try {
    const parsedUser = JSON.parse(userObj);

    return parsedUser;
  } catch (error) {
    console.log(error);
    return undefined;
  }
};

