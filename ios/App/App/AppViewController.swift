import UIKit
import Capacitor

class AppViewController: CAPBridgeViewController, UIGestureRecognizerDelegate {

    // iOS 시스템 에지 스와이프 영역(~20px)보다 넉넉하게 — Chrome iOS와 유사한 좌측 80px 인식 영역
    private let backSwipeEdgeWidth: CGFloat = 80
    // 뒤로가기 트리거 최소 수평 이동량
    private let backSwipeMinDistance: CGFloat = 60
    // 수평 우세 판정 (수직 대비 1.4배 이상 수평일 때만 뒤로가기로 인정)
    private let backSwipeHorizontalRatio: CGFloat = 1.4

    private var swipeStartLocation: CGPoint = .zero

    override func viewDidLoad() {
        super.viewDidLoad()
        // 시스템 기본 에지 스와이프도 유지 (좁은 영역에서도 익숙한 사용자 위해)
        self.webView?.allowsBackForwardNavigationGestures = true
        installWiderBackSwipeGesture()
    }

    private func installWiderBackSwipeGesture() {
        let pan = UIPanGestureRecognizer(target: self, action: #selector(handleBackSwipe(_:)))
        pan.maximumNumberOfTouches = 1
        pan.delegate = self
        view.addGestureRecognizer(pan)
    }

    @objc private func handleBackSwipe(_ gesture: UIPanGestureRecognizer) {
        guard let webView = self.webView, webView.canGoBack else { return }

        switch gesture.state {
        case .began:
            swipeStartLocation = gesture.location(in: view)

        case .ended, .cancelled:
            let translation = gesture.translation(in: view)
            let isFromLeftEdge = swipeStartLocation.x <= backSwipeEdgeWidth
            let isHorizontalDominant = abs(translation.x) > abs(translation.y) * backSwipeHorizontalRatio
            let isFarEnough = translation.x >= backSwipeMinDistance
            if isFromLeftEdge && isHorizontalDominant && isFarEnough {
                webView.goBack()
            }

        default:
            break
        }
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
