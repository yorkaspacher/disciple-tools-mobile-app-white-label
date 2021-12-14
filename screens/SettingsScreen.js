import React from 'react';
import { connect } from 'react-redux';
import { StyleSheet, Text, View, KeyboardAvoidingView, Dimensions } from 'react-native';
import {
  Body,
  Button as NbButton,
  Container,
  Icon,
  Left,
  ListItem,
  Picker,
  Right,
  Switch,
  Thumbnail,
} from 'native-base';
import Toast from 'react-native-easy-toast';
import PropTypes from 'prop-types';

import * as Updates from 'expo-updates';
import Constants from 'expo-constants';
import * as MailComposer from 'expo-mail-composer';
import Colors from '../constants/Colors';
import { setLanguage, cancelSetLanguage, setCancelFalse } from '../store/actions/i18n.actions';
import {
  logout,
  toggleRememberPassword,
  savePINCode,
  removePINCode,
  updateUserInfo,
} from '../store/actions/user.actions';
import { toggleNetworkConnectivity } from '../store/actions/networkConnectivity.actions';
import i18n from '../languages';
import locales from '../languages/locales';
import { BlurView } from 'expo-blur';
import SmoothPinCodeInput from 'react-native-smooth-pincode-input';
import { Row } from 'react-native-easy-grid';

const propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
  i18n: PropTypes.shape({
    locale: PropTypes.string,
    isRTL: PropTypes.bool,
  }).isRequired,
  isConnected: PropTypes.bool.isRequired,
  userData: PropTypes.shape({
    domain: PropTypes.string,
    displayName: PropTypes.string,
  }).isRequired,
  logout: PropTypes.func.isRequired,
  setLanguage: PropTypes.func.isRequired,
  toggleNetworkConnectivity: PropTypes.func.isRequired,
  pinCode: PropTypes.shape({
    enabled: PropTypes.bool,
    value: PropTypes.string,
  }),
};

let styles;
function updateColors(
  topbarColor = Colors.tintColor,
  primaryColor = Colors.tintColor,
  secondaryColor = Colors.accent,
  successColor = Colors.colorYes,
  dangerColor = Colors.colorNo,
  warningColor = '',
  infoColor = '',
  switchColor = '#86efac',
  linkColor = Colors.tintColor,
  titlesColor = Colors.tintColor,
  backgroundColor = Colors.canvas,
  tilesColor = '',
) {
  let stylesObject = {
    container: {
      backgroundColor: Colors.canvas,
      height: 100,
    },
    header: {
      borderBottomWidth: 1,
      backgroundColor: Colors.tabBar,
      paddingBottom: 10,
      marginBottom: 10,

      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,

      elevation: 5,
    },
    headerBody: {
      borderBottomWidth: 0,
      alignItems: 'flex-start',
    },
    username: {
      fontSize: 24,
      fontWeight: '500',
    },
    domain: {
      fontStyle: 'italic',
      color: '#888',
    },
    body: {
      alignItems: 'flex-start',
    },
    versionText: {
      color: Colors.grayDark,
      fontSize: 12,
      position: 'absolute',
      bottom: 15,
      right: 15,
    },
    offlineBar: {
      height: 20,
      backgroundColor: '#FCAB10',
    },
    offlineBarText: {
      fontSize: 14,
      color: 'white',
      textAlignVertical: 'center',
      textAlign: 'center',
    },
    dialogBackground: {
      position: 'absolute',
      justifyContent: 'center',
      alignItems: 'center',
      top: 0,
      left: 0,
    },
    dialogBox: {
      backgroundColor: '#FFFFFF',
      padding: 20,
      marginLeft: 10,
      marginRight: 10,
    },
    dialogButton: {
      backgroundColor: primaryColor,
      borderRadius: 5,
      width: 150,
      alignSelf: 'center',
      marginTop: 20,
    },
    dialogContent: {
      fontSize: 20,
      textAlign: 'center',
      color: Colors.grayDark,
      marginBottom: 5,
    },
    textColor: { color: primaryColor },
    backgroundColor: { backgroundColor: topbarColor },
    switchColor: { backgroundColor: switchColor },
  };
  styles = StyleSheet.create(stylesObject);
}
updateColors();

