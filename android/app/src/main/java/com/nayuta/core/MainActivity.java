package com.nayuta.core;

import com.facebook.react.ReactActivity;

public class MainActivity extends ReactActivity {
  public static final String NOTIFICATION_CHANNEL_ID = "10001" ;
  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "NayutaCore";
  }
}
