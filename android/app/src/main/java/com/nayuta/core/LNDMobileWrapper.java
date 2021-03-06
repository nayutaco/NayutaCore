package com.nayuta.core;
import android.net.Uri;
import android.content.Intent;
import android.content.Context;
import android.util.Base64;
import com.android.volley.AuthFailureError;
import com.android.volley.Cache;
import com.android.volley.DefaultRetryPolicy;
import com.android.volley.Network;
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.BasicNetwork;
import com.android.volley.toolbox.DiskBasedCache;
import com.android.volley.toolbox.HurlStack;
import com.android.volley.toolbox.JsonObjectRequest;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.protobuf.ByteString;

import java.io.BufferedInputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.io.UnsupportedEncodingException;
import java.math.BigInteger;
import java.nio.file.Files;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.nio.file.Paths;
import java.security.KeyManagementException;
import java.security.KeyStore;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.cert.Certificate;
import java.security.cert.CertificateException;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;

import android.util.Log;

import androidx.annotation.Nullable;
import androidx.core.content.FileProvider;

import com.jakewharton.processphoenix.ProcessPhoenix;

import org.json.JSONObject;

import lndmobile.Lndmobile;

import lndmobile.Callback;
import lnrpc.Rpc.*;

import com.google.gson.*;

import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLSocketFactory;
import javax.net.ssl.TrustManagerFactory;

import static io.invertase.firebase.common.SharedUtils.sendEvent;


public class LNDMobileWrapper extends ReactContextBaseJavaModule {

    private static final String respB64DataKey = "data";
    private static ReactApplicationContext reactContext;
    String _macaroon;
    String _network;
    RequestQueue requestQueue;
    String TAG = "lndMobileWrapper";


    LNDMobileWrapper(ReactApplicationContext context) {
        super(context);
        reactContext = context;

        Cache cache = new DiskBasedCache(reactContext.getCacheDir(), 1024 * 1024); // 1MB cap

        Network network = new BasicNetwork(new HurlStack());

        requestQueue = new RequestQueue(cache, network);

        requestQueue.start();

    }

    private static void saveConfig(Context context, String config, File appDir) {

        String filename = "lnd.conf";
        FileOutputStream outputStream;

        try {
            outputStream = context.openFileOutput(filename, Context.MODE_PRIVATE);
            outputStream.write(config.getBytes());
            outputStream.close();
        } catch (Exception e) {
            e.printStackTrace();
        }

    }

    private static void moveFile(Context context, String inputPath, String outputPath, String directory) {

        InputStream in = null;
        OutputStream out = null;
        try {
            Log.d("filemove", "moving file " + inputPath);
            //create output directory if it doesn't exist
            File dir = new File(outputPath + "/" + directory);
            if (!dir.exists()) {

                dir.mkdirs();

            }
            File file = new File(outputPath + "/" + inputPath);
            if (!file.exists()) {

                in = context.getAssets().open(inputPath);
                out = new FileOutputStream(outputPath + "/" + inputPath);
                byte[] buffer = new byte[1024];
                int read;
                while ((read = in.read(buffer)) != -1) {
                    out.write(buffer, 0, read);
                }
                in.close();
                in = null;
                // write the output file
                out.flush();
                out.close();
                out = null;
                Log.d("filemove", "moved file " + inputPath);
                // delete the original file
                new File(inputPath).delete();
            }


        } catch (FileNotFoundException fnfe1) {
            Log.e("LND FILE NOT FOUND", fnfe1.getMessage());
        } catch (Exception e) {
            Log.e("tag", e.getMessage());
        }

    }

    public static String convertStreamToString(InputStream is) throws Exception {
        BufferedReader reader = new BufferedReader(new InputStreamReader(is));
        StringBuilder sb = new StringBuilder();
        String line = null;
        while ((line = reader.readLine()) != null) {
            sb.append(line).append("\n");
        }
        reader.close();
        return sb.toString();
    }

    public static String getStringFromFile(String filePath) throws Exception {
        File fl = new File(filePath);
        FileInputStream fin = new FileInputStream(fl);
        String ret = convertStreamToString(fin);
        //Make sure you close all streams.
        fin.close();
        return ret;
    }

    private static String bytesToBase64String(byte[] fileData){
        return android.util.Base64.encodeToString(fileData, Base64.DEFAULT);
    }

