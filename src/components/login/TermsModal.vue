<template>
  <Teleport to="body">
    <Transition name="terms-modal">
      <div v-if="visible" class="terms-overlay" @click.self="close">
        <div class="terms-container">
          <!-- 헤더 -->
          <div class="terms-header">
            <div class="terms-tabs">
              <button
                class="tab-btn"
                :class="{ active: activeTab === 'terms' }"
                @click="activeTab = 'terms'"
              >
                이용약관
              </button>
              <button
                class="tab-btn"
                :class="{ active: activeTab === 'privacy' }"
                @click="activeTab = 'privacy'"
              >
                개인정보처리방침
              </button>
            </div>
            <button class="close-btn" @click="close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <!-- 본문 -->
          <div class="terms-body">
            <div v-if="activeTab === 'terms'" class="terms-content">
              <h2>ToyChat 이용약관</h2>
              <p class="terms-date">시행일: 2026년 2월 1일</p>

              <h3>제1조 (목적)</h3>
              <p>이 약관은 ToyChat(이하 "회사")이 제공하는 인터넷 관련 서비스(이하 "서비스")를 이용함에 있어 회사와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>

              <h3>제2조 (정의)</h3>
              <ol>
                <li>"서비스"란 회사가 제공하는 상품 랭킹, 한입만 거래, 피드(인증), 배틀, 채팅 등 일체의 서비스를 의미합니다.</li>
                <li>"이용자"란 본 약관에 따라 회사가 제공하는 서비스를 이용하는 회원 및 비회원을 말합니다.</li>
                <li>"회원"이란 회사에 개인정보를 제공하여 회원등록을 한 자로서, 회사의 정보를 지속적으로 제공받으며 서비스를 계속적으로 이용할 수 있는 자를 말합니다.</li>
                <li>"게시물"이란 회원이 서비스를 이용함에 있어 서비스상에 게시한 부호, 문자, 음성, 음향, 화상, 동영상 등의 정보 형태의 글, 사진, 동영상 및 각종 파일과 링크 등을 의미합니다.</li>
              </ol>

              <h3>제3조 (약관의 게시와 개정)</h3>
              <ol>
                <li>회사는 이 약관의 내용을 이용자가 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.</li>
                <li>회사는 관련법령을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.</li>
                <li>회사가 약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여 현행 약관과 함께 서비스 초기 화면에 그 적용일자 7일 이전부터 적용일자 전일까지 공지합니다. 다만, 이용자에게 불리하게 약관내용을 변경하는 경우에는 최소한 30일 이상의 사전 유예기간을 두고 공지합니다.</li>
                <li>회원이 개정약관의 적용에 동의하지 않는 경우 회원은 이용계약을 해지(탈퇴)할 수 있습니다.</li>
              </ol>

              <h3>제4조 (이용계약의 체결)</h3>
              <ol>
                <li>이용계약은 회원이 되고자 하는 자(이하 "가입신청자")가 약관의 내용에 대하여 동의한 후 회원가입신청을 하고 회사가 이를 승낙함으로써 체결됩니다.</li>
                <li>회사는 가입신청자의 신청에 대하여 서비스 이용을 승낙함을 원칙으로 합니다. 다만, 회사는 다음 각 호에 해당하는 신청에 대하여는 승낙을 하지 않거나 사후에 이용계약을 해지할 수 있습니다.
                  <ul>
                    <li>가입신청자가 이 약관에 의하여 이전에 회원자격을 상실한 적이 있는 경우</li>
                    <li>타인의 명의를 이용한 경우</li>
                    <li>허위의 정보를 기재하거나, 회사가 제시하는 내용을 기재하지 않은 경우</li>
                    <li>만 14세 미만의 아동이 법정대리인의 동의를 얻지 않은 경우</li>
                    <li>이용자의 귀책사유로 인하여 승인이 불가능하거나 기타 규정한 제반 사항을 위반하며 신청하는 경우</li>
                  </ul>
                </li>
                <li>회사는 서비스 관련 설비의 여유가 없거나, 기술상 또는 업무상 문제가 있는 경우에는 승낙을 유보할 수 있습니다.</li>
              </ol>

              <h3>제5조 (회원정보의 변경)</h3>
              <p>회원은 개인정보 관리 화면을 통하여 언제든지 본인의 개인정보를 열람하고 수정할 수 있습니다. 다만, 서비스 관리를 위해 필요한 이메일 등은 수정이 제한될 수 있습니다.</p>

              <h3>제6조 (회원의 아이디 및 비밀번호 관리에 대한 의무)</h3>
              <ol>
                <li>회원의 아이디와 비밀번호에 관한 관리책임은 회원에게 있으며, 이를 제3자가 이용하도록 하여서는 안 됩니다.</li>
                <li>회사는 회원의 아이디가 개인정보 유출 우려가 있거나, 반사회적 또는 미풍양속에 어긋나거나, 회사 및 회사의 운영자로 오인할 우려가 있는 경우, 해당 아이디의 이용을 제한할 수 있습니다.</li>
                <li>회원은 아이디 및 비밀번호가 도용되거나 제3자가 사용하고 있음을 인지한 경우에는 즉시 회사에 통보하고 회사의 안내에 따라야 합니다.</li>
              </ol>

              <h3>제7조 (이용자의 의무)</h3>
              <p>이용자는 다음 행위를 하여서는 안 됩니다.</p>
              <ol>
                <li>신청 또는 변경 시 허위내용의 등록</li>
                <li>타인의 정보 도용</li>
                <li>회사가 게시한 정보의 변경</li>
                <li>회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
                <li>회사 및 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
                <li>회사 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
                <li>외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위</li>
                <li>서비스를 이용하여 상품을 판매하는 행위 시 관련 법령을 위반하는 행위</li>
                <li>서비스를 통해 얻은 정보를 회사의 사전 승낙 없이 서비스 이용 이외의 목적으로 복제하거나 이를 출판 및 방송 등에 사용하거나 제3자에게 제공하는 행위</li>
                <li>기타 불법적이거나 부당한 행위</li>
              </ol>

              <h3>제8조 (서비스의 제공 및 변경)</h3>
              <ol>
                <li>회사는 이용자에게 아래와 같은 서비스를 제공합니다.
                  <ul>
                    <li>상품 랭킹 서비스 (HOT 100)</li>
                    <li>한입만 거래 서비스 (상품 등록, 거래)</li>
                    <li>피드(인증) 서비스 (게시물 작성, 팔로우)</li>
                    <li>배틀 서비스 (월간 상품 배틀)</li>
                    <li>채팅 서비스 (실시간 메시지)</li>
                    <li>기타 회사가 추가 개발하거나 다른 회사와의 제휴계약 등을 통해 회원에게 제공하는 일체의 서비스</li>
                  </ul>
                </li>
                <li>회사는 서비스의 내용을 변경하는 경우 변경 내용을 이용자에게 통지합니다.</li>
              </ol>

              <h3>제9조 (서비스의 중단)</h3>
              <ol>
                <li>회사는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.</li>
                <li>회사는 제1항의 사유로 서비스의 제공이 일시적으로 중단됨으로 인하여 이용자 또는 제3자가 입은 손해에 대하여 배상합니다. 단, 회사에 고의 또는 과실이 없는 경우에는 그러하지 아니합니다.</li>
              </ol>

              <h3>제10조 (게시물의 관리)</h3>
              <ol>
                <li>회원의 게시물이 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 및 기타 관계 법령에 위반되는 내용을 포함하는 경우, 권리자는 관련 법령이 정한 절차에 따라 해당 게시물의 게시중단 및 삭제 등을 요청할 수 있으며, 회사는 관련 법령에 따라 조치를 취하여야 합니다.</li>
                <li>회사는 전항에 따른 권리자의 요청이 없는 경우라도 권리침해가 인정될 만한 사유가 있거나 기타 회사 정책 및 관련 법령에 위반되는 경우에는 관련 법령에 따라 해당 게시물에 대해 임시조치 등을 취할 수 있습니다.</li>
              </ol>

              <h3>제11조 (저작권의 귀속 및 이용제한)</h3>
              <ol>
                <li>회사가 작성한 저작물에 대한 저작권 기타 지적재산권은 회사에 귀속합니다.</li>
                <li>이용자는 서비스를 이용함으로써 얻은 정보 중 회사에게 지적재산권이 귀속된 정보를 회사의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송 기타 방법에 의하여 영리목적으로 이용하거나 제3자에게 이용하게 하여서는 안 됩니다.</li>
                <li>회원이 서비스 내에 게시한 게시물의 저작권은 해당 게시물의 저작자에게 귀속됩니다. 단, 회사는 서비스의 운영, 전시, 전송, 배포, 홍보 등의 목적으로 별도의 허락 없이 무상으로 저작권법 및 공정한 관행에 합치되는 범위 내에서 회원이 등록한 게시물을 사용할 수 있습니다.</li>
              </ol>

              <h3>제12조 (이용계약 해지)</h3>
              <ol>
                <li>회원은 언제든지 서비스 내 "마이페이지" 메뉴 등을 통하여 이용계약 해지(회원탈퇴) 신청을 할 수 있으며, 회사는 관련 법령 등이 정하는 바에 따라 이를 즉시 처리하여야 합니다.</li>
                <li>회원이 계약을 해지할 경우, 관련 법령 및 개인정보처리방침에 따라 회사가 회원정보를 보유하는 경우를 제외하고는 해지 즉시 회원의 모든 데이터는 소멸됩니다.</li>
                <li>회원이 계약을 해지하는 경우, 회원이 작성한 게시물 중 커뮤니티 게시판 등에 등록된 게시물은 삭제되지 않으므로, 사전에 삭제 후 탈퇴하시기 바랍니다.</li>
              </ol>

              <h3>제13조 (손해배상)</h3>
              <ol>
                <li>회사 또는 이용자는 본 약관을 위반하여 상대방에게 손해를 입힌 경우에는 그 손해를 배상할 책임이 있습니다. 다만, 고의 또는 과실이 없는 경우에는 그러하지 아니합니다.</li>
                <li>회사는 무료로 제공되는 서비스와 관련하여 회원에게 어떠한 손해가 발생하더라도 회사가 고의 또는 중과실로 인한 손해의 경우를 제외하고 이에 대하여 책임을 지지 않습니다.</li>
              </ol>

              <h3>제14조 (면책조항)</h3>
              <ol>
                <li>회사는 천재지변, 전쟁, 기간통신사업자의 서비스 중지 및 기타 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.</li>
                <li>회사는 이용자의 귀책사유로 인한 서비스 이용의 장애에 대하여 책임을 지지 않습니다.</li>
                <li>회사는 이용자가 서비스를 이용하여 기대하는 수익을 상실한 것에 대하여 책임을 지지 않으며, 서비스를 통하여 얻은 자료로 인한 손해에 관하여 책임을 지지 않습니다.</li>
                <li>회사는 이용자 간 또는 이용자와 제3자 간에 서비스를 매개로 하여 거래 등을 한 경우에는 책임이 면제됩니다.</li>
              </ol>

              <h3>제15조 (분쟁해결)</h3>
              <ol>
                <li>회사는 이용자가 제기하는 정당한 의견이나 불만을 반영하고 그 피해를 보상처리하기 위하여 고충처리 절차를 마련합니다.</li>
                <li>회사와 이용자 간에 발생한 전자상거래 분쟁에 관하여는 이용자의 피해구제 신청이 있는 경우에는 공정거래위원회 또는 시·도지사가 의뢰하는 분쟁조정기관의 조정에 따를 수 있습니다.</li>
              </ol>

              <h3>제16조 (준거법 및 재판관할)</h3>
              <ol>
                <li>회사와 이용자 간에 발생한 분쟁에 관한 소송은 대한민국 법을 준거법으로 합니다.</li>
                <li>회사와 이용자 간에 발생한 분쟁에 관한 소송은 민사소송법상의 관할법원에 제기합니다.</li>
              </ol>

              <p class="terms-footer">부칙: 이 약관은 2026년 2월 1일부터 시행합니다.</p>
            </div>

            <div v-if="activeTab === 'privacy'" class="terms-content">
              <h2>ToyChat 개인정보처리방침</h2>
              <p class="terms-date">시행일: 2026년 2월 1일</p>

              <p>ToyChat(이하 "회사")은 「개인정보 보호법」 제30조에 따라 정보주체의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보처리방침을 수립·공개합니다.</p>

              <h3>제1조 (개인정보의 처리 목적)</h3>
              <p>회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 「개인정보 보호법」 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.</p>
              <ol>
                <li><strong>회원 가입 및 관리:</strong> 회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증, 회원자격 유지·관리, 서비스 부정이용 방지, 각종 고지·통지 목적으로 개인정보를 처리합니다.</li>
                <li><strong>서비스 제공:</strong> 상품 랭킹, 한입만 거래, 피드, 배틀, 채팅 등 콘텐츠 제공, 맞춤서비스 제공, 본인인증 목적으로 개인정보를 처리합니다.</li>
                <li><strong>고충처리:</strong> 민원인의 신원 확인, 민원사항 확인, 사실조사를 위한 연락·통지, 처리결과 통보 목적으로 개인정보를 처리합니다.</li>
              </ol>

              <h3>제2조 (개인정보의 처리 및 보유 기간)</h3>
              <ol>
                <li>회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.</li>
                <li>각각의 개인정보 처리 및 보유 기간은 다음과 같습니다.
                  <ul>
                    <li><strong>회원 가입 및 관리:</strong> 회원 탈퇴 시까지. 다만, 다음의 사유에 해당하는 경우에는 해당 사유 종료 시까지
                      <ul>
                        <li>관계 법령 위반에 따른 수사·조사 등이 진행 중인 경우: 해당 수사·조사 종료 시까지</li>
                        <li>서비스 이용에 따른 채권·채무관계 잔존 시: 해당 채권·채무관계 정산 시까지</li>
                      </ul>
                    </li>
                    <li><strong>전자상거래에서의 소비자 보호에 관한 법률에 따른 보존:</strong>
                      <ul>
                        <li>계약 또는 청약철회 등에 관한 기록: 5년</li>
                        <li>대금결제 및 재화 등의 공급에 관한 기록: 5년</li>
                        <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년</li>
                        <li>표시·광고에 관한 기록: 6개월</li>
                      </ul>
                    </li>
                    <li><strong>통신비밀보호법에 따른 보존:</strong>
                      <ul>
                        <li>서비스 이용 관련 개인정보(로그인 기록): 3개월</li>
                      </ul>
                    </li>
                  </ul>
                </li>
              </ol>

              <h3>제3조 (처리하는 개인정보의 항목)</h3>
              <p>회사는 다음의 개인정보 항목을 처리하고 있습니다.</p>
              <table>
                <thead>
                  <tr>
                    <th>구분</th>
                    <th>수집 항목</th>
                    <th>수집 방법</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>필수항목 (일반 회원가입)</td>
                    <td>이메일 주소, 비밀번호(암호화 저장)</td>
                    <td>회원가입 시 이용자 직접 입력</td>
                  </tr>
                  <tr>
                    <td>필수항목 (소셜 로그인)</td>
                    <td>소셜 계정 식별자, 이메일 주소, 닉네임, 프로필 이미지</td>
                    <td>소셜 로그인 연동 시 자동 수집 (Google, Kakao, GitHub)</td>
                  </tr>
                  <tr>
                    <td>서비스 이용 시 자동 수집</td>
                    <td>접속 IP 주소, 접속 로그, 서비스 이용 기록, 기기 정보(브라우저 유형, OS)</td>
                    <td>서비스 이용 과정에서 자동 생성·수집</td>
                  </tr>
                </tbody>
              </table>

              <h3>제4조 (개인정보의 제3자 제공)</h3>
              <p>회사는 정보주체의 개인정보를 제1조(개인정보의 처리 목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 「개인정보 보호법」 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.</p>

              <h3>제5조 (개인정보처리의 위탁)</h3>
              <p>회사는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.</p>
              <table>
                <thead>
                  <tr>
                    <th>위탁받는 자(수탁자)</th>
                    <th>위탁하는 업무의 내용</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Google LLC</td>
                    <td>소셜 로그인 인증 처리</td>
                  </tr>
                  <tr>
                    <td>카카오</td>
                    <td>소셜 로그인 인증 처리</td>
                  </tr>
                  <tr>
                    <td>GitHub, Inc.</td>
                    <td>소셜 로그인 인증 처리</td>
                  </tr>
                </tbody>
              </table>
              <p>회사는 위탁계약 체결 시 「개인정보 보호법」 제26조에 따라 위탁업무 수행목적 외 개인정보 처리금지, 기술적·관리적 보호조치, 재위탁 제한, 수탁자에 대한 관리·감독, 손해배상 등 책임에 관한 사항을 계약서 등 문서에 명시하고, 수탁자가 개인정보를 안전하게 처리하는지를 감독하고 있습니다.</p>

              <h3>제6조 (개인정보의 파기절차 및 파기방법)</h3>
              <ol>
                <li>회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.</li>
                <li>파기절차: 이용자가 입력한 정보는 목적 달성 후 별도의 DB에 옮겨져(종이의 경우 별도의 서류) 내부 방침 및 기타 관련 법령에 따라 일정기간 저장된 후 혹은 즉시 파기됩니다.</li>
                <li>파기방법: 전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용합니다.</li>
              </ol>

              <h3>제7조 (정보주체와 법정대리인의 권리·의무 및 행사방법)</h3>
              <ol>
                <li>정보주체는 회사에 대해 언제든지 개인정보 열람·정정·삭제·처리정지 요구 등의 권리를 행사할 수 있습니다.</li>
                <li>권리 행사는 회사에 대해 「개인정보 보호법」 시행령 제41조 제1항에 따라 서면, 전자우편 등을 통하여 하실 수 있으며, 회사는 이에 대해 지체 없이 조치하겠습니다.</li>
                <li>권리 행사는 정보주체의 법정대리인이나 위임을 받은 자 등 대리인을 통하여 하실 수도 있습니다.</li>
                <li>개인정보 열람 및 처리정지 요구는 「개인정보 보호법」 제35조 제4항, 제37조 제2항에 의하여 정보주체의 권리가 제한될 수 있습니다.</li>
                <li>개인정보의 정정 및 삭제 요구는 다른 법령에서 그 개인정보가 수집 대상으로 명시되어 있는 경우에는 그 삭제를 요구할 수 없습니다.</li>
              </ol>

              <h3>제8조 (개인정보의 안전성 확보조치)</h3>
              <p>회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.</p>
              <ol>
                <li><strong>비밀번호의 암호화:</strong> 이용자의 비밀번호는 암호화되어 저장 및 관리되고 있어, 본인만이 알 수 있으며 중요한 데이터는 파일 및 전송 데이터를 암호화하거나 파일 잠금 기능을 사용하는 등의 별도 보안기능을 사용하고 있습니다.</li>
                <li><strong>해킹 등에 대비한 기술적 대책:</strong> 회사는 해킹이나 컴퓨터 바이러스 등에 의한 개인정보 유출 및 훼손을 막기 위하여 보안프로그램을 설치하고 주기적인 갱신·점검을 하며, 외부로부터 접근이 통제된 구역에 시스템을 설치하고 기술적·물리적으로 감시 및 차단하고 있습니다.</li>
                <li><strong>개인정보에 대한 접근 제한:</strong> 개인정보를 처리하는 데이터베이스시스템에 대한 접근권한의 부여, 변경, 말소를 통하여 개인정보에 대한 접근통제를 위하여 필요한 조치를 하고 있으며, 침입차단시스템을 이용하여 외부로부터의 무단 접근을 통제하고 있습니다.</li>
                <li><strong>접속기록의 보관 및 위변조 방지:</strong> 개인정보처리시스템에 접속한 기록을 최소 1년 이상 보관·관리하고 있으며, 접속기록이 위변조 및 도난, 분실되지 않도록 보안기능을 사용하고 있습니다.</li>
              </ol>

              <h3>제9조 (개인정보를 자동으로 수집하는 장치의 설치·운영 및 거부에 관한 사항)</h3>
              <ol>
                <li>회사는 이용자에게 개별적인 맞춤서비스를 제공하기 위해 이용정보를 저장하고 수시로 불러오는 '쿠키(Cookie)'를 사용합니다.</li>
                <li>쿠키는 웹사이트를 운영하는데 이용되는 서버(HTTP)가 이용자의 컴퓨터 브라우저에게 보내는 소량의 정보이며 이용자 PC의 하드디스크에 저장되기도 합니다.
                  <ul>
                    <li><strong>쿠키의 사용 목적:</strong> 이용자가 방문한 각 서비스와 웹 사이트들에 대한 방문 및 이용형태, 인기 검색어, 보안접속 여부 등을 파악하여 이용자에게 최적화된 정보 제공을 위해 사용됩니다.</li>
                    <li><strong>쿠키의 설치·운영 및 거부:</strong> 웹브라우저 상단의 도구 > 인터넷 옵션 > 개인정보 메뉴의 옵션 설정을 통해 쿠키 저장을 거부할 수 있습니다.</li>
                    <li>쿠키 저장을 거부할 경우 맞춤형 서비스 이용에 어려움이 발생할 수 있습니다.</li>
                  </ul>
                </li>
              </ol>

              <h3>제10조 (개인정보 보호책임자)</h3>
              <p>회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.</p>
              <div class="info-box">
                <p><strong>개인정보 보호책임자</strong></p>
                <p>담당부서: 서비스운영팀</p>
                <p>연락처: support@toychat.kr</p>
              </div>

              <h3>제11조 (개인정보의 열람청구를 접수·처리하는 부서)</h3>
              <p>정보주체는 「개인정보 보호법」 제35조에 따른 개인정보의 열람 청구를 아래의 부서에 할 수 있습니다.</p>
              <div class="info-box">
                <p><strong>개인정보 열람청구 접수·처리 부서</strong></p>
                <p>담당부서: 서비스운영팀</p>
                <p>연락처: support@toychat.kr</p>
              </div>

              <h3>제12조 (권익침해 구제방법)</h3>
              <p>정보주체는 개인정보침해로 인한 구제를 받기 위하여 개인정보분쟁조정위원회, 한국인터넷진흥원 개인정보침해신고센터 등에 분쟁해결이나 상담 등을 신청할 수 있습니다.</p>
              <div class="info-box">
                <p>개인정보분쟁조정위원회: (국번없이) 1833-6972 (www.kopico.go.kr)</p>
                <p>개인정보침해신고센터: (국번없이) 118 (privacy.kisa.or.kr)</p>
                <p>대검찰청: (국번없이) 1301 (www.spo.go.kr)</p>
                <p>경찰청: (국번없이) 182 (ecrm.cyber.go.kr)</p>
              </div>

              <h3>제13조 (개인정보처리방침 변경)</h3>
              <p>이 개인정보처리방침은 2026년 2월 1일부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.</p>

              <p class="terms-footer">시행일: 2026년 2월 1일</p>
            </div>
          </div>

          <!-- 하단 버튼 -->
          <div class="terms-footer-bar">
            <button class="confirm-btn" @click="close">확인</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  initialTab: { type: String, default: 'terms' }
})

