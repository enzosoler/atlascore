import UIKit
import Capacitor

class AtlasBridgeViewController: CAPBridgeViewController {

    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(NativeAuthSession())
        bridge?.registerPluginInstance(WidgetDataBridge())
    }
}
