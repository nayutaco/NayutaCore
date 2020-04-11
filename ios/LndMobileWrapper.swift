//
//  LndMobileWrapper.swift
//  lnGRPCWrapper
//
//  Created by Chris on 2019/01/22.
//  Copyright © 2019 IndieSquare. All rights reserved.
//


import UIKit
import Lndmobile
import os

extension Data {
    struct HexEncodingOptions: OptionSet {
        let rawValue: Int
        static let upperCase = HexEncodingOptions(rawValue: 1 << 0)
        static let littleEndian = HexEncodingOptions(rawValue: 1 << 1)  // Byte 0 at the right most in String
    }
    
    func hexEncodedString(options: HexEncodingOptions = []) -> String {
        let hexDigits = Array((options.contains(.upperCase) ? "0123456789ABCDEF" : "0123456789abcdef").utf16)
        var chars: [unichar] = []
        chars.reserveCapacity(2 * count)
        for byte in self {
            if options.contains(.littleEndian) {
                chars.insert(hexDigits[Int(byte % 16)], at: 0)
                chars.insert(hexDigits[Int(byte / 16)], at: 0)
            } else {
                chars.append(hexDigits[Int(byte / 16)])
                chars.append(hexDigits[Int(byte % 16)])
            }
        }
        return String(utf16CodeUnits: chars, count: chars.count)
    }
    
    init?(hexString: String) {
        let length = hexString.count
        guard length & 1 == 0 else { return nil }  // Must be even characters
        
        var bytes = [UInt8]()
        bytes.reserveCapacity(length/2)
        
        var index = hexString.startIndex
        for _ in 0..<length/2 {
            let nextIndex = hexString.index(index, offsetBy: 2)
            guard let byte = UInt8(hexString[index..<nextIndex], radix: 16) else { return nil }
            bytes.append(byte)
            index = nextIndex
        }
        
        self.init(bytes: bytes)
    }
}

@objc(LndMobileWrapper)
class LndMobileWrapper: NSObject {
    
    @objc
         func sayHello(_ callback: RCTResponseSenderBlock) {
           callback(["hello"])
         }
    func getIPAddress()-> String? {
        
        let WIFI_IF : [String] = ["en0"]
        let KNOWN_WIRED_IFS : [String] = ["en2", "en3", "en4"]
        let KNOWN_CELL_IFS : [String] = ["pdp_ip0","pdp_ip1","pdp_ip2","pdp_ip3"]
        
        var addresses : [String : String] = ["wireless":"",
                                             "wired":"",
                                             "cell":""]
        
        var address: String?
        var ifaddr: UnsafeMutablePointer<ifaddrs>? = nil
        if getifaddrs(&ifaddr) == 0 {
            
            var ptr = ifaddr
            while ptr != nil {
                defer { ptr = ptr?.pointee.ifa_next } // memory has been renamed to pointee in swift 3 so changed memory to pointee
                
                let interface = ptr?.pointee
                let addrFamily = interface?.ifa_addr.pointee.sa_family
                if addrFamily == UInt8(AF_INET) || addrFamily == UInt8(AF_INET6) {
                    
                    if let name: String = String(cString: (interface?.ifa_name)!), (WIFI_IF.contains(name) || KNOWN_WIRED_IFS.contains(name) || KNOWN_CELL_IFS.contains(name)) {
                        
                        // String.fromCString() is deprecated in Swift 3. So use the following code inorder to get the exact IP Address.
                        var hostname = [CChar](repeating: 0, count: Int(NI_MAXHOST))
                        getnameinfo(interface?.ifa_addr, socklen_t((interface?.ifa_addr.pointee.sa_len)!), &hostname, socklen_t(hostname.count), nil, socklen_t(0), NI_NUMERICHOST)
                        address = String(cString: hostname)
                        if WIFI_IF.contains(name){
                            addresses["wireless"] =  address
                        }else if KNOWN_WIRED_IFS.contains(name){
                            addresses["wired"] =  address
                        }else if KNOWN_CELL_IFS.contains(name){
                            addresses["cell"] =  address
                        }
                    }
                    
                }
            }
        }
        freeifaddrs(ifaddr)
        
        var ipAddressString : String?
        let wirelessString = addresses["wireless"]
        let wiredString = addresses["wired"]
        let cellString = addresses["cell"]
        if let wirelessString = wirelessString, wirelessString.count > 0{
            ipAddressString = wirelessString
        }else if let wiredString = wiredString, wiredString.count > 0{
            ipAddressString = wiredString
        }else if let cellString = cellString, cellString.count > 0{
            ipAddressString = cellString
        }
        return ipAddressString
    }
    
    @objc
    public override init() {
        
        currentCallback = {(res, error) in}
    }
    
    @objc public func setLog(callback: @escaping (String?) -> Void) {
        
        LndMobileWrapper.currentLog = callback;
    }
    
    public var directoryPath: String = ""
    
    public var currentCallback:((String?,String?) -> (Void));
    
    public static var currentLog:((String?) -> (Void)) = {(log) in}
    
    private class LndStart: NSObject, LndmobileCallbackProtocol {
        private var completion: (() throws -> ()) -> Void
        init(_ completion: @escaping (() throws -> ()) -> Void) {
            self.completion = completion
        }
        
        func onResponse(_ p0: Data!) {
            print("LND Start Success!")
            
            
            completion({ return })
        }
        
        func onError(_ p0: Error!) {
            print("LND Start Failed - \(p0?.localizedDescription ?? "")")
            completion({ throw p0 })
        }
    }
    
    
    
    
    
    private func lndMobileCompletion(result: () throws -> String) {
        
        do {
            LndMobileWrapper.currentLog("lnd completion");
            let res = try result()
            
            
            currentCallback(res,nil);
            
            
            
        } catch {
            LndMobileWrapper.currentLog(error.localizedDescription);
            currentCallback(nil,error.localizedDescription);
        }
    }
   
    
    