let toastError;
const { height, width } = Dimensions.get('window');
class SettingsScreen extends React.Component {
  state = {
    toggleShowPIN: false,
    pin: '',
    confirmPin: false,
    confirmPinValue: '',
    incorrectPin: false,
    toggleRestartDialog: false,
    selectedNewRTLDirection: false,
    i18n: {
      ...this.props.i18n,
    },
  };

  static navigationOptions = ({ navigation }) => {
    return {
      title: i18n.t('settingsScreen.settings'),
      headerStyle:
        navigation.state.params && navigation.state.params.headerStyle
          ? { ...navigation.state.params.headerStyle }
          : {
              backgroundColor: Colors.tintColor,
            },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    };
  };

  constructor(props) {
    super(props);
    this.onFABPress = this.onFABPress.bind(this);
    this.checkSiteSettings(props.siteSettings, props.navigation);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { userData, i18n } = nextProps;

    let newState = {
      ...prevState,
      ...i18n,
    };

    if (userData) {
      newState = {
        ...newState,
        selectedNewRTLDirection: prevState.i18n.isRTL !== i18n.isRTL,
      };
    }

    return newState;
  }

  componentDidUpdate(prevProps) {
    const { rememberPassword, userData, userReducerError } = this.props;

    // Updated user locale setting
    if (userData && prevProps.userData !== userData && userData.locale !== this.props.i18n.locale) {
      // Only update app language on user profile language update (not cancel language change)
      if (!this.props.i18n.canceledLocaleChange) {
        this.changeLanguage(userData.locale.replace('_', '-'));
      }
    } else {
      if (this.props.i18n.canceledLocaleChange) {
        this.props.setCancelFalse();
        this.updateUserInfo({
          locale: prevProps.i18n.previousLocale.replace('-', '_'),
        });
      }
    }

    // Updated locale on store
    if (prevProps.i18n.locale !== this.props.i18n.locale && !this.props.i18n.canceledLocaleChange) {
      this.showRestartDialog();
    }

    if (rememberPassword !== undefined && prevProps.rememberPassword !== rememberPassword) {
      this.showToast(
        rememberPassword
          ? i18n.t('settingsScreen.rememberPasswordActive')
          : i18n.t('settingsScreen.rememberPasswordInactive'),
      );
    }

    const userError = prevProps.userReducerError !== userReducerError && userReducerError;
    if (userError) {
      toastError.show(
        <View>
          <Text style={{ fontWeight: 'bold', color: Colors.errorText }}>
            {i18n.t('global.error.code')}
          </Text>
          <Text style={{ color: Colors.errorText }}>{userError.code}</Text>
          <Text style={{ fontWeight: 'bold', color: Colors.errorText }}>
            {i18n.t('global.error.message')}
          </Text>
          <Text style={{ color: Colors.errorText }}>{userError.message}</Text>
        </View>,
        3000,
      );
    }
  }

  checkSiteSettings = (siteSettings = null, navigation) => {
    if (
      siteSettings !== null &&
      Object.prototype.hasOwnProperty.call(siteSettings, 'custom_styles_css')
    ) {
      let topbarColor = siteSettings.custom_styles_css.find(
        (style) => style.option_name == 'vc_color_topbar',
      );
      let primaryColor = siteSettings.custom_styles_css.find(
        (style) => style.option_name == 'vc_color_primary',
      );
      let secondaryColor = siteSettings.custom_styles_css.find(
        (style) => style.option_name == 'vc_color_secondary',
      );
      let successColor = siteSettings.custom_styles_css.find(
        (style) => style.option_name == 'vc_color_success',
      );
      let dangerColor = siteSettings.custom_styles_css.find(
        (style) => style.option_name == 'vc_color_danger',
      );
      let warningColor = siteSettings.custom_styles_css.find(
        (style) => style.option_name == 'vc_color_warning',
      );
      let infoColor = siteSettings.custom_styles_css.find(
        (style) => style.option_name == 'vc_color_info',
      );
      let switchColor = siteSettings.custom_styles_css.find(
        (style) => style.option_name == 'vc_color_switch',
      );
      let linkColor = siteSettings.custom_styles_css.find(
        (style) => style.option_name == 'vc_color_link',
      );
      let titlesColor = siteSettings.custom_styles_css.find(
        (style) => style.option_name == 'vc_color_titles',
      );
      let backgroundColor = siteSettings.custom_styles_css.find(
        (style) => style.option_name == 'vc_color_background',
      );
      let tilesColor = siteSettings.custom_styles_css.find(
        (style) => style.option_name == 'vc_color_tiles',
      );
      updateColors(
        topbarColor.option_value,
        primaryColor.option_value,
        secondaryColor.option_value,
        successColor.option_value,
        dangerColor.option_value,
        warningColor.option_value,
        infoColor.option_value,
        switchColor.option_value,
        linkColor.option_value,
        titlesColor.option_value,
        backgroundColor.option_value,
        tilesColor.option_value,
      );
      navigation.setParams({
        headerStyle: {
          backgroundColor: topbarColor.option_value,
        },
      });
    } else {
      updateColors();
    }
    this.forceUpdate();
  };

