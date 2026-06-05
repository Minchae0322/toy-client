import UIKit
import Capacitor
import WebKit
import ObjectiveC.runtime

class AppViewController: CAPBridgeViewController, UIGestureRecognizerDelegate {

    // iOS 시스템 에지 스와이프 영역(~20px)보다 넉넉하게 — Chrome iOS와 유사한 좌측 80px 인식 영역
    private let backSwipeEdgeWidth: CGFloat = 80
    // 뒤로가기 트리거 최소 수평 이동량
    private let backSwipeMinDistance: CGFloat = 60
    // 수평 우세 판정 (수직 대비 1.4배 이상 수평일 때만 뒤로가기로 인정)
    private let backSwipeHorizontalRatio: CGFloat = 1.4

    private var swipeStartLocation: CGPoint = .zero

    // Chrome iOS 스타일 — 손가락 따라 살짝 따라오는 둥근 chevron
    private var swipeIndicator: UIView?
    private let indicatorSize: CGFloat = 44
    private let indicatorHiddenX: CGFloat = -56

    // 스와이프 백 시 webView 뒤에 깔아 '이전 화면'을 실제로 보여주는 스냅샷 레이어.
    // webView 가 오른쪽으로 밀리면 이 뷰가 좌측에서 드러나 네이티브 push/pop 느낌을 낸다.
    private var previousPageSnapshotView: UIImageView?
    // backForwardList 깊이(backList.count)별 페이지 스냅샷 캐시
    private var pageSnapshots: [Int: UIImage] = [:]
    private let maxSnapshotCache = 12
    // 같은 webView 의 url KVO 를 등록했는지 추적 (deinit 안전 제거용)
    private var isObservingURL = false