    @objc public func sendCoins(amount:Int64, address:String, fee:Int64, callback: @escaping (String?,String?) -> Void) {
        do {
            
            var req = Lnrpc_SendCoinsRequest()
            
            if(amount == -1){
                req.sendAll = true;
            }else{
                req.amount = amount;
            }
            
            req.addr = address;
            
            if(fee != -1){
                req.satPerByte = fee;
            }
            
            
            
            let lndOp = SendCoins(callback)
            LndMobileWrapper.currentLog("send coins");
            
            LndmobileSendCoins(try req.serializedData(), lndOp);
            
            
            
        }
        catch{
            LndMobileWrapper.currentLog(error.localizedDescription);
            currentCallback(nil,error.localizedDescription);
        }
        
    }
    
    
    @objc public func estimateFee(amount:Int64, address:String, targetConf:Int32, callback: @escaping (String?,String?) -> Void) {
        do {
            
            var req = Lnrpc_EstimateFeeRequest()
            
            if(amount == -1){
                req.addrToAmount = [address:10000]; //if fee is -1 it means send all, so set fee to some value
            }else{
                req.addrToAmount = [address:amount];
            }
            
            req.targetConf = targetConf;
            
            
            let lndOp = EstimateFee(callback)
            
            LndMobileWrapper.currentLog("estimate fee");
            
            LndmobileEstimateFee(try req.serializedData(), lndOp);
            
        }
        catch{
            LndMobileWrapper.currentLog(error.localizedDescription);
            currentCallback(nil,error.localizedDescription);
        }
        
    }
   /* func sayHello(_ callback: RCTResponseSenderBlock) {
      callback(["hello"])
    }*/
    
    @objc public func startLND(_ callback: @escaping  RCTResponseSenderBlock) {
        
        
        
        LndMobileWrapper.currentLog("starting deamon");
        self.lndStart() { _ in
            
          callback(["lnd started",nil]);
            
        }
        
        
    }
    
    
    @objc public func stopLND(callback: @escaping (String?,String?) -> Void) {
        do {
            LndMobileWrapper.currentLog("stopping")
            let request = try Lnrpc_StopRequest().serializedData()
            
            let lndOp = StopDaemon(callback)
            LndmobileStopDaemon(request,  lndOp);
            LndMobileWrapper.currentLog("stopping end")
            
        } catch {
            callback(nil,error.localizedDescription);
        }
        
        
        
    }
    
    
    
    
    
    @objc public func generateSeed(callback: @escaping (String?,String?) -> Void) {
        
        do {
            
            LndMobileWrapper.currentLog("getting seed");
            let request = try Lnrpc_GenSeedRequest().serializedData()
            LndMobileWrapper.currentLog("getting seed res");
            let lndOp = GenerateSeed(callback)
            LndmobileGenSeed(request,  lndOp);
            
        } catch {
            callback(nil,error.localizedDescription);
        }
    }
    
    
    @objc public func getInfo(callback: @escaping (String?,String?) -> Void) {
        LndMobileWrapper.currentLog("getting info");
        do {
            let request = try Lnrpc_GetInfoRequest().serializedData()
            
            let lndOp = GetInfo(callback)
            
            LndmobileGetInfo(request, lndOp);
            
        } catch {
            callback(nil,error.localizedDescription);
        }
    }
    
    @objc public func exportAllChannelBackups(callback: @escaping (String?,String?) -> Void) {
        LndMobileWrapper.currentLog("exportAllChannelBackups");
        do {
            let request = try Lnrpc_ExportChannelBackupRequest().serializedData()
            
            let lndOp = ExportAllChannelBackups(callback)
            
            LndmobileExportAllChannelBackups(request, lndOp);
            
        } catch {
            callback(nil,error.localizedDescription);
        }
    }
    
    @objc public func getChannelBalance(callback: @escaping (String?,String?) -> Void) {
        
        do {
            let request = try Lnrpc_ChannelBalanceRequest().serializedData();
            
            let lndOp = ChannelBalance(callback)
            
            LndmobileChannelBalance(request, lndOp);
            
            
        } catch {
            callback(nil,error.localizedDescription);
        }
    }
    
    @objc public func getWalletBalance(callback: @escaping (String?,String?) -> Void) {
        
        do {
            let request = try Lnrpc_WalletBalanceRequest().serializedData();
            
            let lndOp = WalletBalance(callback)
            
            LndmobileWalletBalance(request, lndOp);
            
            
        } catch {
            callback(nil,error.localizedDescription);
        }
    }
    
    
    
    @objc public func createWallet(walletPassword: String, recoveryWindow:Int32,
                                   cipherSeedMnemonic: [String],channelBackup: String,
                                   callback: @escaping (String?,String?) -> Void) {
        
        currentCallback = callback;
        guard let passwordData = walletPassword.data(using: .utf8) else {
            
            callback(nil,"password error");
            return;
        }
        
        
        let lndOp = CreateWallet(callback)
        
        do {
            LndMobileWrapper.currentLog("LN Create Wallet Request")
            
            var request = Lnrpc_InitWalletRequest()
            request.cipherSeedMnemonic = cipherSeedMnemonic
            request.walletPassword = passwordData
            if(recoveryWindow != -1){
                LndMobileWrapper.currentLog("setting recovery mode")
                
                request.recoveryWindow = recoveryWindow
            }
            
            if(channelBackup != ""){
            
            LndMobileWrapper.currentLog("setting channel backup")
                
            var snapshot = Lnrpc_ChanBackupSnapshot.init()
            var multi = Lnrpc_MultiChanBackup.init();
                multi.multiChanBackup = Data(base64Encoded: channelBackup)!;
            snapshot.multiChanBackup = multi;
        
            request.channelBackups = snapshot;
            }
            
            let serialReq = try request.serializedData()
            LndmobileInitWallet(serialReq, lndOp)
        } catch {
            callback(nil,error.localizedDescription)
        }
    }
    
    @objc public func getTransactions(callback: @escaping (String?,String?) -> Void) {
        
        
        
        do {
            
            
            let request = try Lnrpc_GetTransactionsRequest().serializedData();
            
            let lndOp = GetTransactions(callback)
            
            LndmobileGetTransactions(request, lndOp);
            
        } catch {
            
            callback(nil,error.localizedDescription)
            
        }
    }
    
    
    