  signOutAsync = async () => {
    this.props.logout();
    // await AsyncStorage.removeItem('@KeyStore:token');
    this.props.navigation.navigate('Auth');
  };

  onFABPress = () => {
    if (this.props.networkStatus) {
      const toastMsg = this.props.isConnected
        ? i18n.t('settingsScreen.networkUnavailable')
        : i18n.t('settingsScreen.networkAvailable');
      this.toast.show(toastMsg, 3000);
      this.props.toggleNetworkConnectivity(this.props.isConnected);
    }
  };

  draftNewSupportEmail = () => {
    MailComposer.composeAsync({
      recipients: ['appsupport@disciple.tools'],
      subject: `DT App Support: v${Constants.manifest.version}`,
      body: '',
    }).catch((onrejected) => {
      toastError.show(
        <View>
          <Text style={{ fontWeight: 'bold', color: Colors.errorText }}>
            {i18n.t('global.error.message')}
          </Text>
          <Text style={{ color: Colors.errorText }}>{onrejected.toString()}</Text>
        </View>,
        3000,
      );
    });
  };

  toggleRememberPassword = () => {
    this.props.toggleRememberPassword();
  };

  toggleShowPIN = () => {
    this.setState((prevState) => ({
      toggleShowPIN: !prevState.toggleShowPIN,
      pin: '',
      incorrectPin: false,
      confirmPin: false,
      confirmPinValue: '',
    }));
  };

  showToast = (message, error = false) => {
    if (error) {
      toastError.show(
        <View>
          <Text style={{ color: Colors.errorText }}>{message}</Text>
        </View>,
        3000,
      );
    } else {
      this.toast.show(message, 3000);
    }
  };

  savePINCode = (value) => {
    this.props.savePINCode(value);
  };

  removePINCode = () => {
    this.props.removePINCode();
  };

  offlineBarRender = () => (
    <View style={[styles.offlineBar]}>
      <Text style={[styles.offlineBarText]}>{i18n.t('global.offline')}</Text>
    </View>
  );

  renderLanguagePickerItems = () =>
    locales.map((locale) => (
      <Picker.Item label={locale.name} value={locale.code} key={locale.code} />
    ));

  selectLanguage = (languageCode) => {
    // Set language in Server
    this.updateUserInfo({
      locale: languageCode.replace('-', '_'),
    });
  };

  updateUserInfo = (userInfo) => {
    this.props.updateUserInfo(this.props.userData.domain, this.props.userData.token, userInfo);
  };

  changeLanguage(languageCode) {
    let locale = locales.find((item) => {
      return item.code === languageCode;
    });
    // Set locale and RTL in State
    this.props.setLanguage(locale.code, locale.rtl);
  }

  showRestartDialog = () => {
    this.setState({
      toggleRestartDialog: true,
    });
  };

  restartApp = () => {
    i18n.setLocale(this.props.i18n.locale, this.props.i18n.isRTL).then(() => {
      Updates.reload();
    });
  };

  cancelSetLanguage = () => {
    this.props.cancelSetLanguage();
    this.setState({
      toggleRestartDialog: false,
    });
  };

