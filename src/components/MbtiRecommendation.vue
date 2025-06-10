<!-- MbtiRecommendation.vue -->
<template>
  <div class="mx-4 mt-4">
    <div class="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl p-4 text-white">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-bold text-lg">MBTI 맞춤 추천</h3>
          <p class="text-sm text-purple-100 mt-1">당신의 성향에 맞는 트렌드를 찾아보세요</p>
        </div>
        <div class="bg-white bg-opacity-20 rounded-lg px-3 py-2">
          <span class="text-sm font-semibold">ENFP</span>
        </div>
      </div>
      <button class="mt-3 bg-white text-purple-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-50">
        테스트 시작하기
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MbtiRecommendation'
}
</script>