    @objc public func listChannels(callback: @escaping (String?,String?) -> Void) {
        
        do {
            
            
            let request = try Lnrpc_ListChannelsRequest().serializedData();
            
            let lndOp = ListChannels(callback)
            
            LndmobileListChannels(request, lndOp);
            
        } catch {
            
            callback(nil,error.localizedDescription)
            
        }
    }
    
    @objc public func pendingChannels(callback: @escaping (String?,String?) -> Void) {
        
        do {
            
            
            let request = try Lnrpc_PendingChannelsRequest().serializedData();
            
            let lndOp = PendingChannels(callback)
            
            LndmobilePendingChannels(request, lndOp);
            
        } catch {
            
            callback(nil,error.localizedDescription)
            
        }
    }
    
    @objc public func listPayments(callback: @escaping (String?,String?) -> Void) {
        
        do {
            
            
            let request = try Lnrpc_ListPaymentsRequest().serializedData();
            
            let lndOp = ListPayments(callback)
            
            LndmobileListPayments(request, lndOp);
            
        } catch {
            
            callback(nil,error.localizedDescription)
            
        }
    }
    
    
    @objc public func listInvoices(callback: @escaping (String?,String?) -> Void) {
        
        do {
            
            
            let request = try Lnrpc_ListInvoiceRequest().serializedData();
            
            let lndOp = ListInvoices(callback)
            
            LndmobileListInvoices(request, lndOp);
            
        } catch {
            
            callback(nil,error.localizedDescription)
            
        }
    }
    
    @objc public func addTower(pubkey:String, address:String, callback: @escaping (String?,String?) -> Void) {
        print("Add tower");
        do {
            LndMobileWrapper.currentLog("2er");
            var req = Wtclientrpc_AddTowerRequest();
            
            guard let nodePubKeyData = Data(hexString: pubkey) else {
                LndMobileWrapper.currentLog("Node Pub Key should have been validated ahead of time")
                return;
            }
            
            req.pubkey = nodePubKeyData;
            req.address = address;
            
            
            let lndOp = AddTower(callback)
            LndMobileWrapper.currentLog("adding tower res");
            LndmobileAddTower(try req.serializedData(), lndOp);
            
        } catch {
            
            callback(nil,error.localizedDescription)
            
        }
    }
    
     @objc public func decodeAezeed(passphrase:String) -> String {
         
          return LndmobileDecodeAezeed(passphrase)
           
     }
    
    @objc public func listTowers(callback: @escaping (String?,String?) -> Void) {
        print("list tower");
        do {
            LndMobileWrapper.currentLog("list tower");
            let req = Wtclientrpc_ListTowersRequest();
            
            let lndOp = ListTowers(callback)
            LndMobileWrapper.currentLog("list towers res");
            LndmobileListTowers(try req.serializedData(), lndOp);
            
        } catch {
            
            callback(nil,error.localizedDescription)
            
        }
    }
    
    @objc public func getTowerInfo(pubkey:String, callback: @escaping (String?,String?) -> Void) {
        print("get tower info");
        do {
            LndMobileWrapper.currentLog("get tower info");
            var req = Wtclientrpc_GetTowerInfoRequest();
            
            guard let nodePubKeyData = Data(hexString: pubkey) else {
                LndMobileWrapper.currentLog("Node Pub Key should have been validated ahead of time")
                return;
            }
            
            req.pubkey = nodePubKeyData;
            
            let lndOp = GetTowerInfo(callback)
            LndMobileWrapper.currentLog("get tower info res");
            LndmobileGetTowerInfo(try req.serializedData(), lndOp);
            
        } catch {
            
            callback(nil,error.localizedDescription)
            
        }
    }
    
    
    @objc public func connectPeer(host:String, pubkey:String,  callback: @escaping (String?,String?) -> Void) {
        
        
       
        do {
            LndMobileWrapper.currentLog("connecting peer");
            var req = Lnrpc_ConnectPeerRequest();
            var lnAddr =  Lnrpc_LightningAddress();
            lnAddr.host = host;
            lnAddr.pubkey = pubkey;
            req.addr = lnAddr;
            let lndOp = ConnectPeer(callback)
            LndMobileWrapper.currentLog("connecting peer res");
            LndmobileConnectPeer(try req.serializedData(), lndOp);
            
        } catch {
            
            callback(nil,error.localizedDescription)
            
        }
    }
    
    
    @objc public func closeChannel(txid:String, output:Int64, force:Bool, callback: @escaping (String?,String?) -> Void) {
        
        do {
            
            var channelPoint = Lnrpc_ChannelPoint();
            channelPoint.fundingTxidStr = txid;
            channelPoint.outputIndex = UInt32(output);
            
            var req = Lnrpc_CloseChannelRequest();
            req.channelPoint = channelPoint;
            
            req.force = force;
            let lndOp = CloseChannel(callback)
            
            
            LndmobileCloseChannel(try req.serializedData(), lndOp);
            
            
            
        } catch {
            
            callback(nil,error.localizedDescription)
            
        }
        
    }
    
    
    @objc public func openChannel(localFundingAmount:Int64, pubkey:String, isPrivate:Bool, callback: @escaping (String?,String?) -> Void) {
        
        do {
            LndMobileWrapper.currentLog("open channel");
            var req = Lnrpc_OpenChannelRequest();
            
            req.localFundingAmount = localFundingAmount;
            
            req.private = isPrivate;
            
            guard let nodePubKeyData = Data(hexString: pubkey) else {
                LndMobileWrapper.currentLog("Node Pub Key should have been validated ahead of time")
                return;
            }
            
            req.nodePubkey = nodePubKeyData ;
            // req.nodePubkeyString = pubkey;
            let lndOp = OpenChannel(callback)
            LndMobileWrapper.currentLog("open channel2 "+req.nodePubkeyString);
            
            LndmobileOpenChannel(try req.serializedData(), lndOp);
            
            
        } catch {
            
            callback(nil,error.localizedDescription)
            
        }
    }
    
    
    @objc public func sendPayment(paymentRequest:String,amount:Int64, feeLimit:Int64, callback: @escaping (String?,String?) -> Void) {
        do {
            var req = Lnrpc_SendRequest();
            req.paymentRequest = paymentRequest;
            if(amount != -1){
                req.amt = amount;
            }
            
            if(feeLimit != -1){
                var feeLimitObj = Lnrpc_FeeLimit();
                feeLimitObj.percent = feeLimit;
                req.feeLimit = feeLimitObj;
            }
            
            let lndOp = SendPayment(callback)
            LndMobileWrapper.currentLog("send payment");
            var error: NSError?
            
            let call = LndmobileSendPayment(lndOp, &error)
            
            try call!.send(try req.serializedData());
            
            
            
        } catch {
            
            callback(nil,error.localizedDescription)
            
        }
        
    }
    