  render() {
    return (
      <Container style={styles.container}>
        {!this.props.isConnected && this.offlineBarRender()}
        <ListItem itemHeader first avatar style={styles.header}>
          <Left>
            <Thumbnail source={require('../assets/images/gravatar-default.png')} />
          </Left>
          <Body style={styles.headerBody}>
            <Text
              style={[
                {
                  writingDirection: this.props.i18n.isRTL ? 'rtl' : 'ltr',
                  textAlign: this.props.i18n.isRTL ? 'right' : 'left',
                },
                styles.username,
              ]}>
              {this.props.userData.displayName}
            </Text>
            <Text
              style={[
                {
                  writingDirection: this.props.i18n.isRTL ? 'rtl' : 'ltr',
                  textAlign: this.props.i18n.isRTL ? 'right' : 'left',
                },
                styles.domain,
              ]}>
              {this.props.userData.domain}
            </Text>
          </Body>
        </ListItem>

        {/* === Storybook === */}
        {__DEV__ && (
          <ListItem icon onPress={() => this.props.navigation.navigate('Storybook')}>
            <Left>
              <NbButton onPress={() => this.props.navigation.navigate('Storybook')}>
                <Icon active name="flask" />
              </NbButton>
            </Left>
            <Body style={styles.body}>
              <Text
                style={{
                  writingDirection: this.props.i18n.isRTL ? 'rtl' : 'ltr',
                  textAlign: this.props.i18n.isRTL ? 'right' : 'left',
                }}>
                {i18n.t('settingsScreen.storybook')}
              </Text>
            </Body>
            <Right>
              <Icon active name={this.props.i18n.isRTL ? 'arrow-back' : 'arrow-forward'} />
            </Right>
          </ListItem>
        )}
        {/* === Online === */}
        <ListItem icon onPress={this.onFABPress}>
          <Left>
            <NbButton onPress={this.onFABPress}>
              <Icon active name="ios-flash" />
            </NbButton>
          </Left>
          <Body style={styles.body}>
            <Text
              style={{
                writingDirection: this.props.i18n.isRTL ? 'rtl' : 'ltr',
                textAlign: this.props.i18n.isRTL ? 'right' : 'left',
              }}>
              {i18n.t('global.online')}
            </Text>
          </Body>
          <Right>
            <Switch
              value={this.props.isConnected}
              onChange={this.onFABPress}
              disabled={!this.props.networkStatus}
              onTrackColor={styles.switchColor.backgroundColor}
            />
          </Right>
        </ListItem>
        {/* === Language === */}
        <ListItem icon>
          <Left>
            <NbButton>
              <Icon active type="FontAwesome" name="language" />
            </NbButton>
          </Left>
          <Body style={styles.body}>
            <Text
              style={{
                writingDirection: this.props.i18n.isRTL ? 'rtl' : 'ltr',
                textAlign: this.props.i18n.isRTL ? 'right' : 'left',
              }}>
              {i18n.t('global.language')}
            </Text>
          </Body>
          <Right>
            <Picker
              style={{ width: 150 }}
              selectedValue={this.props.i18n.locale}
              onValueChange={this.selectLanguage}>
              {this.renderLanguagePickerItems()}
            </Picker>
          </Right>
        </ListItem>
        {/* === Remember password === */}
        <ListItem icon>
          <Left>
            <NbButton>
              <Icon active type="MaterialCommunityIcons" name="onepassword" />
            </NbButton>
          </Left>
          <Body style={styles.body}>
            <Text
              style={{
                writingDirection: this.props.i18n.isRTL ? 'rtl' : 'ltr',
                textAlign: this.props.i18n.isRTL ? 'right' : 'left',
              }}>
              {i18n.t('settingsScreen.rememberPassword')}
            </Text>
          </Body>
          <Right>
            <Switch
              value={this.props.rememberPassword}
              onChange={this.toggleRememberPassword}
              onTrackColor={styles.switchColor.backgroundColor}
            />
          </Right>
        </ListItem>
        {/* === PIN Code === */}
        <ListItem icon onPress={this.toggleShowPIN}>
          <Left>
            <NbButton>
              <Icon active type="MaterialCommunityIcons" name="security" />
            </NbButton>
          </Left>
          <Body style={styles.body}>
            <Text
              style={{
                writingDirection: this.props.i18n.isRTL ? 'rtl' : 'ltr',
                textAlign: this.props.i18n.isRTL ? 'right' : 'left',
              }}>
              {`${
                this.props.pinCode.enabled
                  ? i18n.t('settingsScreen.remove')
                  : i18n.t('settingsScreen.set')
              } ${i18n.t('settingsScreen.pinCode')}`}
            </Text>
          </Body>
        </ListItem>
        {/* === Help / Support === */}
        <ListItem icon onPress={this.draftNewSupportEmail}>
          <Left>
            <NbButton>
              <Icon active name="help-circle" />
            </NbButton>
          </Left>
          <Body style={styles.body}>
            <Text
              style={{
                writingDirection: this.props.i18n.isRTL ? 'rtl' : 'ltr',
                textAlign: this.props.i18n.isRTL ? 'right' : 'left',
              }}>
              {i18n.t('settingsScreen.helpSupport')}
            </Text>
          </Body>
        </ListItem>
        {/* === Logout === */}
        <ListItem icon onPress={this.signOutAsync}>
          <Left>
            <NbButton>
              <Icon active name="log-out" />
            </NbButton>
          </Left>
          <Body style={styles.body}>
            <Text
              style={{
                writingDirection: this.props.i18n.isRTL ? 'rtl' : 'ltr',
                textAlign: this.props.i18n.isRTL ? 'right' : 'left',
              }}>
              {i18n.t('settingsScreen.logout')}
            </Text>
          </Body>
          <Right>
            <Icon active name={this.props.i18n.isRTL ? 'arrow-back' : 'arrow-forward'} />
          </Right>
        </ListItem>
        <Text style={styles.versionText}>{Constants.manifest.version}</Text>
        <Toast
          ref={(c) => {
            this.toast = c;
          }}
          position="center"
        />
        <Toast
          ref={(toast) => {
            toastError = toast;
          }}
          style={{ backgroundColor: Colors.errorBackground }}
          positionValue={210}
        />
        {this.state.toggleShowPIN ? (
          <BlurView
            tint="dark"
            intensity={50}
            style={{
              position: 'absolute',
              justifyContent: 'center',
              alignItems: 'center',
              top: 0,
              left: 0,
              width: width,
              height: height,
            }}>
            <KeyboardAvoidingView
              behavior={'position'}
              contentContainerStyle={{
                height: height / 2 + 35,
              }}>
              <View style={{ backgroundColor: '#FFFFFF', padding: 20 }}>
                <Text
                  style={{
                    fontSize: 20,
                    textAlign: 'center',
                    color: Colors.gray,
                    marginBottom: 5,
                  }}>
                  {this.state.confirmPin
                    ? i18n.t('settingsScreen.confirmPin')
                    : this.props.pinCode.enabled
                    ? i18n.t('settingsScreen.enterPin')
                    : i18n.t('settingsScreen.setPin')}
                </Text>
                {this.state.incorrectPin ? (
                  <Text
                    style={{
                      color: Colors.errorBackground,
                      textAlign: 'center',
                      fontSize: 14,
                      marginBottom: 5,
                    }}>
                    {i18n.t('settingsScreen.incorrectPin')}
                  </Text>
                ) : null}
                <SmoothPinCodeInput
                  password
                  mask="﹡"
                  cellSize={42}
                  codeLength={6}
                  ref={this.pinInput}
                  value={this.state.pin}
                  onTextChange={(pin) => {
                    this.setState({
                      pin,
                      incorrectPin: this.state.incorrectPin ? false : undefined,
                    });
                  }}
                  onFulfill={(pin) => {
                    if (!this.props.pinCode.value) {
                      //New code
                      if (this.state.confirmPin) {
                        if (this.state.confirmPinValue === pin) {
                          // PIN Confirmation success
                          this.setState(
                            {
                              confirmPin: false,
                              confirmPinValue: '',
                            },
                            () => {
                              this.savePINCode(pin);
                              this.showToast(i18n.t('settingsScreen.savedPinCode'));
                              this.toggleShowPIN();
                            },
                          );
                        } else {
                          // Error on confirm PIN
                          this.setState({
                            incorrectPin: true,
                            pin: '',
                          });
                        }
                      } else {
                        // Enable PIN confirmation
                        this.setState({
                          confirmPin: true,
                          confirmPinValue: pin,
                          pin: '',
                        });
                      }
                    } else if (pin === this.props.pinCode.value) {
                      // Remove PIN
                      this.removePINCode();
                      this.showToast(i18n.t('settingsScreen.removedPinCode'));
                      this.toggleShowPIN();
                    } else {
                      // Error on set PIN
                      this.setState({
                        incorrectPin: true,
                        pin: '',
                      });
                    }
                  }}
                  autoFocus={true}
                />
                <NbButton
                  block
                  style={[
                    styles.backgroundColor,
                    {
                      borderRadius: 5,
                      width: 150,
                      alignSelf: 'center',
                      marginTop: 20,
                    },
                  ]}
                  onPress={this.toggleShowPIN}>
                  <Text style={{ color: '#FFFFFF' }}>{i18n.t('settingsScreen.close')}</Text>
                </NbButton>
              </View>
            </KeyboardAvoidingView>
          </BlurView>
        ) : null}
        {this.state.toggleRestartDialog ? (
          <BlurView
            tint="dark"
            intensity={50}
            style={[
              styles.dialogBackground,
              {
                width: width,
                height: height,
              },
            ]}>
            <View style={styles.dialogBox}>
              <Text style={styles.dialogContent}>{i18n.t('appRestart.message')}</Text>
              <Text style={styles.dialogContent}>
                {i18n.t('appRestart.selectedLanguage') +
                  ': ' +
                  locales.find((item) => item.code === this.props.i18n.locale).name}
              </Text>
              {this.state.selectedNewRTLDirection ? (
                <Text style={styles.dialogContent}>
                  {i18n.t('appRestart.textDirection') +
                    ': ' +
                    (this.props.i18n.isRTL ? 'RTL' : 'LTR')}
                </Text>
              ) : null}
              <Row style={{ height: 60 }}>
                <NbButton
                  block
                  style={[
                    styles.dialogButton,
                    {
                      backgroundColor: '#ffffff',
                      width: 120,
                      marginLeft: 'auto',
                      marginRight: 'auto',
                    },
                  ]}
                  onPress={this.cancelSetLanguage}>
                  <Text style={styles.textColor}>{i18n.t('global.cancel')}</Text>
                </NbButton>
                <NbButton
                  block
                  style={[
                    styles.dialogButton,
                    { width: 120, marginLeft: 'auto', marginRight: 'auto' },
                  ]}
                  onPress={this.restartApp}>
                  <Text style={{ color: '#FFFFFF' }}>{i18n.t('appRestart.button')}</Text>
                </NbButton>
              </Row>
            </View>
          </BlurView>
        ) : null}
      </Container>
    );
  }
}

