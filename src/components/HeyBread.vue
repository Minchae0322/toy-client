<template>
  <div id="main_wrap">
    <header>
      <div class="header_content">
        <div class="header_content__logo">
          <div class="logo">
            <h1>
              <a href="#"><img src="/heyBread/logo.png" alt="헤이브레드 로고 이미지" /></a>
            </h1>
          </div>
          <nav>
            <div class="gnb">
              <ul class="menu_bar">
                <li><a href="#">이달의 브랜드</a></li>
                <li><a href="#">브랜드 스토리</a></li>
                <li><a href="#">메뉴</a></li>
                <li><a href="#">이벤트</a></li>
                <li><a href="#">주문</a></li>
              </ul>
            </div>
          </nav>
        </div>

        <div class="header_content__search">
          <div class="search">
            <form @submit.prevent>
              <input type="text" placeholder="" />
              <button type="submit">
                <img src="/heyBread/img/icon/icon_search.png" alt="" />
              </button>
            </form>
          </div>
          <div class="login">
            <a href="#"><img src="/heyBread/img/icon/icon_login.png" alt="" /></a>
          </div>
        </div>
      </div>
    </header>

    <section>
      <div class="bg_video">
        <video class="bg_video__content" autoplay muted loop>
          <source src="/heyBread/bg-video.mp4" type="video/mp4" />
        </video>
      </div>
    </section>

    <section>
      <div class="main_content_txt">
        <p>
          <img src="/heyBread/logo_simbol.png" alt="" /><br />
          <span>“건강한 통밀빵, 웰빙 베이커리 카페”</span> <br />
          헤이브레드는 다양한 통밀빵, 저당 음료, 저당 디저트 등과 같이 과한 당분과 칼로리는 물론 모두 걱정 없어 부담 없이 즐길 수 있는<br />
          웰빙식 디저트 카페로 모처럼의 기분좋은 속편한 자유를 만끽시켜 드립니다.<br /><br />
          어서오세요 <img src="/heyBread/logo_watermark.png" alt="" />로
        </p>
      </div>
    </section>

    <div class="main_sec">
      <h3>헤이브레드 메뉴</h3>
      <div class="menu_sec">
        <div class="menu_box_1" v-for="item in menuItems" :key="item.name">
          <div class="menu_box_2">
            <a href="#"><img :src="item.img" :alt="item.alt" /></a>
          </div>
          <p>{{ item.name }}</p>
        </div>
      </div>
    </div>

    <footer></footer>
  </div>
</template>

<script setup>
const menuItems = [
  {
    name: "베이커리",
    img: "/heyBread/img/menu/menu_bakery.png",
    alt: "베이커리 이미지"
  },
  {
    name: "디저트",
    img: "/heyBread/img/menu/menu_desert.png",
    alt: "디저트 이미지"
  },
  {
    name: "음료",
    img: "/heyBread/img/menu/menu_beverage.png",
    alt: "음료 이미지"
  },
  {
    name: "스프레드",
    img: "/heyBread/img/menu/—Pngtree—strawberry jam and fresh strawberries_20933439.png",
    alt: "스프레드 이미지"
  },
  {
    name: "굿즈",
    img: "/heyBread/img/menu/menu_goods.png",
    alt: "굿즈 이미지"
  }
];
</script>

<style scoped>
/* 여기에 필요하면 heybread.css 추가 가능 */
@import "/heyBread/heybread.css";
</style>
