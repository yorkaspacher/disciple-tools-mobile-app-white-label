import { combineReducers } from 'redux';

import networkConnectivityReducer from './reducers/networkConnectivity.reducer';
import requestReducer from './reducers/request.reducer';
import userReducer from './reducers/user.reducer';
import contactsReducer from './reducers/contacts.reducer';
import groupsReducer from './reducers/groups.reducer';
import usersReducer from './reducers/users.reducer';
import i18nReducer from './reducers/i18n.reducer';
import notificationsReducer from './reducers/notifications.reducer';
import questionnaireReducer from './reducers/questionnaire.reducer';
import publicReducer from './reducers/public.reducer';

const reducers = combineReducers({
  networkConnectivityReducer,
  requestReducer,
  userReducer,
  contactsReducer,
  groupsReducer,
  usersReducer,
  i18nReducer,
  notificationsReducer,
  questionnaireReducer,
  publicReducer,
});

export default reducers;
