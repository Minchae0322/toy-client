<template>
  <div class="detail-container">
    <FoodOverviewCard
        :food="food"
        :isLiked="isLiked"
        @go-back="goBack"
        @toggle-like="toggleLike"
        @share-food="shareFood"
    />

    <SellerCard
        :seller="food.seller"
        @view-profile="viewSellerProfile"
    />

    <FoodDetailsCard
        :food="food"
        @get-category-name="getCategoryName"
    />

    <ReviewsCard
        :reviews="reviews"
        @write-review="writeReview"
    />

    <BottomActions
        v-if="food.selling"
        :food="food"
        @start-chat="startChat"
        @request-share="requestShare"
    />
  </div>
</template>

<script>
import FoodOverviewCard from '@/components/oneMouth/detail/FoodOverviewCard.vue';
import SellerCard from '@/components/oneMouth/detail/SellerCard.vue';
import FoodDetailsCard from '@/components/oneMouth/detail/FoodDetailsCard.vue';
import ReviewsCard from '@/components/oneMouth/detail/ReviewsCard.vue';
import BottomActions from '@/components/oneMouth/detail/BottomActions.vue';

export default {
  name: 'FoodDetailPage',
  components: {
    FoodOverviewCard,
    SellerCard,
    FoodDetailsCard,
    ReviewsCard,
    BottomActions
  },
  data() {
    return {
      isLiked: false,
      food: {
        id: 1,
        name: 'CU 신상 초코바',
        description: '진짜 맛있다는 소문의 그 초코바! 달콤한 초콜릿과 바삭한 쿠키가 만나 환상적인 조화를 이룹니다.',
        emoji: '🍫',
        rating: 4.8,
        reviewCount: 127,
        location: '강남구 역삼동',
        trending: true,
        selling: true,
        price: 1500,
        stock: 3,
        category: 'snacks',
        createdAt: '2024-12-10',
        expiryDate: '2024-12-25',
        condition: '새 상품',
        seller: {
          name: '음식러버123',
          rating: 4.9,
          reviewCount: 234
        }
      },
      reviews: [
        {
          id: 1,
          userName: '맛집탐험가',
          rating: 5,
          content: '정말 맛있어요! 초콜릿이 진짜 진하고 달달해서 기분이 좋아졌어요 ☺️',
          createdAt: '2024-12-08'
        },
        {
          id: 2,
          userName: '간식매니아',
          rating: 4,
          content: '가격도 저렴하고 맛도 좋네요. 다음에 또 사고싶어요!',
          createdAt: '2024-12-07'
        },
        {
          id: 3,
          userName: '초코홀릭',
          rating: 5,
          content: '초콜릿 좋아하는 사람이라면 꼭 먹어봐야 할 맛! 추천합니다 👍',
          createdAt: '2024-12-06'
        }
      ]
    };
  },
  methods: {
    goBack() {
      if (window.history.length > 1) {
        this.$router.back();
      } else {
        this.$router.push('/');
      }
    },
    toggleLike() {
      this.isLiked = !this.isLiked;
    },
    shareFood() {
      alert('음식 정보를 공유합니다!');
    },
    viewSellerProfile() {
      alert(`${this.food.seller.name}의 프로필을 확인합니다!`);
    },
    startChat() {
      alert(`${this.food.seller.name}과 채팅을 시작합니다!`);
    },
    requestShare() {
      alert(`${this.food.name} 한입 나눔을 요청했습니다!`);
    },
    writeReview() {
      alert('리뷰 작성 페이지로 이동합니다!');
    },
    getCategoryName(category) {
      const categories = {
        snacks: '🥟 간식',
        drinks: '🧋 음료',
        desserts: '🍰 디저트'
      };
      return categories[category] || '🍽️ 기타';
    }
  }
};
</script>

<style scoped>
.detail-container {
  max-width: 1400px;
  margin: 0 auto;
  background: #f5f7fa;
  min-height: 100vh;
  padding: 20px 20px 120px;
}

@media (max-width: 768px) {
  .detail-container {
    padding: 16px;
  }
}
</style>