    override func viewDidLoad() {
        super.viewDidLoad()
        applyAdaptiveBackground()
        // 네이티브 WKWebView 엣지 제스처는 비활성. 커스텀 pan 하나가 chevron + 페이지 슬라이드 + goBack 까지 단독 처리.
        // 둘 다 켜면 같은 스와이프에 둘 다 commit 되어 두 페이지 뒤로 점프(검은 화면 / "이상한 화면으로 순간이동")가 발생함.
        // webView 가 밀릴 때 좌측에 드러나는 영역은 previousPageSnapshotView(이전 페이지 캡처)가 채운다 — 검정 배경 노출 방지.
        self.webView?.allowsBackForwardNavigationGestures = false
        setupPreviousPageSnapshotView()
        installWiderBackSwipeGesture()
        setupSwipeIndicator()
        setupThemeBridge()
        hideKeyboardAccessoryBar()
        observeKeyboardForChatInput()
        observeNavigationForSnapshots()
    }

    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        // 초기 진입(홈 등) 페이지도 스냅샷으로 확보 — 첫 뒤로가기 대상이 될 수 있음
        scheduleSnapshotCapture()
    }

    deinit {
        NotificationCenter.default.removeObserver(self)
        if isObservingURL {
            webView?.removeObserver(self, forKeyPath: #keyPath(WKWebView.url))
        }
        NSObject.cancelPreviousPerformRequests(withTarget: self)
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

    private func setupSwipeIndicator() {
        let bubble = UIView(frame: CGRect(x: indicatorHiddenX, y: 0, width: indicatorSize, height: indicatorSize))
        bubble.layer.cornerRadius = indicatorSize / 2
        bubble.layer.shadowColor = UIColor.black.cgColor
        bubble.layer.shadowOpacity = 0.18
        bubble.layer.shadowRadius = 10
        bubble.layer.shadowOffset = CGSize(width: 0, height: 4)
        bubble.alpha = 0
        bubble.isUserInteractionEnabled = false

        if #available(iOS 13.0, *) {
            bubble.backgroundColor = UIColor { traits in
                traits.userInterfaceStyle == .dark
                    ? UIColor(white: 0.18, alpha: 0.96)
                    : UIColor(white: 1.0, alpha: 0.96)
            }
        } else {
            bubble.backgroundColor = UIColor.white.withAlphaComponent(0.96)
        }

        let icon = UIImageView()
        icon.contentMode = .center
        icon.frame = bubble.bounds
        if #available(iOS 13.0, *) {
            let config = UIImage.SymbolConfiguration(pointSize: 20, weight: .semibold)
            icon.image = UIImage(systemName: "chevron.left", withConfiguration: config)
            icon.tintColor = UIColor { traits in
                traits.userInterfaceStyle == .dark ? UIColor.white : UIColor.black
            }
        }
        bubble.addSubview(icon)

        view.addSubview(bubble)
        swipeIndicator = bubble
    }

    private func installWiderBackSwipeGesture() {
        let pan = UIPanGestureRecognizer(target: self, action: #selector(handleBackSwipe(_:)))
        pan.maximumNumberOfTouches = 1
        pan.delegate = self
        view.addGestureRecognizer(pan)
    }

    @objc private func handleBackSwipe(_ gesture: UIPanGestureRecognizer) {
        guard let webView = self.webView, webView.canGoBack else { return }
        let translation = gesture.translation(in: view)

        switch gesture.state {
        case .began:
            swipeStartLocation = gesture.location(in: view)
            preparePreviousSnapshotForSwipe()

        case .changed:
            updateSwipeIndicator(translation: translation)
            updateWebViewOffset(translation: translation)
            updatePreviousSnapshotParallax(translation: translation)

        case .ended, .cancelled:
            let isFromLeftEdge = swipeStartLocation.x <= backSwipeEdgeWidth
            let isHorizontalDominant = abs(translation.x) > abs(translation.y) * backSwipeHorizontalRatio
            let isFarEnough = translation.x >= backSwipeMinDistance
            let shouldGoBack = isFromLeftEdge && isHorizontalDominant && isFarEnough

            if shouldGoBack {
                commitBack()
            } else {
                cancelBack()
            }

        default:
            break
        }
    }

    // Chrome iOS 처럼 손가락을 따라 페이지가 함께 밀려가도록 webView 자체에 translationX 적용.
    // 멈추면 그 자리에 정지(스프링 백 없이) — 손가락이 떨어질 때 commit/cancel 분기에서 부드럽게 정리.
    private func updateWebViewOffset(translation: CGPoint) {
        guard let webView = self.webView else { return }
        let isFromLeftEdge = swipeStartLocation.x <= backSwipeEdgeWidth
        if !isFromLeftEdge || translation.x <= 0 {
            webView.transform = .identity
            return
        }
        // 약간의 저항 — 화면 폭의 80% 지점부터 추가 끌림이 줄어들어 자연스러운 한계감
        let width = view.bounds.width
        let dx = max(0, translation.x)
        let soft: CGFloat
        if dx <= width * 0.6 {
            soft = dx
        } else {
            let over = dx - width * 0.6
            soft = width * 0.6 + over * 0.55
        }
        webView.transform = CGAffineTransform(translationX: min(soft, width), y: 0)
    }

    private func commitBack() {
        guard let webView = self.webView else { return }
        animateIndicatorOut(success: true, completion: nil)
        let width = view.bounds.width
        UIView.animate(withDuration: 0.22, delay: 0, options: [.curveEaseOut], animations: {
            // webView 는 우측 밖으로, 뒤에 깔린 이전 페이지 스냅샷은 제자리로 들어옴
            webView.transform = CGAffineTransform(translationX: width, y: 0)
            self.previousPageSnapshotView?.transform = .identity
        }, completion: { _ in
            // ── 플리커 방지 핵심 ──
            // goBack() 은 비동기라 WKWebView 가 이전 페이지를 다시 그리는 데 한두 프레임 걸린다.
            // 이때 webView.transform 을 바로 identity 로 되돌리면, '떠나려던(현재) 페이지'를
            // 표시한 채로 화면 위치(0)에 와서 한순간 깜빡인다.
            // → 스냅샷(이전 페이지 캡처)을 webView '위'로 올려 그 순간을 가린 뒤,
            //   webView 가 이전 페이지를 다 그릴 시간을 두고 페이드아웃으로 부드럽게 걷어낸다.
            if let snap = self.previousPageSnapshotView {
                snap.transform = .identity
                snap.frame = self.view.bounds
                self.view.bringSubviewToFront(snap)
            }
            webView.goBack()
            webView.transform = .identity
            // 이전 페이지 렌더가 안정될 시간을 준 뒤 스냅샷을 페이드아웃하며 제거.
            // 같은 화면이라 겹쳐 보여도 위화감 없음 → 검정/흰 플래시 및 '현재 페이지 깜빡'을 모두 차단.
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.28) {
                guard let snap = self.previousPageSnapshotView else { return }
                UIView.animate(withDuration: 0.12, delay: 0, options: [.curveEaseOut], animations: {
                    snap.alpha = 0
                }, completion: { _ in
                    self.hidePreviousSnapshot()
                    snap.alpha = 1
                })
            }
        })
    }

    private func cancelBack() {
        guard let webView = self.webView else { return }
        animateIndicatorOut(success: false, completion: nil)
        let startOffset = -view.bounds.width * 0.25
        UIView.animate(withDuration: 0.22, delay: 0, options: [.curveEaseOut], animations: {
            webView.transform = .identity
            // 스냅샷은 다시 좌측 패럴럭스 시작 위치로 물러남
            self.previousPageSnapshotView?.transform = CGAffineTransform(translationX: startOffset, y: 0)
        }, completion: { _ in
            self.hidePreviousSnapshot()
        })
    }

    private func updateSwipeIndicator(translation: CGPoint) {
        guard let indicator = swipeIndicator else { return }
        let isFromLeftEdge = swipeStartLocation.x <= backSwipeEdgeWidth

        if !isFromLeftEdge || translation.x <= 0 {
            indicator.alpha = 0
            return
        }

        let progress = min(1.0, max(0, translation.x / backSwipeMinDistance))
        // 손가락의 0.4 비율로 따라옴 — Chrome iOS 와 비슷한 감각
        let xPos = max(indicatorHiddenX, min(indicatorHiddenX + (translation.x * 0.4), 20))
        // Y는 손가락 위치 무관, 화면 세로 중앙 (Chrome iOS 와 동일)
        let yPos = view.bounds.midY - indicatorSize / 2

        indicator.frame.origin = CGPoint(x: xPos, y: yPos)
        indicator.alpha = progress
        // 트리거 임계점 도달 시 살짝 커짐 — "끌어내질 준비" 시그널
        let scale: CGFloat = progress >= 1.0 ? 1.08 : 1.0
        indicator.transform = CGAffineTransform(scaleX: scale, y: scale)
    }

    private func animateIndicatorOut(success: Bool, completion: (() -> Void)?) {
        guard let indicator = swipeIndicator else {
            completion?()
            return
        }
        UIView.animate(withDuration: 0.18, delay: 0, options: [.curveEaseOut], animations: {
            if success {
                indicator.transform = CGAffineTransform(scaleX: 1.16, y: 1.16)
            }
            indicator.alpha = 0
        }, completion: { _ in
            indicator.transform = .identity
            indicator.frame.origin.x = self.indicatorHiddenX
            completion?()
        })
    }

    // MARK: - 이전 페이지 스냅샷 (스와이프 백 시 좌측에 실제 이전 화면 표시)

    // webView 바로 아래에 풀스크린 이미지뷰를 깔아둔다. webView 가 우측으로 밀리면
    // 좌측에서 이 스냅샷이 드러나 '이전 화면이 따라 들어오는' 네이티브 느낌이 난다.
    private func setupPreviousPageSnapshotView() {
        guard let webView = self.webView else { return }
        let iv = UIImageView(frame: view.bounds)
        iv.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        iv.contentMode = .scaleAspectFill
        iv.clipsToBounds = true
        iv.isUserInteractionEnabled = false
        iv.isHidden = true
        iv.backgroundColor = view.backgroundColor
        view.insertSubview(iv, belowSubview: webView)
        previousPageSnapshotView = iv
    }

    // url 변경(풀 내비게이션 + SPA pushState 모두 KVO 발화)을 감지해 현재 페이지를 스냅샷.
    // Capacitor 의 navigationDelegate 를 건드리지 않으므로 안전하다.
    private func observeNavigationForSnapshots() {
        guard let webView = self.webView, !isObservingURL else { return }
        webView.addObserver(self, forKeyPath: #keyPath(WKWebView.url), options: [.new], context: nil)
        isObservingURL = true
    }

    override func observeValue(forKeyPath keyPath: String?, of object: Any?,
                              change: [NSKeyValueChangeKey: Any]?, context: UnsafeMutableRawPointer?) {
        if keyPath == #keyPath(WKWebView.url) {
            scheduleSnapshotCapture()
        } else {
            super.observeValue(forKeyPath: keyPath, of: object, change: change, context: context)
        }
    }

    // 렌더가 안정될 시간을 두고(0.35s) 디바운스 캡처
    private func scheduleSnapshotCapture() {
        NSObject.cancelPreviousPerformRequests(withTarget: self,
                                               selector: #selector(captureCurrentPageSnapshot),
                                               object: nil)
        perform(#selector(captureCurrentPageSnapshot), with: nil, afterDelay: 0.35)
    }

    @objc private func captureCurrentPageSnapshot() {
        guard let webView = self.webView, webView.bounds.width > 0 else { return }
        // 스와이프로 webView 가 변형된 상태에서는 캡처 금지 (기울어진 화면 저장 방지)
        guard webView.transform.isIdentity else { return }
        let depth = webView.backForwardList.backList.count
        let config = WKSnapshotConfiguration()
        config.rect = webView.bounds
        webView.takeSnapshot(with: config) { [weak self] image, _ in
            guard let self = self, let image = image else { return }
            self.pageSnapshots[depth] = image
            self.trimSnapshotCache(currentDepth: depth)
        }
    }

    private func trimSnapshotCache(currentDepth: Int) {
        guard pageSnapshots.count > maxSnapshotCache else { return }
        for key in pageSnapshots.keys where key < currentDepth - maxSnapshotCache {
            pageSnapshots.removeValue(forKey: key)
        }
    }

    // 스와이프 시작 시 '돌아갈 페이지'(현재 깊이 - 1)의 스냅샷을 webView 뒤에 세팅
    private func preparePreviousSnapshotForSwipe() {
        guard let webView = self.webView, let snap = previousPageSnapshotView else { return }
        let targetDepth = webView.backForwardList.backList.count - 1
        snap.image = targetDepth >= 0 ? pageSnapshots[targetDepth] : nil
        // 스냅샷이 없으면 최소한 테마 배경색으로라도 깔아 '검정 플래시'를 막는다
        snap.backgroundColor = view.backgroundColor
        snap.frame = view.bounds
        view.insertSubview(snap, belowSubview: webView)
        // 네이티브 push/pop 처럼 좌측 -25% 에서 시작
        snap.transform = CGAffineTransform(translationX: -view.bounds.width * 0.25, y: 0)
        snap.isHidden = false
    }

    // 손가락 진행도에 맞춰 이전 페이지가 -25% → 0 으로 따라 들어오는 패럴럭스
    private func updatePreviousSnapshotParallax(translation: CGPoint) {
        guard let snap = previousPageSnapshotView else { return }
        let isFromLeftEdge = swipeStartLocation.x <= backSwipeEdgeWidth
        let width = view.bounds.width
        if !isFromLeftEdge || translation.x <= 0 || width <= 0 {
            snap.transform = CGAffineTransform(translationX: -width * 0.25, y: 0)
            return
        }
        let progress = min(1.0, max(0, translation.x / width))
        let startOffset = -width * 0.25
        snap.transform = CGAffineTransform(translationX: startOffset * (1 - progress), y: 0)
    }

    private func hidePreviousSnapshot() {
        guard let snap = previousPageSnapshotView else { return }
        snap.isHidden = true
        snap.image = nil
        snap.transform = .identity
    }

    // 세로 스크롤 등 WKWebView 자체 제스처와 충돌 안 나도록 동시 인식 허용
    func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer,
                           shouldRecognizeSimultaneouslyWith otherGestureRecognizer: UIGestureRecognizer) -> Bool {
        return true
    }

    // 스크롤 우세인 제스처는 시작 자체를 막아서 오인식 줄이기
    func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer,
                           shouldRequireFailureOf otherGestureRecognizer: UIGestureRecognizer) -> Bool {
        return false
    }

    func gestureRecognizerShouldBegin(_ gestureRecognizer: UIGestureRecognizer) -> Bool {
        // 시작 위치가 좌측 에지 영역 안일 때만 추적 시작
        let start = gestureRecognizer.location(in: view).x
        return start <= backSwipeEdgeWidth
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
