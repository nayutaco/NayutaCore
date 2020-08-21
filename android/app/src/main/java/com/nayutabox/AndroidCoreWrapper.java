// AndroidCoreWrapper.java

package com.nayutabox;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.net.Uri;
import android.os.Build;
import android.os.SystemClock;
import android.preference.PreferenceManager;
import android.widget.Toast;

import com.facebook.react.bridge.Promise;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.util.Map;
import java.util.HashMap;
import android.util.Log;
import android.app.Activity;

import androidx.core.app.NotificationCompat;

import com.indiesquare.androidcrypto.AndroidCrypto;
import com.mandelduck.lndmobilewrapper.*;
import com.mandelduck.androidcore.*;

import static com.nayutabox.MainActivity.NOTIFICATION_CHANNEL_ID;
import static com.swmansion.reanimated.MapUtils.getString;

public class AndroidCoreWrapper extends ReactContextBaseJavaModule {
  private static ReactApplicationContext reactContext;

  private static final String DURATION_SHORT_KEY = "SHORT";
  private static final String DURATION_LONG_KEY = "LONG";

  AndroidCoreWrapper(ReactApplicationContext context) {
    super(context);
    reactContext = context;
  }
  @Override
  public Map<String, Object> getConstants() {
    final Map<String, Object> constants = new HashMap<>();
    constants.put(DURATION_SHORT_KEY, Toast.LENGTH_SHORT);
    constants.put(DURATION_LONG_KEY, Toast.LENGTH_LONG);
    return constants;
  }
  @Override
  public String getName() {
    return "AndroidCoreWrapper";
  }

  @ReactMethod
  public void checkIfDownloaded(Callback callback) {

    Log.d("event fired",MainController.checkIfDownloaded()+"sd");

    callback.invoke(MainController.checkIfDownloaded());


  }

  @ReactMethod
  public void startTorHiddenService() {

    Log.i("android core","start tor hidden service");
    MainController.startTorHiddenService(reactContext);


  }

  @ReactMethod
  public void localNotification(String title,String content){
/*
    Intent intent = new Intent(reactContext, NotificationPub.class);
    intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
    PendingIntent pendingIntent = PendingIntent.getActivity(reactContext, 0, intent, PendingIntent.FLAG_ONE_SHOT);



    Uri soundUri = Uri.parse("android.resource://" + reactContext.getPackageName() + "/" + R.raw.beep);
    NotificationCompat.Builder notificationBuilder = new NotificationCompat.Builder(reactContext, NOTIFICATION_CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(title)
            .setContentText(content)
            .setAutoCancel(true)
            .setSound(soundUri)
            .setContentIntent(pendingIntent);

    NotificationManager mNotificationManager = (NotificationManager) reactContext.getSystemService(Context.NOTIFICATION_SERVICE);
    if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {

      if(soundUri != null){
        // Changing Default mode of notification
        notificationBuilder.setDefaults(Notification.DEFAULT_VIBRATE);
        // Creating an Audio Attribute
        AudioAttributes audioAttributes = new AudioAttributes.Builder()
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .setUsage(AudioAttributes.USAGE_ALARM)
                .build();

        // Creating Channel
        NotificationChannel notificationChannel = new NotificationChannel(NOTIFICATION_CHANNEL_ID,"Testing_Audio",NotificationManager.IMPORTANCE_HIGH);
        notificationChannel.setSound(soundUri,audioAttributes);
        mNotificationManager.createNotificationChannel(notificationChannel);
        Log.e("ABCORE","Created Notification Channel");
      }
    }
    mNotificationManager.notify(0, notificationBuilder.build());

*/

  }

  @ReactMethod
  public void setUp(String config) {



    Log.d("event fired","setup");
    com.mandelduck.androidcore.CallbackInterface myCallback = new com.mandelduck.androidcore.CallbackInterface() {
      @Override
      public void eventFired(String event) {
        Log.d("event fired",event);

        WritableMap payload = Arguments.createMap();
        // Put data to map
        payload.putString("data", event);

        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("event", payload);
      }
    };

    MainController.setUp(reactContext,config,reactContext.getCurrentActivity(),myCallback);


  }

  @ReactMethod
  public void checkIfServiceIsRunning(String serviceName,final Promise promise) {

    promise.resolve(com.mandelduck.androidcore.MainController.checkIfServiceIsRunning(serviceName));

  }

  @ReactMethod
  public void cancelForeground() {

    com.mandelduck.androidcore.MainController.cancelForeground();

  }

  @ReactMethod
  public void startWifiCheck() {

    com.mandelduck.androidcore.MainController.StartWifiCheck();

  }

  @ReactMethod
  public void cancelJob() {

    com.mandelduck.androidcore.MainController.cancelJob();

  }
  @ReactMethod
  public void stopCore() {

    com.mandelduck.androidcore.MainController.stopCore();

  }
  @ReactMethod
  public void registerBackgroundSync(boolean limited) {

    com.mandelduck.androidcore.MainController.registerBackgroundSync(limited);

  }

  @ReactMethod
  public String getSavedBestBlockHashes() {
    SharedPreferences settings = PreferenceManager.getDefaultSharedPreferences(reactContext);

    if (settings != null) {
      return settings.getString("bestBlockHashesV1", "{}");

    }

    Log.i("best block","Sdsds2");
    return "";

  }


    @ReactMethod
  public void startDownload() {
    Log.d("ABCORE","starting download");
    com.mandelduck.androidcore.MainController.startDownload();

  }

  @ReactMethod
  public void startCore(boolean reindex) {
    Log.d("event fired","sd");
    com.mandelduck.androidcore.MainController.startCore(reindex);

  }

  @ReactMethod
  public void getBlockchainInfo() {
    com.mandelduck.androidcore.MainController.getBlockchainInfo();

  }
  @ReactMethod
  public void getBlockStats(int height) {
    Log.i("TAG","getting height "+height);
    com.mandelduck.androidcore.MainController.getBlockStats(height);

  }
  @ReactMethod
  public void stopTorHiddenService() {
    com.mandelduck.androidcore.MainController.stopTorHiddenService();

  }



  @ReactMethod
  public void callRPCCommand(String command) {
    Log.d("calling rpc","calling rpc "+command);
    com.mandelduck.androidcore.MainController.callRPC(command);

  }
}