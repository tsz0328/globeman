<template>
  <div class="menu-wrapper">
    <el-menu :default-active="activePath" router class="menu" background-color="#ffffff" text-color="#303133"
      active-text-color="#1ab394">
      <el-menu-item index="/work/home">
        <el-icon>
          <HomeFilled />
        </el-icon>
        <span>首页</span>
      </el-menu-item>

      <el-menu-item index="/work/user">
        <el-icon>
          <User />
        </el-icon>
        <span>用户管理</span>
      </el-menu-item>

      <el-menu-item index="/work/customer">
        <el-icon>
          <UserFilled />
        </el-icon>
        <span>客户管理</span>
      </el-menu-item>

      <el-menu-item v-if="isAdmin" index="/work/company">
        <el-icon>
          <OfficeBuilding />
        </el-icon>
        <span>公司管理</span>
      </el-menu-item>

      <el-menu-item index="/work/project">
        <el-icon>
          <Document />
        </el-icon>
        <span>项目管理</span>
      </el-menu-item>

      <el-menu-item index="/work/order">
        <el-icon>
          <Document />
        </el-icon>
        <span>订单管理</span>
      </el-menu-item>

      <el-sub-menu index="repair">
        <template #title>
          <el-icon>
            <Tools />
          </el-icon>
          <span>维修</span>
        </template>
        <el-menu-item index="/work/repair-management">维修管理</el-menu-item>
        <el-menu-item index="/work/repair-accept">维修接单</el-menu-item>
      </el-sub-menu>

      <el-sub-menu index="warehouse">
        <template #title>
          <el-icon>
            <Box />
          </el-icon>
          <span>仓库管理</span>
        </template>
        <el-menu-item index="/work/outbound">出库管理</el-menu-item>
        <el-menu-item index="/work/inbound">入库管理</el-menu-item>
        <el-menu-item index="/work/inventory">库存管理</el-menu-item>
      </el-sub-menu>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Cookies from 'js-cookie'

const route = useRoute()
const activePath = computed(() => route.path)
const isAdmin = computed(() => (Cookies.get('role') || '').toLowerCase() === 'admin')
</script>

<style scoped>
.menu-wrapper {
  display: flex;
  flex-direction: column;
  padding: 30px 0px;
}

.menu {
  flex: 1;
  border-right: none;
}

:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  justify-content: center;
}

:deep(.el-menu-item.is-active) {
  background-color: rgba(26, 179, 148, 0.1);
}

:deep(.el-menu-item:not(.is-active):hover) {
  background-color: rgba(26, 179, 148, 0.06);
}

:deep(.el-sub-menu .el-sub-menu__title:hover) {
  background-color: rgba(26, 179, 148, 0.06);
}

:deep(.el-menu-item .el-icon),
:deep(.el-sub-menu__title .el-icon) {
  font-size: 18px;
}
</style>
