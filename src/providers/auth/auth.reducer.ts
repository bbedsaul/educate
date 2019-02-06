import { AuthActions, SET_AUTHENTICATED, SET_UNAUTHENTICATED, SET_EMAILVERIFIED, SET_EMAILUNVERIFIED  } from './auth.actions';

export interface State {
  isAuthenticated: boolean;
  isEmailVerified: boolean;
}

const initialState: State = {
  isAuthenticated: false,
  isEmailVerified: false
};

export function authReducer(state = initialState, action: AuthActions) {
  switch (action.type) {
    case SET_AUTHENTICATED:
      return {
        ...state,
        isAuthenticated: true
      };
    case SET_UNAUTHENTICATED:
      return {
        ...state,
        isAuthenticated: false
      };
    case SET_EMAILVERIFIED:
      return {
        ...state,
        isEmailVerified: true
      };
    case SET_EMAILUNVERIFIED:
      return {
        ...state,
        isEmailVerified: false
      };
    default: {
      return state;
    }
  }
}

/*
export const getAuthState = createFeatureSelector<UserProfileState>('userprofile');
export const getUserProfile = createSelector(getAuthState, (state: UserProfileState) => state.userProfile);
*/

export const getIsAuth = (state: State) => state.isAuthenticated;
export const getIsVerified = (state: State) => state.isEmailVerified;

  /*
{
  console.log("Auth :: " + state.isAuthenticated + " Email Verified :: " + state.isEmailVerified);
  if( state.isAuthenticated )
      return state.isEmailVerified;
  return state.isAuthenticated;
};
*/

