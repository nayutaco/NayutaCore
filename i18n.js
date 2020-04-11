import I18n from 'react-native-i18n';
import en from './translations/en.js' 

I18n.defaultLocale = "en-US";
I18n.fallbacks = true;
I18n.locale = I18n.currentLocale();
I18n.translations = {
  en
};

export default I18n;