    @objc public func decodePayReq(payReq:String, callback: @escaping (String?,String?) -> Void) {
        do {
            
            var req = Lnrpc_PayReqString()
            let lndOp = DecodePayReq(callback)
            req.payReq = payReq;
            LndmobileDecodePayReq(try req.serializedData(), lndOp);
        } catch {
            
            callback(nil,error.localizedDescription)
            
        }
    }
    
    
    @objc public func getNodeInfo(pubkey:String, callback: @escaping (String?,String?) -> Void) {
        do {
            var req = Lnrpc_NodeInfoRequest();
            req.pubKey = pubkey;
            let lndOp = GetNodeInfo(callback)
            LndmobileGetNodeInfo(try req.serializedData(), lndOp);
            
        } catch {
            
            callback(nil,error.localizedDescription)
            
        }
    }
    
    @objc public func subscribeTransactions(callback: @escaping (String?,String?) -> Void) {
        do {
            let req = Lnrpc_GetTransactionsRequest();
            
            let lndOp = SubscribeTransactions(callback)
            LndmobileSubscribeTransactions(try req.serializedData(), lndOp);
            
        } catch {
            
            callback(nil,error.localizedDescription)
            
        }
    }
    
    @objc public func subscribeInvoices(callback: @escaping (String?,String?) -> Void) {
        do {
            let req = Lnrpc_InvoiceSubscription();
            
            let lndOp = SubscribeInvoices(callback)
            LndmobileSubscribeInvoices(try req.serializedData(), lndOp);
            
        } catch {
            
            callback(nil,error.localizedDescription)
            
        }
    }
    
    private class GetNodeInfo: NSObject, LndmobileCallbackProtocol {
        private var completion:((String?,String?) -> (Void));
        
        
        init(_ completion: @escaping (String?,String?) -> Void) {
            
            self.completion = completion
        }
        
        func onResponse(_ p0: Data!) {
            print("node info")
            
            do {
                
                let response = try  Lnrpc_NodeInfo(serializedData: p0)
                let res = try response.jsonString();
                
                completion( res,nil)
            } catch {
                completion(nil,error.localizedDescription)
            }
        }
        
        func onError(_ p0: Error!) {
            completion(nil,p0.localizedDescription)
        }
    }
    
    private class DecodePayReq: NSObject, LndmobileCallbackProtocol {
        private var completion:((String?,String?) -> (Void));
        
        
        init(_ completion: @escaping (String?,String?) -> Void) {
            
            self.completion = completion
        }
        
        func onResponse(_ p0: Data!) {
            print("decode payment")
            
            do {
                
                let response = try  Lnrpc_PayReq(serializedData: p0)
                let res = try response.jsonString();
                
                completion( res,nil)
            } catch {
                completion(nil,error.localizedDescription)
            }
        }
        
        func onError(_ p0: Error!) {
            completion(nil,p0.localizedDescription)
        }
    }
    
    private class SendPayment: NSObject, LndmobileRecvStreamProtocol {
        private var completion:((String?,String?) -> (Void));
        
        
        init(_ completion: @escaping (String?,String?) -> Void) {
            
            self.completion = completion
        }
        
        func onResponse(_ p0: Data!) {
            print("send payment")
            LndMobileWrapper.currentLog("send payment log");
            do {
                let response = try  Lnrpc_SendResponse(serializedData: p0)
                let res = try response.jsonString();
                
                completion( res,nil)
            } catch {
                completion(nil,error.localizedDescription)
            }
        }
        
        func onError(_ p0: Error!) {
            completion(nil,p0.localizedDescription)
        }
    }
    
    
    private class SendCoins: NSObject, LndmobileCallbackProtocol {
        private var completion:((String?,String?) -> (Void));
        
        
        init(_ completion: @escaping (String?,String?) -> Void) {
            
            self.completion = completion
        }
        
        func onResponse(_ p0: Data!) {
            LndMobileWrapper.currentLog("send coins log");
            do {
                let response = try  Lnrpc_SendCoinsResponse(serializedData: p0)
                let res = try response.jsonString();
                
                completion( res,nil)
            } catch {
                completion(nil,error.localizedDescription)
            }
        }
        
        func onError(_ p0: Error!) {
            completion(nil,p0.localizedDescription)
        }
    }
    
    private class EstimateFee: NSObject, LndmobileCallbackProtocol {
        private var completion:((String?,String?) -> (Void));
        
        
        init(_ completion: @escaping (String?,String?) -> Void) {
            
            self.completion = completion
        }
        
        func onResponse(_ p0: Data!) {
            LndMobileWrapper.currentLog("estimate fee log");
            do {
                let response = try  Lnrpc_EstimateFeeResponse(serializedData: p0)
                let res = try response.jsonString();
                
                completion( res,nil)
            } catch {
                completion(nil,error.localizedDescription)
            }
        }
        
        func onError(_ p0: Error!) {
            completion(nil,p0.localizedDescription)
        }
    }
    
    
    