    private static byte[] stringToBase64Bytes(String str){
        return android.util.Base64.decode(str, Base64.DEFAULT);
    }
    public static String  encodeFileToBase64( File file ) {
        String base64File = "";



        try (FileInputStream imageInFile = new FileInputStream(file)) {
            // Reading a file from file system
            byte fileData[] = new byte[(int) file.length()];
            imageInFile.read(fileData);
            base64File = bytesToBase64String(fileData);

        } catch (FileNotFoundException e) {
            System.out.println("File not found" + e);
        } catch (IOException ioe) {
            System.out.println("Exception while reading the file " + ioe);
        }
        return base64File;
    }


    public SSLSocketFactory getSocketFactory(Context context)
            throws CertificateException, IOException, KeyStoreException, NoSuchAlgorithmException, KeyManagementException {

        // Load CAs from an InputStream (could be from a resource or ByteArrayInputStream or ...)
        CertificateFactory cf = CertificateFactory.getInstance("X.509");
        String path = context.getFilesDir() + "/tls.cert";

        File file = new File(path);
        FileInputStream fis = null;

        fis = new FileInputStream(file);

        InputStream caInput = new BufferedInputStream(fis);
        // I paste my myFile.crt in raw folder under res.
        Certificate ca;

        //noinspection TryFinallyCanBeTryWithResources
        try {
            ca = cf.generateCertificate(caInput);
            System.out.println("ca=" + ((X509Certificate) ca).getSubjectDN());
        } finally {
            caInput.close();
        }

        // Create a KeyStore containing our trusted CAs
        String keyStoreType = KeyStore.getDefaultType();
        KeyStore keyStore = KeyStore.getInstance(keyStoreType);
        keyStore.load(null, null);
        keyStore.setCertificateEntry("ca", ca);

        // Create a TrustManager that trusts the CAs in our KeyStore
        String tmfAlgorithm = TrustManagerFactory.getDefaultAlgorithm();
        TrustManagerFactory tmf = TrustManagerFactory.getInstance(tmfAlgorithm);
        tmf.init(keyStore);

        // Create an SSLContext that uses our TrustManager
        SSLContext sslContext = SSLContext.getInstance("TLS");
        sslContext.init(null, tmf.getTrustManagers(), null);

        return sslContext.getSocketFactory();
    }

    @Override
    public String getName() {
        return "LNDMobileWrapper";
    }

    @ReactMethod
    public void setUp(String network, final Promise promise) {

        _network = network;
        promise.resolve("Set up");

    }

