import UIKit
import Capacitor
import WebKit
import ObjectiveC.runtime

class AppViewController: CAPBridgeViewController {

    override func viewDidLoad() {
        super.viewDidLoad()
        applyAdaptiveBackground()
        // iOS 네이티브 인터랙티브 스와이프 백.
        // WebKit 이 이전/현재 페이지를 실제로 같이 렌더링하므로, 스와이프 중
        // 왼쪽엔 이전 페이지·오른쪽엔 현재 페이지가 함께 밀려가는 표준 전환이
        // 스냅샷 에뮬레이션 없이 그대로 동작한다 (깜빡임 없음).
        self.webView?.allowsBackForwardNavigationGestures = true
        setupThemeBridge()
        hideKeyboardAccessoryBar()
        observeKeyboardForChatInput()
    }

    deinit {
        NotificationCenter.default.removeObserver(self)
    }

    // 채팅 입력창을 키보드 위에 붙이기 위해 키보드 높이를 CSS 변수(--chat-kb-h)로 푸시.
    // visualViewport JS API 는 iOS WKWebView 에서 resize 이벤트가 누락되는 경우가 있어
    // (특히 한/영 자판 전환, 도구막대 제거 후) 입력창이 키보드 뒤에 갇히는 현상이 발생.
    // UIResponder 키보드 노티피케이션을 직접 관찰해 정확한 키보드 높이를 전달한다.
    private func observeKeyboardForChatInput() {
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleKeyboardFrameChange(_:)),
            name: UIResponder.keyboardWillChangeFrameNotification,
            object: nil
        )
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleKeyboardHide(_:)),
            name: UIResponder.keyboardWillHideNotification,
            object: nil
        )
    }

    @objc private func handleKeyboardFrameChange(_ notification: Notification) {
        guard let userInfo = notification.userInfo,
              let endFrame = (userInfo[UIResponder.keyboardFrameEndUserInfoKey] as? NSValue)?.cgRectValue else {
            return
        }
        // 키보드 frame 은 window(스크린) 좌표계. 뷰 좌표계로 변환해 안전하게 계산.
        let keyboardFrameInView = view.convert(endFrame, from: nil)
        let height = max(0, view.bounds.height - keyboardFrameInView.origin.y)
        setChatKeyboardHeight(height)
    }

    @objc private func handleKeyboardHide(_ notification: Notification) {
        setChatKeyboardHeight(0)
    }

    private func setChatKeyboardHeight(_ height: CGFloat) {
        let px = Int(height.rounded())
        let js = "document.documentElement.style.setProperty('--chat-kb-h', '\(px)px');"
        DispatchQueue.main.async { [weak self] in
            self?.webView?.evaluateJavaScript(js, completionHandler: nil)
        }
    }

    // 키보드 위 시스템 도구막대(이전/다음 필드 화살표 + Done ✓) 제거.
    // WKWebView 의 첫 응답자는 내부 WKContentView 라서 WKWebView 에 직접
    // inputAccessoryView 를 override 해도 적용되지 않는다.
    // 런타임에 WKContentView 를 서브클래싱해서 inputAccessoryView 가 nil 을
    // 반환하도록 만들고, 기존 인스턴스의 클래스를 새 서브클래스로 교체한다.
    // 결과: visualViewport.height 가 도구막대 높이만큼 커져 --chat-kb-h 가 줄어들고
    // 채팅 입력창이 카톡처럼 키보드 바로 위에 붙는다.
    private func hideKeyboardAccessoryBar() {
        guard let webView = self.webView else { return }
        guard let WKContentViewClass = NSClassFromString("WKContentView") else { return }

        let subclassName = "NoAccessoryBarWKContentView"
        var subclass: AnyClass? = NSClassFromString(subclassName)

        if subclass == nil {
            guard let newClass = objc_allocateClassPair(WKContentViewClass, subclassName, 0) else { return }
            let selector = NSSelectorFromString("inputAccessoryView")
            let block: @convention(block) (AnyObject) -> UIView? = { _ in nil }
            let imp = imp_implementationWithBlock(block)
            let typeEncoding = "@@:"
            class_addMethod(newClass, selector, imp, typeEncoding)
            objc_registerClassPair(newClass)
            subclass = newClass
        }

        guard let finalClass = subclass else { return }

        // 현재 WKContentView 인스턴스(들)의 클래스를 동적으로 교체.
        // scrollView 의 첫 깊이에 보통 있지만, iOS 버전에 따라 위치가 달라질 수 있어
        // webView 트리 전체에서 탐색.
        func reclassify(_ view: UIView) {
            if String(describing: type(of: view)).contains("WKContentView") {
                object_setClass(view, finalClass)
            }
            view.subviews.forEach(reclassify)
        }
        reclassify(webView)
    }

    override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        applyAdaptiveBackground()
    }

    // 웹 테마(localStorage 'yogurtte:theme' resolved 값)를 네이티브로 푸시받기 위한 브릿지.
    // 시스템 traitCollection 만 보면 사용자가 앱 안에서 직접 라이트/다크를 골랐을 때
    // 시스템과 어긋나서 — 스와이프 백으로 노출되는 좌측 영역이 시스템 색(예: #0F1218)으로 보이는
    // 문제가 생긴다. JS 에서 'yogurtteThemeChange' 로 'light'|'dark'|'auto' 를 보내면
    // overrideUserInterfaceStyle 을 그에 맞춰 잠가 host view bg 가 항상 웹과 동일하게 유지된다.
    private func setupThemeBridge() {
        guard let userContentController = webView?.configuration.userContentController else { return }
        // 중복 등록 방지 — 기존에 같은 이름이 등록돼 있으면 제거 후 다시 등록
        userContentController.removeScriptMessageHandler(forName: "yogurtteThemeChange")
        userContentController.add(self, name: "yogurtteThemeChange")
    }

    // 스와이프/전환 중 native 호스트 뷰가 비쳐도 라이트/다크에 맞는 색이 깔리도록.
    // 웹의 --bg-base 와 동일 — 라이트 #FFFFFF, 다크 #0F1218
    private func applyAdaptiveBackground() {
        let bg: UIColor
        if #available(iOS 13.0, *) {
            bg = UIColor { traits in
                traits.userInterfaceStyle == .dark
                    ? UIColor(red: 15/255, green: 18/255, blue: 24/255, alpha: 1)
                    : UIColor.white
            }
        } else {
            bg = UIColor.white
        }
        view.backgroundColor = bg
        webView?.backgroundColor = bg
        webView?.scrollView.backgroundColor = bg
    }
}

// MARK: - WKScriptMessageHandler
// 웹 → 네이티브 테마 동기화. JS 는 다음 형식으로 호출:
//   window.webkit.messageHandlers.yogurtteThemeChange.postMessage('light' | 'dark' | 'auto')
extension AppViewController: WKScriptMessageHandler {
    func userContentController(_ userContentController: WKUserContentController,
                               didReceive message: WKScriptMessage) {
        guard message.name == "yogurtteThemeChange",
              let theme = message.body as? String else { return }
        if #available(iOS 13.0, *) {
            switch theme {
            case "dark":
                overrideUserInterfaceStyle = .dark
            case "light":
                overrideUserInterfaceStyle = .light
            default:
                overrideUserInterfaceStyle = .unspecified
            }
            // overrideUserInterfaceStyle 변경 시 traitCollectionDidChange 가 자동 발화되어
            // applyAdaptiveBackground 가 재실행되지만, dynamic UIColor 가 이미 캐시된
            // 케이스를 대비해 명시적으로 한 번 더 적용.
            applyAdaptiveBackground()
        }
    }
}
