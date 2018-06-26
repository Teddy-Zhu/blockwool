<template>
  <div class="hello">

  </div>
</template>

<script>
  import cookie from '../utils/cookie'
  import {md5Hex} from '../utils/crypto'
  import store from '../vuex';


  export default {
    name: 'Login',
    data() {
      return {
        first: this.$route.params.first
      }
    },
    created() {
      console.log('sss')
    },
    mounted() {
      console.log('2222')
      if (this.first) {
        let that = this;
        this.$prompt('请输入密码', '提示', {
          showClose: false,
          closeOnClickModal: false,
          closeOnPressEscape: false,
          showCancelButton: false,
          inputPattern: /\S/,
          inputErrorMessage: "密码不能为空",
          confirmButtonText: '确定'
        }).then(({value}) => {
          let pwd = md5Hex(value);
          cookie.setCookie('pwd', pwd);
          store.dispatch('initNew', {password: pwd})
            .then(() => {
              that.$router.push('/task');
            })
        }).catch(() => {
          that.$message({
            type: 'error',
            message: '密码错误'
          });
        });
      }

    }
  }
</script>

<style scoped>

</style>