SettingsScreen.propTypes = propTypes;
SettingsScreen.defaultProps = {
  userReducerError: null,
};
const mapStateToProps = (state) => ({
  i18n: state.i18nReducer,
  isConnected: state.networkConnectivityReducer.isConnected,
  userData: state.userReducer.userData,
  rememberPassword: state.userReducer.rememberPassword,
  pinCode: state.userReducer.pinCode,
  userReducerError: state.userReducer.error,
  networkStatus: state.networkConnectivityReducer.networkStatus,
  siteSettings: state.publicReducer.settings,
});
const mapDispatchToProps = (dispatch) => ({
  toggleNetworkConnectivity: (isConnected) => {
    dispatch(toggleNetworkConnectivity(isConnected));
  },
  setLanguage: (locale, isRTL) => {
    dispatch(setLanguage(locale, isRTL));
  },
  logout: () => {
    dispatch(logout());
  },
  toggleRememberPassword: () => {
    dispatch(toggleRememberPassword());
  },
  savePINCode: (value) => {
    dispatch(savePINCode(value));
  },
  removePINCode: () => {
    dispatch(removePINCode());
  },
  updateUserInfo: (domain, token, userInfo) => {
    dispatch(updateUserInfo(domain, token, userInfo));
  },
  cancelSetLanguage: () => {
    dispatch(cancelSetLanguage());
  },
  setCancelFalse: () => {
    dispatch(setCancelFalse());
  },
});
export default connect(mapStateToProps, mapDispatchToProps)(SettingsScreen);