    private func receiveOpenChannelUpdate(call: Lnrpc_LightningOpenChannelCall, callback: @escaping (String?,String?) -> Void) throws {
        try call.receive { [weak self] in
            if let result = $0.result.flatMap({ $0 }) {
                let json =  try? result.jsonString()
                callback(json,nil)
                
            } else if let error = $0.error {
                callback(nil,error.localizedDescription)
                return;//dont let the receiveCloseChannelUpdate fire if error because if it does the function iterates error forever, instead let the app re init the eubscribe function
            }
            try? self?.receiveOpenChannelUpdate(call: call,callback: callback)
        }
    }
    
    
    @objc public func lookUpInvoice(rhash:String, callback: @escaping (String?,String?) -> Void) {
        LndMobileWrapper.currentLog("looking up invoice");
        do {
            var request = Lnrpc_PaymentHash();
            request.rHashStr = rhash;
            let data = try request.serializedData();
            
            let lndOp = LookUpInvoice(callback)
            
            LndmobileLookupInvoice(data, lndOp);
            
        } catch {
            callback(nil,error.localizedDescription);
        }
    }
    
    @objc public func signMessage(message:String, callback: @escaping (String?,String?) -> Void) {
        do {
            var req = Lnrpc_SignMessageRequest();
            req.msg = message.data(using: .utf8)!
            
            
            
            let lndOp = SignMessage(callback)
            
            LndmobileSignMessage(try req.serializedData(), lndOp);
            
        } catch {
            
            callback(nil,error.localizedDescription)
            
        }
    }
    
    @objc public func verifyMessage(message:String, signature:String, callback: @escaping (String?,String?) -> Void) {
        do {
            var req = Lnrpc_VerifyMessageRequest();
            req.msg = message.data(using: .utf8)!
            req.signature = signature;
            
            
            
            let lndOp = VerifyMessage(callback)
            
            LndmobileVerifyMessage(try req.serializedData(), lndOp);
            
        } catch {
            
            callback(nil,error.localizedDescription)
            
        }
    }
    
    
    @objc public func addInvoice(amount:Int64, expiry:Int64, memo:String, isPrivate:Bool, callback: @escaping (String?,String?) -> Void) {
        do {
            
            var req = Lnrpc_Invoice();
            req.value = amount;
            req.memo = memo;
            req.expiry = expiry;
            req.private = isPrivate;
            
            
            let lndOp = AddInvoice(callback)
            
            LndmobileAddInvoice(try req.serializedData(), lndOp);
            
        } catch {
            
            callback(nil,error.localizedDescription)
            
        }
    }
    
    
    
    @objc public func newAddress(addressType : String, callback: @escaping (String?,String?) -> Void) {
        
        do {
            
            var req = Lnrpc_NewAddressRequest();
            if(addressType == "np2wkh"){
                req.type = Lnrpc_AddressType.nestedPubkeyHash;
            }else {
                req.type =  Lnrpc_AddressType.witnessPubkeyHash;
            }
            
            
            
            let lndOp = NewAddress(callback)
            
            LndmobileNewAddress(try req.serializedData(), lndOp);
            
        } catch {
            
            callback(nil,error.localizedDescription)
            
        }
    }
    
    
    
    @objc public func unlockWallet(walletPassword: String,recoveryWindow:Int32, channelBackup: String,
                                   callback: @escaping (String?,String?) -> Void) {
        
        LndMobileWrapper.currentLog("LN unlock Wallet Request Start")
        
        currentCallback = callback;
        guard let passwordData = walletPassword.data(using: .utf8) else {
            LndMobileWrapper.currentLog("password nil")
            
            callback(nil,"password error");
            return;
        }
        
        
        let lndOp = UnlockWallet(callback);
        
        do {
            LndMobileWrapper.currentLog("LN unlock Wallet Request")
            
            var request = Lnrpc_UnlockWalletRequest()
            request.walletPassword = passwordData
            
            if(recoveryWindow != -1){
                LndMobileWrapper.currentLog("setting recovery window "+String(recoveryWindow))
                
                request.recoveryWindow = recoveryWindow
            }
            
            if(channelBackup != ""){
                
                LndMobileWrapper.currentLog("setting channel backup "+channelBackup)
                
                var snapshot = Lnrpc_ChanBackupSnapshot.init()
                var multi = Lnrpc_MultiChanBackup.init();
                multi.multiChanBackup = Data(base64Encoded: channelBackup)!;
                snapshot.multiChanBackup = multi;
                
                request.channelBackups = snapshot;
            }
            
            let serialReq = try request.serializedData()
            LndMobileWrapper.currentLog("LN unlock Wallet Request continue 1")
            LndmobileUnlockWallet(serialReq, lndOp)
            LndMobileWrapper.currentLog("LN unlock Wallet Request continue 2")
            
        } catch {
            LndMobileWrapper.currentLog("error1:"+error.localizedDescription)
            
            callback(nil,"error1:"+error.localizedDescription)
            
        }
    }
    
    
    
    private class UnlockWallet: NSObject, LndmobileCallbackProtocol {
        private var completion:((String?,String?) -> (Void));
        
        
        init(_ completion: @escaping (String?,String?) -> Void) {
            print("inti stop deamon")
            self.completion = completion
        }
        
        func onResponse(_ p0: Data!) {
            
            completion( "success",nil)
        }
        
        func onError(_ p0: Error!) {
            completion(nil,"error2:"+p0.localizedDescription)
        }
    }
    
    private class StopDaemon: NSObject, LndmobileCallbackProtocol {
        private var completion:((String?,String?) -> (Void));
        
        
        init(_ completion: @escaping (String?,String?) -> Void) {
            print("inti stop deamon")
            self.completion = completion
        }
        
        func onResponse(_ p0: Data!) {
            print("LN Stop Daemon Success!")
            
            completion("stopped",nil)
            
        }
        
        func onError(_ p0: Error!) {
            print("error Stop Daemon")
            completion(nil,p0.localizedDescription)
        }
    }
    
    private class CreateWallet: NSObject, LndmobileCallbackProtocol {
        private var completion:((String?,String?) -> (Void));
        
        
        init(_ completion: @escaping (String?,String?) -> Void) {
            LndMobileWrapper.currentLog("create wallet res")
            self.completion = completion
        }
        
        func onResponse(_ p0: Data!) {
            LndMobileWrapper.currentLog("create wallet res")
            completion( "success",nil)
        }
        