const emit = defineEmits(['close'])

const activeTab = ref(props.initialTab)

watch(() => props.initialTab, (val) => {
  activeTab.value = val
})

watch(() => props.visible, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

const close = () => {
  emit('close')
}
</script>

<style scoped>
/* ===================== 오버레이 ===================== */
.terms-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  padding: 16px;
}

/* ===================== 컨테이너 ===================== */
.terms-container {
  background: #ffffff;
  border-radius: 16px;
  width: 100%;
  max-width: 640px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.15),
    0 4px 16px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

/* ===================== 헤더 ===================== */
.terms-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 0;
  border-bottom: 1px solid #f4f4f5;
  flex-shrink: 0;
}

.terms-tabs {
  display: flex;
  gap: 0;
}

.tab-btn {
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #71717a;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: #27272a;
}

.tab-btn.active {
  color: #9333ea;
  border-bottom-color: #9333ea;
  font-weight: 600;
}

.close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  color: #a1a1aa;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.15s;
  flex-shrink: 0;
}

.close-btn:hover {
  background: #f4f4f5;
  color: #27272a;
}

/* ===================== 본문 ===================== */
.terms-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  -webkit-overflow-scrolling: touch;
}

.terms-content h2 {
  font-size: 18px;
  font-weight: 700;
  color: #18181b;
  margin: 0 0 4px;
}

