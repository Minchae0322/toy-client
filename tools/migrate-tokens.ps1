# tools/migrate-tokens.ps1
#
# Replace hex colors inside <style> blocks of .vue files with design tokens var(--*).
# - Only touches <style ...> ... </style>, never <template>/<script>.
# - Case-insensitive hex matching (handles both #7c3aed and #7C3AED).
# - Uses \b boundary so #ef4444 in a longer hex like #ef44441 is not matched.
# - In-place save as UTF-8 (no BOM).
# - Usage:  powershell.exe -File tools/migrate-tokens.ps1 -Path <dir-or-file>

param(
    [Parameter(Mandatory = $true)]
    [string]$Path
)

# Pattern -> replacement. Order matters: longer/more-specific first.
$rules = @(
    # Brand
    @{ p = '(?i)#7c3aed\b';  r = 'var(--c-brand-hover)' }
    @{ p = '(?i)#9333ea\b';  r = 'var(--c-brand)' }
    @{ p = '(?i)#faf5ff\b';  r = 'var(--c-brand-soft)' }
    @{ p = '(?i)#f3e8ff\b';  r = 'var(--c-brand-soft)' }
    @{ p = '(?i)#f5f3ff\b';  r = 'var(--c-brand-soft)' }
    @{ p = '(?i)#f0ebf5\b';  r = 'var(--c-brand-soft)' }
    @{ p = '(?i)#ede9f8\b';  r = 'var(--border-default)' }

    # Ink (strongest text / dark button bg)
    @{ p = '(?i)#0a0e1a\b';  r = 'var(--c-ink-900)' }
    @{ p = '(?i)#1e293b\b';  r = 'var(--c-ink-700)' }

    # text-primary (general dark text)
    @{ p = '(?i)#111827\b';  r = 'var(--text-primary)' }
    @{ p = '(?i)#1f2937\b';  r = 'var(--text-primary)' }
    @{ p = '(?i)#1a1a1a\b';  r = 'var(--text-primary)' }
    @{ p = '(?i)#1c1917\b';  r = 'var(--text-primary)' }
    @{ p = '(?i)#18181b\b';  r = 'var(--text-primary)' }

    # text-600
    @{ p = '(?i)#374151\b';  r = 'var(--c-text-600)' }
    @{ p = '(?i)#475569\b';  r = 'var(--c-text-600)' }
    @{ p = '(?i)#4b5563\b';  r = 'var(--c-text-600)' }
    @{ p = '(?i)#3f3f46\b';  r = 'var(--c-text-600)' }

    # text-500
    @{ p = '(?i)#64748b\b';  r = 'var(--c-text-500)' }
    @{ p = '(?i)#6b7280\b';  r = 'var(--c-text-500)' }
    @{ p = '(?i)#71717a\b';  r = 'var(--c-text-500)' }

    # text-400
    @{ p = '(?i)#94a3b8\b';  r = 'var(--c-text-400)' }
    @{ p = '(?i)#9ca3af\b';  r = 'var(--c-text-400)' }
    @{ p = '(?i)#a1a1aa\b';  r = 'var(--c-text-400)' }
    @{ p = '(?i)#a8a29e\b';  r = 'var(--c-text-400)' }
    @{ p = '(?i)#a3a3a3\b';  r = 'var(--c-text-400)' }
    @{ p = '(?i)#b0b0b0\b';  r = 'var(--c-text-400)' }
    @{ p = '(?i)#909094\b';  r = 'var(--c-text-400)' }

    # text-300 (lightest)
    @{ p = '(?i)#cbd5e1\b';  r = 'var(--c-text-300)' }
    @{ p = '(?i)#d4d4d8\b';  r = 'var(--c-text-300)' }

    # Border (thin)
    @{ p = '(?i)#f1f3f6\b';  r = 'var(--border-default)' }
    @{ p = '(?i)#efefef\b';  r = 'var(--border-default)' }
    @{ p = '(?i)#f3f4f6\b';  r = 'var(--border-default)' }

    # Border (strong)
    @{ p = '(?i)#e5e7eb\b';  r = 'var(--border-strong)' }
    @{ p = '(?i)#e4e4e7\b';  r = 'var(--border-strong)' }
    @{ p = '(?i)#e4e4e6\b';  r = 'var(--border-strong)' }
    @{ p = '(?i)#eaeaeb\b';  r = 'var(--border-strong)' }

    # bg-mute
    @{ p = '(?i)#f2f4f6\b';  r = 'var(--bg-mute)' }
    @{ p = '(?i)#f4f4f5\b';  r = 'var(--bg-mute)' }

    # bg-subtle
    @{ p = '(?i)#f7f8fa\b';  r = 'var(--bg-subtle)' }
    @{ p = '(?i)#f5f5f5\b';  r = 'var(--bg-subtle)' }
    @{ p = '(?i)#f5f5f6\b';  r = 'var(--bg-subtle)' }
    @{ p = '(?i)#f0f0f1\b';  r = 'var(--bg-subtle)' }
    @{ p = '(?i)#f0f0f0\b';  r = 'var(--bg-subtle)' }
    @{ p = '(?i)#f8f8fa\b';  r = 'var(--bg-subtle)' }
    @{ p = '(?i)#f9f9fa\b';  r = 'var(--bg-subtle)' }
    @{ p = '(?i)#f8fafc\b';  r = 'var(--bg-subtle)' }
    @{ p = '(?i)#f5f5f7\b';  r = 'var(--bg-subtle)' }
    @{ p = '(?i)#fafafa\b';  r = 'var(--bg-subtle)' }
    @{ p = '(?i)#f9f9f9\b';  r = 'var(--bg-subtle)' }
    @{ p = '(?i)#f8f8f8\b';  r = 'var(--bg-subtle)' }

    # Semantic - success
    @{ p = '(?i)#16a34a\b';  r = 'var(--c-success)' }
    @{ p = '(?i)#22c55e\b';  r = 'var(--c-success)' }
    @{ p = '(?i)#10b981\b';  r = 'var(--c-success)' }
    @{ p = '(?i)#00c853\b';  r = 'var(--c-success)' }
    @{ p = '(?i)#1dcd9f\b';  r = 'var(--c-success)' }
    @{ p = '(?i)#dcfce7\b';  r = 'var(--c-success-soft)' }
    @{ p = '(?i)#ecfdf5\b';  r = 'var(--c-success-soft)' }

    # Semantic - warning
    @{ p = '(?i)#eab308\b';  r = 'var(--c-warning)' }
    @{ p = '(?i)#facc15\b';  r = 'var(--c-warning)' }
    @{ p = '(?i)#f59e0b\b';  r = 'var(--c-warning)' }
    @{ p = '(?i)#fef9c3\b';  r = 'var(--c-warning-soft)' }
    @{ p = '(?i)#fef3c7\b';  r = 'var(--c-warning-soft)' }

    # Semantic - danger
    @{ p = '(?i)#ef4444\b';  r = 'var(--c-danger)' }
    @{ p = '(?i)#dc2626\b';  r = 'var(--c-danger)' }
    @{ p = '(?i)#f87171\b';  r = 'var(--c-danger)' }
    @{ p = '(?i)#fee2e2\b';  r = 'var(--c-danger-soft)' }
    @{ p = '(?i)#fef2f2\b';  r = 'var(--c-danger-soft)' }

    # Semantic - heat
    @{ p = '(?i)#f97316\b';  r = 'var(--c-heat)' }
    @{ p = '(?i)#fb923c\b';  r = 'var(--c-heat)' }
    @{ p = '(?i)#fff7ed\b';  r = 'var(--c-heat-soft)' }

    # 3-char hex when followed by ; (so 'background: #fff;' but NOT '#fff0' in a longer literal)
    @{ p = '#000\s*;'; r = 'var(--c-ink-900);' }
    @{ p = '#111\s*;'; r = 'var(--text-primary);' }
    @{ p = '#222\s*;'; r = 'var(--text-primary);' }
    @{ p = '#333\s*;'; r = 'var(--text-primary);' }
    @{ p = '#444\s*;'; r = 'var(--c-text-600);' }
    @{ p = '#555\s*;'; r = 'var(--c-text-600);' }
    @{ p = '#666\s*;'; r = 'var(--c-text-500);' }
    @{ p = '#777\s*;'; r = 'var(--c-text-500);' }
    @{ p = '#888\s*;'; r = 'var(--c-text-400);' }
    @{ p = '#999\s*;'; r = 'var(--c-text-400);' }
    @{ p = '#aaa\s*;'; r = 'var(--c-text-400);' }
    @{ p = '#bbb\s*;'; r = 'var(--c-text-300);' }
    @{ p = '#ccc\s*;'; r = 'var(--c-text-300);' }
    @{ p = '#ddd\s*;'; r = 'var(--border-strong);' }
    @{ p = '#eee\s*;'; r = 'var(--border-strong);' }

    # 6-char 검정/짙은 회색 (자주 박힌 패턴)
    @{ p = '(?i)#000000\b'; r = 'var(--c-ink-900)' }
    @{ p = '(?i)#111111\b'; r = 'var(--text-primary)' }
    @{ p = '(?i)#222222\b'; r = 'var(--text-primary)' }

    # Toss-style gray scale (디자인 시스템 표 외, 코드에 자주 박힌 톤)
    @{ p = '(?i)#fcfcfd\b';  r = 'var(--bg-subtle)' }
    @{ p = '(?i)#fafbfc\b';  r = 'var(--bg-subtle)' }
    @{ p = '(?i)#f2f4f7\b';  r = 'var(--bg-subtle)' }
    @{ p = '(?i)#e5e8ec\b';  r = 'var(--border-default)' }
    @{ p = '(?i)#eaedf1\b';  r = 'var(--border-default)' }
    @{ p = '(?i)#dfe3e8\b';  r = 'var(--border-strong)' }
    @{ p = '(?i)#8b95a1\b';  r = 'var(--c-text-400)' }
    @{ p = '(?i)#4e5968\b';  r = 'var(--c-text-600)' }
    @{ p = '(?i)#6b7684\b';  r = 'var(--c-text-500)' }
    @{ p = '(?i)#b0b8c1\b';  r = 'var(--c-text-300)' }
    @{ p = '(?i)#c4c9d0\b';  r = 'var(--c-text-300)' }
    @{ p = '(?i)#e2e8f0\b';  r = 'var(--border-strong)' }

    # Toss-style 추가 (FeedList/배틀에서 발견)
    @{ p = '(?i)#fdfeff\b';  r = 'var(--bg-elevated)' }
    @{ p = '(?i)#f9fafb\b';  r = 'var(--bg-subtle)' }
    @{ p = '(?i)#fafafb\b';  r = 'var(--bg-subtle)' }
    @{ p = '(?i)#ececf0\b';  r = 'var(--border-strong)' }
    @{ p = '(?i)#191f28\b';  r = 'var(--text-primary)' }
    @{ p = '(?i)#1a1a1e\b';  r = 'var(--text-primary)' }

    # Brand variants (FeedDetail, 배틀에서 발견)
    @{ p = '(?i)#f9f6fd\b';  r = 'var(--c-brand-soft)' }
    @{ p = '(?i)#ece5f5\b';  r = 'var(--c-brand-soft)' }
    @{ p = '(?i)#e9d5ff\b';  r = 'var(--c-brand-soft)' }
    @{ p = '(?i)#7e22ce\b';  r = 'var(--c-brand)' }
    @{ p = '(?i)#8b2de0\b';  r = 'var(--c-brand)' }

    # 평가 배지 — soft 배경 위 진한 텍스트 (다크에서 안 보이는 색을 메인 컬러로)
    @{ p = '(?i)(color\s*:\s*)#92400e\b';  r = '${1}var(--c-warning)' }
    @{ p = '(?i)(color\s*:\s*)#166534\b';  r = '${1}var(--c-success)' }
    @{ p = '(?i)(color\s*:\s*)#6b21a8\b';  r = '${1}var(--c-brand)' }
    @{ p = '(?i)(color\s*:\s*)#991b1b\b';  r = '${1}var(--c-danger)' }
    @{ p = '(?i)(color\s*:\s*)#581c87\b';  r = '${1}var(--c-brand)' }

    # Semantic soft 배경 추가
    @{ p = '(?i)#fffbf0\b';  r = 'var(--c-warning-soft)' }
    @{ p = '(?i)#fffbeb\b';  r = 'var(--c-warning-soft)' }
    @{ p = '(?i)#fde68a\b';  r = 'var(--c-warning)' }
    @{ p = '(?i)#fff5f5\b';  r = 'var(--c-danger-soft)' }
    @{ p = '(?i)#f43f5e\b';  r = 'var(--c-danger)' }

    # Info (블루 — 카테고리/배틀 디테일에서 발견)
    @{ p = '(?i)#4a6cf7\b';  r = 'var(--c-info)' }
    @{ p = '(?i)#3b82f6\b';  r = 'var(--c-info)' }
    @{ p = '(?i)#3a5ce7\b';  r = 'var(--c-info-hover)' }
    @{ p = '(?i)#eff2ff\b';  r = 'var(--c-info-soft)' }
    @{ p = '(?i)#eff6ff\b';  r = 'var(--c-info-soft)' }
    @{ p = '(?i)#f5f7ff\b';  r = 'var(--c-info-soft)' }
    @{ p = '(?i)#dbeafe\b';  r = 'var(--c-info-soft)' }
    @{ p = '(?i)#dde3f8\b';  r = 'var(--c-info-soft)' }

    # Tailwind slate 스케일 (카테고리)
    @{ p = '(?i)#0f172a\b';  r = 'var(--text-primary)' }
    @{ p = '(?i)#cbd5e0\b';  r = 'var(--c-text-300)' }
    @{ p = '(?i)#f1f5f9\b';  r = 'var(--bg-subtle)' }
    @{ p = '(?i)#f0fdf4\b';  r = 'var(--c-success-soft)' }

    # iOS systemGray 스케일 (CommonCategoryFilter 등)
    @{ p = '(?i)#f2f2f7\b';  r = 'var(--bg-mute)' }
    @{ p = '(?i)#3a3a3c\b';  r = 'var(--c-text-600)' }
    @{ p = '(?i)#8e8e93\b';  r = 'var(--c-text-400)' }
    @{ p = '(?i)#d1d5db\b';  r = 'var(--c-text-300)' }
    @{ p = '(?i)#d1d1d6\b';  r = 'var(--c-text-300)' }
    @{ p = '(?i)#c084fc\b';  r = 'var(--c-brand)' }

    # Bootstrap 계열 그레이 (DashboardBattles)
    @{ p = '(?i)#333d4b\b';  r = 'var(--text-primary)' }
    @{ p = '(?i)#adb5bd\b';  r = 'var(--c-text-400)' }
    @{ p = '(?i)#e9ecef\b';  r = 'var(--bg-mute)' }
    @{ p = '(?i)#d1d6db\b';  r = 'var(--c-text-300)' }
    @{ p = '(?i)#f1f3f5\b';  r = 'var(--bg-subtle)' }
    @{ p = '(?i)#d8b4fe\b';  r = 'var(--c-brand-soft)' }
    @{ p = '(?i)#6366f1\b';  r = 'var(--c-info)' }
)

