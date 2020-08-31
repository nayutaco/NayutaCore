# NayutaCore

App is a standard react native app with several native libraries and executables

LND is compiled to mobile using the ```make android``` command
However it is required to change in mobile/bindings.go the function

```
cfg := lnd.ListenerCfg{
		WalletUnlocker: &lnd.ListenerWithSignal{
			Listener: walletUnlockerLis,
			Ready:    unlockerListening,
		},
        RPCListener: &lnd.ListenerWithSignal{
			Listener: lightningLis,
			Ready:    rpcListening,
		},
```

to


```
cfg := lnd.ListenerCfg{
		WalletUnlocker: &lnd.ListenerWithSignal{
			Listener: walletUnlockerLis,
			Ready:    unlockerListening,
		}, 
```
As we do not user the RPC listener, we connect over REST api to the rest port

current LND commit is https://github.com/lightningnetwork/lnd/commit/e4764a67cc415627e9196265f5c5bfe8ea5d388a

bitcoind and tor are built for android architectures and included in the repo

https://github.com/mandelmonkey/AndroidCore

When building for release the tor and bitcoin executables placed in /android/app/src/main/resources may not be copied over, not sure why so I found it was required to place libtor.so and libbitcoind.so in /android/app/build/intermediates/sourceFolderJavaResources/release