.terms-date {
  font-size: 13px;
  color: #a1a1aa;
  margin: 0 0 24px;
}

.terms-content h3 {
  font-size: 14px;
  font-weight: 600;
  color: #27272a;
  margin: 24px 0 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid #f4f4f5;
}

.terms-content p {
  font-size: 13px;
  color: #52525b;
  line-height: 1.7;
  margin: 0 0 8px;
  word-break: keep-all;
}

.terms-content ol,
.terms-content ul {
  font-size: 13px;
  color: #52525b;
  line-height: 1.7;
  margin: 0 0 8px;
  padding-left: 20px;
}

.terms-content ol li,
.terms-content ul li {
  margin-bottom: 4px;
}

.terms-content ul ul,
.terms-content ol ul {
  margin-top: 4px;
  margin-bottom: 4px;
}

.terms-content table {
  width: 100%;
  border-collapse: collapse;
  margin: 8px 0 16px;
  font-size: 13px;
}

.terms-content table th,
.terms-content table td {
  padding: 8px 10px;
  border: 1px solid #e4e4e7;
  text-align: left;
  color: #52525b;
}

.terms-content table th {
  background: #fafafa;
  font-weight: 600;
  color: #27272a;
}

.info-box {
  background: #fafafa;
  border: 1px solid #f4f4f5;
  border-radius: 8px;
  padding: 12px 14px;
  margin: 8px 0 16px;
}

