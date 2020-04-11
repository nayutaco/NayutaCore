#import "React/RCTBridgeModule.h"
@interface RCT_EXTERN_REMAP_MODULE(RNLndMobileWrapper,LndMobileWrapper, NSObject)
RCT_EXTERN_METHOD(sayHello:(RCTResponseSenderBlock)callback)
RCT_EXTERN_METHOD(startLND:(RCTResponseSenderBlock)callback)
@end
