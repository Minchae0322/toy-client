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

    // Chrome iOS 스타일 — 손가락 따라 살짝 따라오는 둥근 chevron
    private var swipeIndicator: UIView?
    private let indicatorSize: CGFloat = 44
    private let indicatorHiddenX: CGFloat = -56

    override func viewDidLoad() {
        super.viewDidLoad()
        applyAdaptiveBackground()
        self.webView?.allowsBackForwardNavigationGestures = true
        installWiderBackSwipeGesture()
        setupSwipeIndicator()
    }

    override func traitCollectionDidChange(_ previousTraitCollection: UITraitCollection?) {
        super.traitCollectionDidChange(previousTraitCollection)
        applyAdaptiveBackground()
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

        case .changed:
            updateSwipeIndicator(translation: translation)

        case .ended, .cancelled:
            let isFromLeftEdge = swipeStartLocation.x <= backSwipeEdgeWidth
            let isHorizontalDominant = abs(translation.x) > abs(translation.y) * backSwipeHorizontalRatio
            let isFarEnough = translation.x >= backSwipeMinDistance
            let shouldGoBack = isFromLeftEdge && isHorizontalDominant && isFarEnough

            if shouldGoBack {
                animateIndicatorOut(success: true) { [weak webView] in
                    webView?.goBack()
                }
            } else {
                animateIndicatorOut(success: false, completion: nil)
            }

        default:
            break
        }
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
