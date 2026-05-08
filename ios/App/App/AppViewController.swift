import UIKit
import Capacitor

class AppViewController: CAPBridgeViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
        self.webView?.allowsBackForwardNavigationGestures = true
    }
}
