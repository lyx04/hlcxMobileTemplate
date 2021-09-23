<template>
  <div class="nodata">
    <img src="@/common/assets/image/nodata.png" alt="" />
    <p>暂无数据...</p>
  </div>
</template>

<script>
export default {};
</script>

<style lang="scss" scoped>
.nodata {
  margin-top: 2.49rem;
  img {
    width: 2.64rem;
    height: 2.27rem;
    display: block;
    margin: 0 auto;
  }
  p {
    text-align: center;
    margin-top: 0.9rem;
    font-size: 0.3rem;
    color: rgba(0, 0, 0, 0.5);
  }
}
</style>