$utf8NoBom = New-Object System.Text.UTF8Encoding $false
$files = Get-ChildItem -Path $Path -Recurse -Filter *.vue -File
$changedCount = 0

foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file.FullName, $utf8NoBom)
    $original = $content

    $stylePattern = '(?s)(<style[^>]*>)(.*?)(</style>)'
    $content = [regex]::Replace($content, $stylePattern, {
        param($m)
        $open  = $m.Groups[1].Value
        $body  = $m.Groups[2].Value
        $close = $m.Groups[3].Value

        # Step 1: Protect `color: #fff` and `color: #ffffff` (브랜드/검정 버튼 위 흰 글씨는 raw 유지)
        $body = [regex]::Replace($body, '(?i)(color\s*:\s*)#ffffff\b', '${1}__KEEP6F__')
        $body = [regex]::Replace($body, '(?i)(color\s*:\s*)#fff\b',   '${1}__KEEP3F__')

        # Step 2: Apply rule table
        foreach ($rule in $rules) {
            $body = [regex]::Replace($body, $rule.p, $rule.r)
        }

        # Step 3: White → bg-elevated (Step 1에서 보호된 color는 안전)
        $body = [regex]::Replace($body, '(?i)#ffffff\b', 'var(--bg-elevated)')
        $body = [regex]::Replace($body, '#fff\b',       'var(--bg-elevated)')

        # Step 4: 보호 마커 복원
        $body = $body.Replace('__KEEP6F__', '#ffffff').Replace('__KEEP3F__', '#fff')

        # Step 5: 텍스트 용도 ink 토큰을 text alias 로 분리
        # (--c-ink-900 은 다크에서 검정 유지. 본문 텍스트는 자동 반전 alias 필요)
        $body = [regex]::Replace($body, '(?i)(color\s*:\s*)var\(--c-ink-900\)', '${1}var(--text-primary)')
        $body = [regex]::Replace($body, '(?i)(color\s*:\s*)var\(--c-ink-700\)', '${1}var(--c-text-600)')

        # Step 6: 페이지 wrapper 배경은 var(--bg-elevated) 가 아니라 var(--bg-base).
        # body 와 톤 일치 시키기 위함 (그러지 않으면 다크에서 한 톤 차이 생김)
        $body = [regex]::Replace($body, '(?s)(\.app-container\s*\{[^}]*?background\s*:\s*)var\(--bg-elevated\)', '${1}var(--bg-base)')
        $body = [regex]::Replace($body, '(?s)(\.page-container\s*\{[^}]*?background\s*:\s*)var\(--bg-elevated\)', '${1}var(--bg-base)')

        # Step 6-b: 페이지 단위로 :root 안에 local --bg / --card alias 가 var(--bg-elevated) 로 정의된 경우 — body 와 일치 시킴
        $body = [regex]::Replace($body, '(?s)(:root\s*\{[^}]*?--bg\s*:\s*)var\(--bg-elevated\)', '${1}var(--bg-base)')

        # Step 6-c: active 상태 배경에 var(--text-primary) 가 쓰이면 다크에서 흰 배경 됨.
        # 그 위 텍스트가 #ffffff 면 흰배경+흰글씨 → 안 보임.
        # 해결: 배경을 var(--c-ink-900) (검정 유지)로. 다크에서도 검정 카드 → 흰 글씨 OK.
        $body = [regex]::Replace($body, '(?i)(background\s*:\s*)var\(--text-primary\)', '${1}var(--c-ink-900)')
        $body = [regex]::Replace($body, '(?i)(background-color\s*:\s*)var\(--text-primary\)', '${1}var(--c-ink-900)')
        $body = [regex]::Replace($body, '(?i)(border-color\s*:\s*)var\(--text-primary\)', '${1}var(--c-ink-900)')

        # Step 7: 텍스트 raw hex (위 매핑에서 놓친 케이스)
        $body = [regex]::Replace($body, '(?i)(color\s*:\s*)#191F28\b', '${1}var(--text-primary)')
        $body = [regex]::Replace($body, '(?i)(color\s*:\s*)#0A0E1A\b', '${1}var(--text-primary)')

        return $open + $body + $close
    })

    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($file.FullName, $content, $utf8NoBom)
        Write-Output ("modified: " + $file.FullName)
        $changedCount++
    }
}

Write-Output ""
Write-Output ("changed files: " + $changedCount)