        func onError(_ p0: Error!) {
            LndMobileWrapper.currentLog("create wallet err")
            guard let err = p0 else {
                completion( nil,"cw error");
                return;
                
            }
            completion( nil,err.localizedDescription)
            
        }
    }
    
    
    private class OpenChannel: NSObject, LndmobileRecvStreamProtocol {
        private var completion:((String?,String?) -> (Void));
        
        
        init(_ completion: @escaping (String?,String?) -> Void) {
            
            self.completion = completion
        }
        
        
        func onResponse(_ p0: Data!) {
            LndMobileWrapper.currentLog("open channel got res");
            
            
            do {
                let response = try Lnrpc_OpenStatusUpdate(serializedData: p0)
                
                guard let update = response.update else {
                    
                    completion("","updated")
                    return
                }
                switch update {
                case .chanPending(let pendingUpdate):
                    let res = try pendingUpdate.jsonString();
                    
                    completion( res,nil)
                    
                /*case .confirmation(let confirmUpdate):
                    let res = try confirmUpdate.jsonString();
                    
                    completion( res,nil)*/
                case .chanOpen(let openUpdate):
                    let res = try openUpdate.jsonString();
                    
                    completion( res,nil)
                }
                
                
                
            } catch {
                LndMobileWrapper.currentLog("open channel got res error");
                completion( nil,error.localizedDescription)
                
            }
        }
        
        func onError(_ p0: Error!) {
            guard let err = p0 else {
                completion( nil,"oc error");
                return;
                
            }
            completion( nil,err.localizedDescription)
            
            
            
            
            
            
        }
    }
    
    
    
    private class CloseChannel: NSObject, LndmobileRecvStreamProtocol {
        private var completion:((String?,String?) -> (Void));
        
        
        init(_ completion: @escaping (String?,String?) -> Void) {
            
            self.completion = completion
        }
        
        
        func onResponse(_ p0: Data!) {
            LndMobileWrapper.currentLog("close channel got res");
            
            
            do {
                
                let response = try Lnrpc_CloseStatusUpdate(serializedData: p0)
                
                let res = try response.jsonString();
                
                completion( res,nil)
                
                
                
            } catch {
                LndMobileWrapper.currentLog("open channel got res error");
                completion( nil,error.localizedDescription)
                
            }
        }
        
        func onError(_ p0: Error!) {
            guard let err = p0 else {
                completion( nil,"oc error");
                return;
                
            }
            completion( nil,err.localizedDescription)
            
            
            
            
            
            
        }
    }
    
    
    private class ConnectPeer: NSObject, LndmobileCallbackProtocol {
        private var completion:((String?,String?) -> (Void));
        
        
        init(_ completion: @escaping (String?,String?) -> Void) {
            
            self.completion = completion
        }
        
        func onResponse(_ p0: Data!) {
            print("connect peer")
            
            guard p0 != nil else {
                
                completion("success",nil); //connect peer doesnt return any data
                return
            }
            
            do {
                
                let response = try  Lnrpc_ConnectPeerResponse(serializedData: p0)
                let res = try response.jsonString();
                
                completion( res,nil)
            } catch {
                completion(nil,error.localizedDescription)
            }
        }
        
        func onError(_ p0: Error!) {
            completion(nil,p0.localizedDescription)
        }
    }
    
    private class AddTower: NSObject, LndmobileCallbackProtocol {
        private var completion:((String?,String?) -> (Void));
        
        
        init(_ completion: @escaping (String?,String?) -> Void) {
            
            self.completion = completion
        }
        
        func onResponse(_ p0: Data!) {
            print("add tower")
            
            guard p0 != nil else {
                
                completion("success",nil); //connect peer doesnt return any data
                return
            }
            
            do {
                
                let response = try  Wtclientrpc_AddTowerResponse(serializedData: p0)
                let res = try response.jsonString();
                
                completion( res,nil)
            } catch {
                completion(nil,error.localizedDescription)
            }
        }
        
        func onError(_ p0: Error!) {
            completion(nil,p0.localizedDescription)
        }
    }
    
    private class GetTowerInfo: NSObject, LndmobileCallbackProtocol {
        private var completion:((String?,String?) -> (Void));
        
        
        init(_ completion: @escaping (String?,String?) -> Void) {
            
            self.completion = completion
        }
        
        func onResponse(_ p0: Data!) {
            print("get tower info")
            
            guard p0 != nil else {
                
                completion("success",nil); //connect peer doesnt return any data
                return
            }
            
            do {
                
                let response = try  Wtclientrpc_Tower(serializedData: p0)
                let res = try response.jsonString();
                
                completion( res,nil)
            } catch {
                completion(nil,error.localizedDescription)
            }
        }
        
        func onError(_ p0: Error!) {
            completion(nil,p0.localizedDescription)
        }
    }
    
    
    
    private class ListTowers: NSObject, LndmobileCallbackProtocol {
        private var completion:((String?,String?) -> (Void));
        
        
        init(_ completion: @escaping (String?,String?) -> Void) {
            
            self.completion = completion
        }
        
        func onResponse(_ p0: Data!) {
            print("connect peer")
            
            guard p0 != nil else {
                
                completion("success",nil); //connect peer doesnt return any data
                return
            }
            
            do {
                
                let response = try  Wtclientrpc_ListTowersResponse(serializedData: p0)
                let res = try response.jsonString();
                
                completion( res,nil)
            } catch {
                completion(nil,error.localizedDescription)
            }
        }
        
        func onError(_ p0: Error!) {
            completion(nil,p0.localizedDescription)
        }
    }
    
    
    
    private class NewAddress: NSObject, LndmobileCallbackProtocol {
        private var completion:((String?,String?) -> (Void));
        
        
        init(_ completion: @escaping (String?,String?) -> Void) {
            
            self.completion = completion
        }
        
        func onResponse(_ p0: Data!) {
            print("new address")
            
            do {
                
                let response = try  Lnrpc_NewAddressResponse(serializedData: p0)
                let res = try response.jsonString();
                
                completion( res,nil)
            } catch {
                completion(nil,error.localizedDescription)
            }
        }
        
