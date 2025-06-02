<!-- src/components/SellForm.vue -->
<template>
  <div class="main_wrap">
    <div class="title">
      <h1>내 물건 팔기</h1>
    </div>

    <div class="user_pic">
      <input type="file" multiple id="file" accept="image/*" />
      <label for="file">
        <img src="/oneMouth/img/icon_camera.png" alt="사진 업로드 아이콘" />
      </label>
    </div>

    <div class="title_input">
      <p>제목</p>
      <input type="text" placeholder="게시물의 제목을 입력하세요." />
    </div>

    <div class="sub_input">
      <p>설명</p>
      <textarea placeholder="판매할 물건에 대한 설명을 구체적으로 작성해주세요." rows="5" cols="50"></textarea>
    </div>

    <div class="count_input">
      <label for="count">판매 수량</label>
      <p>판매할 물건의 수량을 입력해주세요.</p>
      <input type="number" id="count" min="1" max="100" value="1" />
      <label>개/입</label>
    </div>

    <div class="price_input">
      <label for="price">가격</label>
      <p>판매할 물건의 가격을 입력해주세요.</p>
      <input type="number" id="price" min="0" step="1000" placeholder="₩ 0" />
      <label>원</label>
    </div>

    <div class="area_input">
      <label for="area">거래 희망 지역</label>
      <p>거래를 희망하는 지역을 선택해주세요.</p>
      <select id="area">
        <option value="서울">서울</option>
        <option value="경기">경기</option>
        <option value="인천">인천</option>
        <option value="부산">부산</option>
        <option value="대구">대구</option>
        <option value="광주">광주</option>
        <option value="대전">대전</option>
        <option value="울산">울산</option>
      </select>
    </div>

    <div class="area_detail_input">
      <label for="area_detail">거래 희망 지역 세부</label>
      <p>거래를 희망하는 지역의 세부 위치를 입력해주세요.</p>
      <input type="text" id="area_detail" placeholder="예: 역삼역 1번출구 근처" />
    </div>

    <div class="save">
      <button type="submit" class="save_btn">임시저장</button>
      <button type="submit" class="submit_btn">등록하기</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SellForm'
}
</script>

<style>
@import "/oneMouth/mz.css";
</style>