    @ReactMethod
    public void checkIfWalletExists(String network, final Promise promise) {



        String path = reactContext.getFilesDir() + "/data/chain/bitcoin/" + network + "/wallet.db";
        JSONObject json = new JSONObject();
        File f = new File(path);
        try {
            if (f.exists() && !f.isDirectory()) {

                json.put("exists", true);


            } else {
                json.put("exists", false);

            }

            promise.resolve(json.toString());

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @ReactMethod
    public void readMacaroon(String network, com.facebook.react.bridge.Callback callback) {
        JSONObject json = new JSONObject();
        try {


            _macaroon = getMacaroon(network, "hex");


            try {
                json.put("macaroon", _macaroon);


                callback.invoke(json.toString());

            } catch (Exception e) {

                e.printStackTrace();
            }
        }catch(Exception e){
            e.printStackTrace();
            try {
                json.put("error", e.getLocalizedMessage());


                callback.invoke(json.toString());

            } catch (Exception e2) {

                e.printStackTrace();
            }
        }
    }


    @ReactMethod
    public void getLNDConnectURI(String network, com.facebook.react.bridge.Callback callback) {


        String macaroon = getMacaroon(network, "base64").replaceAll("\n", "").replaceAll("\r", "");

        String path = reactContext.getFilesDir() + "/tls.cert";


        try {



            String contents = getStringFromFile(path);


            contents = contents.replace("-----BEGIN CERTIFICATE-----", "").replace("-----END CERTIFICATE-----", "").replaceAll("\n", "").replaceAll("\r", "");
            Log.i(TAG, "uri contents " + contents);





            byte[] strBytes = android.util.Base64.decode(contents, Base64.DEFAULT);
            byte[] encoded = android.util.Base64.encode(
                    strBytes, Base64.URL_SAFE | Base64.NO_PADDING |  Base64.NO_WRAP);
            String cert = new String(encoded);


            Log.i(TAG, "cert contents " + cert);

            Log.i(TAG, "macc " + macaroon);

            path = reactContext.getNoBackupFilesDir() + "/tordata/hostname";


            String onionAddress =  getStringFromFile(path);


            onionAddress = onionAddress.replaceAll("\n", "").replaceAll("\r", "");
            Log.i(TAG, "onions address " + onionAddress);
            String uri = "lndconnect://" + onionAddress + ":8080?cert=" + cert + "&macaroon=" + macaroon;
            Log.i(TAG, "uri is " + uri);


            JSONObject json = new JSONObject();

            try {
                json.put("uri", uri);


                callback.invoke(json.toString());

            } catch (Exception e) {
                e.printStackTrace();
            }

        } catch (Exception e) {


        }


    }

    byte[] decodeBase64String(String str){



        return android.util.Base64.decode(str,Base64.DEFAULT | Base64.NO_PADDING |  Base64.NO_WRAP);
    }
    String getMacaroon(String network, String format) {

        String path = reactContext.getFilesDir() + "/data/chain/bitcoin/" + network + "/admin.macaroon";


        File f = new File(path);

        if(f.exists() == false){
            Log.i(TAG, "macaroon does not exist ");


            return "";
        }
        String macaroon = encodeFileToBase64(f);


        Log.i(TAG, "macaroon is "+macaroon);
        if (format.equals("hex")) {


            byte[] decoded = decodeBase64String(macaroon);
            String hexMac =  "0" + String.format("%05X", new BigInteger(1, decoded));

            Log.i(TAG, "hex macaroon is "+macaroon);
            return hexMac;
        } else {

            Log.i(TAG, "base64 macaroon is "+macaroon);

            return macaroon;
        }


    }

    String getCert(String format) {

        String path = reactContext.getFilesDir() + "/tls.cert";

        File f = new File(path);
        try {
            String cert = encodeFileToBase64(f);
            Log.i(TAG, cert);
            if (format.equals("hex")) {
                byte[] decoded = android.util.Base64.decode(cert,Base64.DEFAULT);
                return "0" + String.format("%050X", new BigInteger(1, decoded));
            } else {
                return cert;
            }

        } catch (Exception e) {
            e.printStackTrace();
            return "";
        }

    }

    @ReactMethod
    public void restartApp() {

        ProcessPhoenix.triggerRebirth(reactContext);

    }

    @ReactMethod
    public void stopLND() {

        Log.i(TAG, "stop lnd");
        Log.d(TAG, "stop lnd");
        class RPCCallback implements Callback {
            @Override
            public void onError(Exception e) {
                Log.i(TAG, "stop lnd err");
                Log.d(TAG, "top lnd err");
            }

            @Override
            public void onResponse(byte[] bytes) {
                Log.i(TAG, "stop lnd res");
                Log.d(TAG, "stop lnd res");

            }
        }

        byte[] bytes = StopRequest.getDefaultInstance().toByteArray();
       Lndmobile.stopDaemon(bytes, new RPCCallback());


    }

    @ReactMethod
    public void makeHttpRequest(String url, final Promise promise) {

        Runnable makeHttpRequest = new Runnable() {
            @Override
            public void run() {


                if (_macaroon == null || _macaroon.length() == 0) {
                        try {
                            _macaroon = getMacaroon(_network, "hex");

                            if(_macaroon.length() == 0){


                                try {
                                    JSONObject json = new JSONObject();
                                    json.put("error", "macaroon does not exist");

                                    promise.resolve(json.toString());
                                } catch (Exception e2) {
                                    promise.resolve("");
                                }
                            }
                            new java.util.Timer().schedule(
                                    new java.util.TimerTask() {
                                        @Override
                                        public void run() {
                                            makeHttpRequest(url, promise);
                                        }
                                    },
                                    1000
                            );
                        }catch(Exception e){
                            e.printStackTrace();
                            //promise.resolve();

                            try {
                                JSONObject json = new JSONObject();
                                json.put("error", e.getLocalizedMessage());

                                promise.resolve(json.toString());
                            } catch (Exception e2) {
                                promise.resolve("");
                            }
                        }

                    return;
                }

                try {

                    HttpsURLConnection.setDefaultSSLSocketFactory(getSocketFactory(reactContext));
                    JsonObjectRequest jsonObjReq = new JsonObjectRequest(Request.Method.GET,
                            url, null,

                            new Response.Listener<JSONObject>() {
                                @Override
                                public void onResponse(JSONObject response) {
                                    //Success Callback
                                    Log.i(TAG, response.toString());
                                    promise.resolve(response.toString());
                                }
                            },
                            new Response.ErrorListener() {
                                @Override
                                public void onErrorResponse(VolleyError error) {
                                    //Failure Callback
                                    if (error == null || error.networkResponse == null) {
                                        promise.resolve("[{\"error\":\"error\"}]");
                                        return;
                                    }

                                    String body;
                                    //get status code here
                                    final String statusCode = String.valueOf(error.networkResponse.statusCode);
                                    //get response body and parse with appropriate encoding
                                    try {
                                        body = new String(error.networkResponse.data, "UTF-8");
                                        Log.i(TAG, "{error:" + body + "}");
                                        promise.resolve("{error:" + body + "}");
                                        error.printStackTrace();
                                    } catch (UnsupportedEncodingException e) {
                                        e.printStackTrace();
                                    }


                                }
                            }) {
                        /**
                         * Passing some request headers*
                         */
                        @Override
                        public Map getHeaders() throws AuthFailureError {
                            HashMap headers = new HashMap();
                            headers.put("Content-Type", "application/json");
                            Log.i(TAG, "maccy is  " + _macaroon);
                            headers.put("Grpc-Metadata-macaroon", _macaroon);
                            return headers;
                        }
                    };

                    jsonObjReq.setRetryPolicy(new DefaultRetryPolicy(
                            20000,
                            DefaultRetryPolicy.DEFAULT_MAX_RETRIES,
                            DefaultRetryPolicy.DEFAULT_BACKOFF_MULT));

                    requestQueue.add(jsonObjReq);
                } catch (Exception e) {

                    Log.i("network", "cert error");
                    e.printStackTrace();
                }
            }
        };
        new Thread(makeHttpRequest).start();

    }
    private void sendEventToReactFromAndroid(ReactContext reactContext, String eventName, @Nullable WritableMap params) {
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, params);
    }
    @ReactMethod
    public void startLND(String startArgs, String config, boolean bootstrap) {


        final File appDir =reactContext.getFilesDir();

        saveConfig(reactContext, config, appDir);
        boolean testnet = config.contains("testnet=1");

        if (bootstrap) {

            String neutrinoDB = "mainnet/neutrino.db";
            String blockheadersBin = "mainnet/block_headers.bin";
            String regFilterHeadersBin = "mainnet/reg_filter_headers.bin";
            String directory = "mainnet";

            if (testnet) {
                Log.d("LNDWRAPPER", "starting testnet");
                neutrinoDB = "testnet/neutrino.db";
                blockheadersBin = "testnet/block_headers.bin";
                regFilterHeadersBin = "testnet/reg_filter_headers.bin";
                directory = "testnet";
            } else {
                Log.i(TAG, "starting mainnet");
            }

            String outputPath = appDir + "/data/chain/bitcoin";

            moveFile(reactContext, neutrinoDB, outputPath, directory);
            moveFile(reactContext, blockheadersBin, outputPath, directory);
            moveFile(reactContext, regFilterHeadersBin, outputPath, directory);
        }

        Log.i(TAG, "start lnd");
        Log.d(TAG, "start lnd");
        String args = startArgs + "--lnddir=" + appDir;
        Log.i(TAG, args);
        class UnlockCallback implements Callback {
            @Override
            public void onError(Exception e) {
                Log.i(TAG, "unlock err1");
                Log.d(TAG, "unlock err2");
            }

            @Override
            public void onResponse(byte[] bytes) {
                Log.i(TAG, "unlock started1");
                Log.d(TAG, "unlock started2");
                sendEvent(reactContext, "Unlocked", null);
            }
        }


        class RPCCallback implements Callback {
            @Override
            public void onError(Exception e) {
                Log.i(TAG, "rpc callback error1");
                Log.d(TAG, "rpc callback error2");
            }

            @Override
            public void onResponse(byte[] bytes) {
                Log.i(TAG, "rpc callback  started1");
                Log.d(TAG, "rpc callback  started2");
                sendEvent(reactContext, "RPCReady", null);
            }
        }


                android.os.Process.setThreadPriority(android.os.Process.THREAD_PRIORITY_BACKGROUND);

                Lndmobile.start(args, new UnlockCallback(), new RPCCallback());



    }

    @ReactMethod
    public void generateSeed(final Promise promise) {
        try {

            byte[] bytes = GenSeedRequest.getDefaultInstance().toByteArray();

            Lndmobile.genSeed(bytes, new lndmobile.Callback() {
                @Override
                public void onError(Exception e) {
                    try {
                        JSONObject json = new JSONObject();
                        json.put("error", e.getLocalizedMessage());

                        promise.resolve(json.toString());
                    } catch (Exception e2) {
                        promise.resolve("");
                    }
                }

                @Override
                public void onResponse(byte[] bytes) {

                    try {

                        if (bytes != null && bytes.length > 0) {

                            GenSeedResponse response = GenSeedResponse.parseFrom(bytes);
                            Gson gson = new Gson();
                            String json = gson.toJson(response);

                            promise.resolve(json);
                        }
                    } catch (Exception e) {
                        try {
                            JSONObject json = new JSONObject();
                            json.put("error", e.getLocalizedMessage());

                            promise.resolve(json.toString());
                        } catch (Exception e2) {
                            promise.resolve("");
                        }
                    }


                }
            });
        } catch (Exception e) {
            e.printStackTrace();
        }

    }

    @ReactMethod
    public void initWallet(String passphrase, String password, int recoveryWindow, String channelBackup, final Promise promise) {
        try {
            Log.i(TAG, "init1");
            InitWalletRequest.Builder req = InitWalletRequest.newBuilder();

            String[] passphraseArray = passphrase.split(" ");


            for (int i = 0; i < passphraseArray.length; i++) {

                req.addCipherSeedMnemonic(passphraseArray[i]);

            }

            ByteString passwordBS = ByteString.copyFrom(password, "UTF-8");
            Log.i(TAG, "init2");

            req.setWalletPassword(passwordBS);
            if (recoveryWindow != -1) {
                System.out.println("recovery window " + recoveryWindow);
                req.setRecoveryWindow(recoveryWindow);
            }

            if (channelBackup != "") {
                ChanBackupSnapshot.Builder snapShotBuilder = ChanBackupSnapshot.newBuilder();
                MultiChanBackup.Builder multiChanBuilder = MultiChanBackup.newBuilder();
                multiChanBuilder.setMultiChanBackup(ByteString.copyFrom(Base64.decode(channelBackup, Base64.DEFAULT)));
                snapShotBuilder.setMultiChanBackup(multiChanBuilder.build());
                req.setChannelBackups(snapShotBuilder.build());

            }

            byte[] reqBytes = req.build().toByteArray();
            Log.i(TAG, "init3");
            Lndmobile.initWallet(reqBytes, new lndmobile.Callback() {
                @Override
                public void onError(Exception e) {
                    try {
                        Log.i(TAG, "init4");
                        JSONObject json = new JSONObject();
                        json.put("error", e.getLocalizedMessage());

                        promise.resolve(json.toString());
                    } catch (Exception e2) {
                        Log.i(TAG, "init5");
                        promise.resolve("");
                    }
                }

                @Override
                public void onResponse(byte[] bytes) {

                    try {
                        Log.i(TAG, "init6");
                        if (bytes != null && bytes.length > 0) {
                            Log.i(TAG, "init7");
                            GenSeedResponse response = GenSeedResponse.parseFrom(bytes);
                            Gson gson = new Gson();
                            String json = gson.toJson(response);
                            promise.resolve(json);
                            Log.i(TAG, "init8");
                        } else {
                            Log.i(TAG, "init7");

                            promise.resolve("");
                        }


                    } catch (Exception e) {
                        Log.i(TAG, "init9");
                        try {
                            JSONObject json = new JSONObject();
                            json.put("error", e.getLocalizedMessage());
                            Log.i(TAG, "init10");
                            promise.resolve(json.toString());
                        } catch (Exception e2) {
                            Log.i(TAG, "init11");
                            promise.resolve("");
                        }
                    }

                }
            });


        } catch (Exception e) {
            Log.i(TAG, "init12");
            e.printStackTrace();
        }

    }

    @ReactMethod
    public void unlockWallet(String password, int recoveryWindow, final Promise promise) {
        try {

            UnlockWalletRequest.Builder req = UnlockWalletRequest.newBuilder();
            ByteString passwordBS = ByteString.copyFromUtf8(password);

            req.setWalletPassword(passwordBS);
            if (recoveryWindow != -1) {
                req.setRecoveryWindow(recoveryWindow);
            }


            byte[] reqBytes = req.build().toByteArray();

            Lndmobile.unlockWallet(reqBytes, new NativeCallback(promise));


        } catch (Exception e) {
            e.printStackTrace();
        }

    }

    @ReactMethod
    public void getInfo(com.facebook.react.bridge.Callback callback) {
        try {
            byte[] request = GetInfoRequest.getDefaultInstance().toByteArray();

            Lndmobile.getInfo(request, new lndmobile.Callback() {
                @Override
                public void onError(Exception e) {
                    try {
                        JSONObject json = new JSONObject();
                        json.put("error", e.getLocalizedMessage());

                        callback.invoke(json.toString());
                    } catch (Exception e2) {
                        callback.invoke("");
                    }
                }

                @Override
                public void onResponse(byte[] bytes) {

                    try {

                        if (bytes != null && bytes.length > 0) {

                            GetInfoResponse response = GetInfoResponse.parseFrom(bytes);
                            Gson gson = new Gson();
                            String json = gson.toJson(response);

                            callback.invoke(json);
                        }
                    } catch (Exception e) {
                        try {
                            JSONObject json = new JSONObject();
                            json.put("error", e.getLocalizedMessage());

                            callback.invoke(json.toString());
                        } catch (Exception e2) {
                            callback.invoke("");
                        }
                    }


                }
            });


        } catch (Exception e) {
            e.printStackTrace();
        }

    }

    class NativeCallback implements Callback {
        Promise promise;

        NativeCallback(Promise promise) {
            this.promise = promise;
        }

        @Override
        public void onError(Exception e) {
            promise.reject("LndNativeModule", e);
        }

        @Override
        public void onResponse(byte[] bytes) {
            String b64 = "";
            if (bytes != null && bytes.length > 0) {
                b64 = Base64.encodeToString(bytes, Base64.NO_WRAP);
            }

            WritableMap params = Arguments.createMap();
            params.putString(respB64DataKey, b64);

            promise.resolve(params);
        }
    }


    private void writeToFile(String data,String name,Context context) {
        try {
            OutputStreamWriter outputStreamWriter = new OutputStreamWriter(context.openFileOutput(name, Context.MODE_PRIVATE));
            outputStreamWriter.write(data);
            outputStreamWriter.close();
        }
        catch (IOException e) {
            Log.e("Exception", "File write failed: " + e.toString());
        }
    }

    @ReactMethod
    public void ExportLogs(String network, String LNDInfo) {

        final File appDir =reactContext.getFilesDir();


        final File appDirNoBackUp =reactContext.getNoBackupFilesDir();



        String outputPath = appDir + "/logs/bitcoin/"+network;

           String filename = "lnd.log";




        File filelocation = new File(outputPath, filename);

        if(filelocation.exists() == false){
            Log.i(TAG,"no exist");
        }else{
            Log.i(TAG,"exist");
        }
      //  Uri path = Uri.fromFile(filelocation);

        Uri path = FileProvider.getUriForFile(reactContext,"com.nayuta.core.file.provider",filelocation);



        String outputPath2 = appDirNoBackUp + "/bitcoinDirec";
        String filename2 = "debug.log";

    try {

        String str = getStringFromFile(outputPath2+"/"+filename2);

        writeToFile(str,"debug.log",reactContext);
    }
    catch (Exception e){
        Log.e(TAG,"Error");
        e.printStackTrace();
    }

        String outputPath3 = appDir+"";

        File filelocation2 = new File(outputPath3, filename2);

        Uri path2 = FileProvider.getUriForFile(reactContext,"com.nayuta.core.file.provider",filelocation2);

        Intent emailIntent = new Intent(Intent.ACTION_SEND_MULTIPLE);
// set the type to 'email'
        emailIntent.setType("vnd.android.cursor.dir/email");
        String to[] = {};



        ArrayList<Uri> paths  = new ArrayList<Uri>();

        paths .add(path);
        paths .add(path2);

        emailIntent.putExtra(Intent.EXTRA_EMAIL, to);
// the attachment

        emailIntent.putParcelableArrayListExtra(Intent.EXTRA_STREAM, paths);

        emailIntent.putExtra(Intent.EXTRA_SUBJECT, "Subject");

        emailIntent.putExtra(Intent.EXTRA_TEXT,LNDInfo);

        reactContext.getCurrentActivity().startActivity(Intent.createChooser(emailIntent, "Send email..."));

    }




}