        func onError(_ p0: Error!) {
            completion(nil,p0.localizedDescription)
        }
    }
    
    private class SignMessage: NSObject, LndmobileCallbackProtocol {
        private var completion:((String?,String?) -> (Void));
        
        
        init(_ completion: @escaping (String?,String?) -> Void) {
            
            self.completion = completion
        }
        
        func onResponse(_ p0: Data!) {
            
            do {
                
                let response = try  Lnrpc_SignMessageResponse(serializedData: p0)
                let res = try response.jsonString();
                
                completion( res,nil)
            } catch {
                completion(nil,error.localizedDescription)
            }
        }
        
        func onError(_ p0: Error!) {
            completion(nil,p0.localizedDescription)
        }
    }
    
    private class VerifyMessage: NSObject, LndmobileCallbackProtocol {
        private var completion:((String?,String?) -> (Void));
        
        
        init(_ completion: @escaping (String?,String?) -> Void) {
            
            self.completion = completion
        }
        
        func onResponse(_ p0: Data!) {
            
            do {
                
                let response = try  Lnrpc_VerifyMessageResponse(serializedData: p0)
                let res = try response.jsonString();
                
                completion( res,nil)
            } catch {
                completion(nil,error.localizedDescription)
            }
        }
        
        func onError(_ p0: Error!) {
            completion(nil,p0.localizedDescription)
        }
    }
    
    private class AddInvoice: NSObject, LndmobileCallbackProtocol {
        private var completion:((String?,String?) -> (Void));
        
        
        init(_ completion: @escaping (String?,String?) -> Void) {
            
            self.completion = completion
        }
        
        func onResponse(_ p0: Data!) {
            print("add invoice")
            
            do {
                
                let response = try  Lnrpc_AddInvoiceResponse(serializedData: p0)
                let res = try response.jsonString();
                
                completion( res,nil)
            } catch {
                completion(nil,error.localizedDescription)
            }
        }
        
        func onError(_ p0: Error!) {
            completion(nil,p0.localizedDescription)
        }
    }
    
    private class SubscribeTransactions: NSObject, LndmobileRecvStreamProtocol {
        private var completion:((String?,String?) -> (Void));
        
        init(_ completion: @escaping (String?,String?) -> Void) {
            
            self.completion = completion
        }
        
        
        func onResponse(_ p0: Data!) {
            do {
                let response = try  Lnrpc_Transaction(serializedData: p0)
                let res = try response.jsonString();
                
                completion( res,nil)
            } catch {
                completion(nil,error.localizedDescription)
            }
        }
        
        func onError(_ p0: Error!) {
            completion(nil,p0.localizedDescription)
        }
    }
    
    
    private class SubscribeInvoices: NSObject, LndmobileRecvStreamProtocol {
        private var completion:((String?,String?) -> (Void));
        
        init(_ completion: @escaping (String?,String?) -> Void) {
            
            self.completion = completion
        }
        
        
        func onResponse(_ p0: Data!) {
            do {
                let response = try  Lnrpc_Invoice(serializedData: p0)
                let res = try response.jsonString();
                
                completion( res,nil)
            } catch {
                completion(nil,error.localizedDescription)
            }
        }
        
        func onError(_ p0: Error!) {
            completion(nil,p0.localizedDescription)
        }
    }
    
    private class PendingChannels: NSObject, LndmobileCallbackProtocol {
        private var completion:((String?,String?) -> (Void));
        
        
        init(_ completion: @escaping (String?,String?) -> Void) {
            
            self.completion = completion
        }
        
        func onResponse(_ p0: Data!) {
            print("pending channels")
            
            
            guard p0 != nil else {
                
                completion("{}",nil);
                return
            }
            do {
                
                let response = try  Lnrpc_PendingChannelsResponse(serializedData: p0)
                let res = try response.jsonString();
                
                completion( res,nil)
            } catch {
                completion(nil,error.localizedDescription)
            }
        }
        
        func onError(_ p0: Error!) {
            completion(nil,p0.localizedDescription)
        }
    }
    
    private class ListChannels: NSObject, LndmobileCallbackProtocol {
        private var completion:((String?,String?) -> (Void));
        
        
        init(_ completion: @escaping (String?,String?) -> Void) {
            
            self.completion = completion
        }
        
        func onResponse(_ p0: Data!) {
            print("wallet balances")
            
            guard p0 != nil else {
                
                completion("{}",nil);
                return
            }
            
            do {
                
                let response = try  Lnrpc_ListChannelsResponse(serializedData: p0)
                let res = try response.jsonString();
                
                completion( res,nil)
            } catch {
                completion(nil,error.localizedDescription)
            }
        }
        
        func onError(_ p0: Error!) {
            completion(nil,p0.localizedDescription)
        }
    }
    
    private class WalletBalance: NSObject, LndmobileCallbackProtocol {
        private var completion:((String?,String?) -> (Void));
        
        
        init(_ completion: @escaping (String?,String?) -> Void) {
            
            self.completion = completion
        }
        
        func onResponse(_ p0: Data!) {
            print("wallet balances")
            
            guard p0 != nil else {
                
                completion("{}",nil);
                return
            }
            
            do {
                let response = try Lnrpc_WalletBalanceResponse(serializedData: p0)
                let res = try response.jsonString();
                
                completion( res,nil)
            } catch {
                completion(nil,error.localizedDescription)
            }
        }
        
        func onError(_ p0: Error!) {
            completion(nil,p0.localizedDescription)
        }
    }
    
    private class ChannelBalance: NSObject, LndmobileCallbackProtocol {
        private var completion:((String?,String?) -> (Void));
        
        
        init(_ completion: @escaping (String?,String?) -> Void) {
            
            self.completion = completion
        }
        
        func onResponse(_ p0: Data!) {
            print("channel balance Success!")
            
            guard p0 != nil else {
                
                completion("{}",nil);
                return
            }
            
            do {
                let response = try Lnrpc_ChannelBalanceResponse(serializedData: p0)
                let res = try response.jsonString();
                
                completion( res,nil)
            } catch {
                completion(nil,error.localizedDescription)
            }
        }
        
