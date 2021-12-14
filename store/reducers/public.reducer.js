import { REHYDRATE } from 'redux-persist/lib/constants';

import * as actions from '../actions/public.actions';
import * as userActions from '../actions/user.actions';

const initialState = {
  loading: false,
  error: null,
  settings: {},
  o365Token: {},
};

export default function publicReducer(state = initialState, action) {
  let newState = {
    ...state,
    error: null,
  };

  switch (action.type) {
    case REHYDRATE: {
      return {
        ...newState,
        loading: false,
      };
    }
    case actions.PUBLIC_GET_SITE_SETTINGS_START: {
      return {
        ...newState,
        settings: {},
        loading: true,
      };
    }
    case actions.PUBLIC_GET_SITE_SETTINGS_SUCCESS: {
      let { settings } = action;
      return {
        ...newState,
        settings,
        loading: false,
      };
    }
    case actions.PUBLIC_GET_SITE_SETTINGS_FAILURE: {
      return {
        ...newState,
        error: action.error,
        loading: false,
      };
    }
    case actions.PUBLIC_CLEAR_SITE_SETTINGS: {
      return {
        ...newState,
        settings: {},
      };
    }
    case actions.PUBLIC_GET_O365_TOKEN_START: {
      return {
        ...newState,
        o365Token: {},
        loading: true,
      };
    }
    case actions.PUBLIC_GET_O365_TOKEN_SUCCESS: {
      let { o365Token } = action;
      return {
        ...newState,
        o365Token,
        loading: false,
      };
    }
    case actions.PUBLIC_GET_O365_TOKEN_FAILURE: {
      return {
        ...newState,
        error: action.error,
        loading: false,
      };
    }
    case userActions.USER_LOGOUT:
      return {
        ...newState,
        settings: {},
        o365Token: {},
      };
    default:
      return newState;
  }
}
