// AndroidCoreWrapper.java

package com.nayutabox;

import android.content.Context;
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
import com.indiesquare.androidcrypto.AndroidCrypto;
import com.mandelduck.lndmobilewrapper.*;
import com.mandelduck.androidcore.*;

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
  public void callRPCCommand(String command) {
    Log.d("calling rpc","calling rpc "+command);
    com.mandelduck.androidcore.MainController.callRPC(command);

  }
}