        func onError(_ p0: Error!) {
            completion(nil,p0.localizedDescription)
        }
    }
    
    private class GetTransactions: NSObject, LndmobileCallbackProtocol {
        private var completion:((String?,String?) -> (Void));
        
        
        init(_ completion: @escaping (String?,String?) -> Void) {
            
            self.completion = completion
        }
        
        func onResponse(_ p0: Data!) {
            
            guard p0 != nil else {
                
                completion("{}",nil);
                return
            }
            
            do {
                let response = try Lnrpc_TransactionDetails(serializedData: p0)
                let res = try response.jsonString();
                
                completion(res,nil);
            } catch {
                completion(nil,error.localizedDescription)
            }
        }
        
        func onError(_ p0: Error!) {
            completion(nil,p0.localizedDescription)
        }
    }
    
    
    private class ListPayments: NSObject, LndmobileCallbackProtocol {
        private var completion:((String?,String?) -> (Void));
        
        
        init(_ completion: @escaping (String?,String?) -> Void) {
            
            self.completion = completion
        }
        
        func onResponse(_ p0: Data!) {
            print("list payments Success!")
            
            guard p0 != nil else {
                
                completion("{}",nil);
                return
            }
            
            do {
                let response = try Lnrpc_ListPaymentsResponse(serializedData: p0)
                let res = try response.jsonString();
                
                completion(res,nil);
            } catch {
                completion(nil,error.localizedDescription)
            }
        }
        
        func onError(_ p0: Error!) {
            completion(nil,p0.localizedDescription)
        }
    }
    
    private class ListInvoices: NSObject, LndmobileCallbackProtocol {
        private var completion:((String?,String?) -> (Void));
        
        
        init(_ completion: @escaping (String?,String?) -> Void) {
            
            self.completion = completion
        }
        
        func onResponse(_ p0: Data!) {
            print("list invoices Success!")
            
            guard p0 != nil else {
                
                completion("[]",nil);
                return
            }
            
            do {
                
                let response = try Lnrpc_ListInvoiceResponse(serializedData: p0)
                let res = try response.jsonString();
                
                completion( res,nil)
            } catch {
                completion(nil,error.localizedDescription)
            }
        }
        
        func onError(_ p0: Error!) {
            completion(nil,p0.localizedDescription)
        }
    }
    
    
    private class GenerateSeed: NSObject, LndmobileCallbackProtocol {
        private var completion:((String?,String?) -> (Void));
        
        
        init(_ completion: @escaping (String?,String?) -> Void) {
            
            self.completion = completion
        }
        
        func onResponse(_ p0: Data!) {
            
            LndMobileWrapper.currentLog("getting seed 1 ");
            do {
                let response = try Lnrpc_GenSeedResponse(serializedData: p0)
                let res = try response.jsonString();
                
                completion( res,nil)
            } catch {
                completion(nil,error.localizedDescription)
            }
        }
        
        func onError(_ p0: Error!) {
            completion(nil,p0.localizedDescription)
        }
    }
    
    private class GetInfo: NSObject, LndmobileCallbackProtocol {
        
        private var completion:((String?,String?) -> (Void));
        
        
        init(_ completion: @escaping (String?,String?) -> Void) {
            
            self.completion = completion
        }
        
        func onResponse(_ p0: Data!) {
            print("getting info")
            
            do {
                let response = try Lnrpc_GetInfoResponse(serializedData: p0)
                let res = try response.jsonString();
                
                completion( res,nil)
            } catch {
                completion(nil,error.localizedDescription)
            }
        }
        
        func onError(_ p0: Error!) {
            completion(nil,p0.localizedDescription)
        }
    }
    
    private class LookUpInvoice: NSObject, LndmobileCallbackProtocol {
        
        private var completion:((String?,String?) -> (Void));
        
        
        init(_ completion: @escaping (String?,String?) -> Void) {
            
            self.completion = completion
        }
        
        func onResponse(_ p0: Data!) {
            print("LN Stop Daemon Success!")
            
            do {
                let response = try Lnrpc_Invoice(serializedData: p0)
                let res = try response.jsonString();
                
                completion( res,nil)
            } catch {
                completion(nil,error.localizedDescription)
            }
        }
        
        func onError(_ p0: Error!) {
            completion(nil,p0.localizedDescription)
        }
    }
    
    private class ExportAllChannelBackups: NSObject, LndmobileCallbackProtocol {
        
        private var completion:((String?,String?) -> (Void));
        
        
        init(_ completion: @escaping (String?,String?) -> Void) {
            
            self.completion = completion
        }
        
        func onResponse(_ p0: Data!) {
            
            do {
                let response = try Lnrpc_ChanBackupSnapshot(serializedData: p0)
                let res = try response.jsonString();
                
                completion( res,nil)
            } catch {
                completion(nil,error.localizedDescription)
            }
        }
        
        func onError(_ p0: Error!) {
            completion(nil,p0.localizedDescription)
        }
    }
    
    public func lndStart(completion: @escaping (() throws -> ()) -> Void) {
    
        // Obtain the path to Application Support
        self.directoryPath = (FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first?.path)!
        
         // BTCD can throw SIGPIPEs. Ignoring according to https://developer.apple.com/library/content/documentation/NetworkingInternetWeb/Conceptual/NetworkingOverview/CommonPitfalls/CommonPitfalls.html
        signal(SIGPIPE, SIG_IGN)
        
        LndmobileStart("--lnddir=" + directoryPath, LndStart(completion))
    }
    
    
    
    func stringToBytes(_ string: String) -> [UInt8]? {
        let length = string.count
        if length & 1 != 0 {
            return nil
        }
        var bytes = [UInt8]()
        bytes.reserveCapacity(length/2)
        var index = string.startIndex
        for _ in 0..<length/2 {
            let nextIndex = string.index(index, offsetBy: 2)
            if let b = UInt8(string[index..<nextIndex], radix: 16) {
                bytes.append(b)
            } else {
                return nil
            }
            index = nextIndex
        }
        return bytes
    }
    
    
    
    
}