.info-box p {
  margin: 0 0 2px;
  font-size: 13px;
  color: #52525b;
}

.terms-footer {
  margin-top: 24px;
  font-size: 13px;
  color: #a1a1aa;
  font-weight: 500;
}

/* ===================== 하단 버튼 ===================== */
.terms-footer-bar {
  padding: 12px 20px;
  border-top: 1px solid #f4f4f5;
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
}

.confirm-btn {
  padding: 10px 24px;
  background-color: #18181b;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.15s;
}

.confirm-btn:hover {
  opacity: 0.9;
}

/* ===================== 스크롤바 커스텀 ===================== */
.terms-body::-webkit-scrollbar {
  width: 6px;
}

.terms-body::-webkit-scrollbar-track {
  background: transparent;
}

.terms-body::-webkit-scrollbar-thumb {
  background: #d4d4d8;
  border-radius: 3px;
}

.terms-body::-webkit-scrollbar-thumb:hover {
  background: #a1a1aa;
}

/* ===================== 트랜지션 ===================== */
.terms-modal-enter-active {
  transition: opacity 0.2s ease;
}

.terms-modal-enter-active .terms-container {
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease;
}

.terms-modal-leave-active {
  transition: opacity 0.15s ease;
}

.terms-modal-leave-active .terms-container {
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.terms-modal-enter-from {
  opacity: 0;
}

.terms-modal-enter-from .terms-container {
  opacity: 0;
  transform: scale(0.95) translateY(8px);
}

.terms-modal-leave-to {
  opacity: 0;
}

.terms-modal-leave-to .terms-container {
  opacity: 0;
  transform: scale(0.97);
}

/* ===================== 모바일 ===================== */
@media (max-width: 480px) {
  .terms-container {
    max-height: 90vh;
    border-radius: 12px;
  }

  .terms-body {
    padding: 16px;
  }

  .tab-btn {
    padding: 10px 12px;
    font-size: 13px;
  }
}
</style>
