
<template>
  <a-popover
    :title="null"
    trigger="hover"
    overlayClassName="personnel-popover"
    :mouseEnterDelay="0.3"
  >
    <template #content>
      <div class="popover-content">
        <div class="popover-header">
          <div class="avatar">{{ name.charAt(0) }}</div>
          <div class="info">
            <div class="name">{{ name }} <span class="tag">{{ tag }}</span></div>
            <div class="role">高级前端工程师</div>
          </div>
        </div>
        <div class="popover-body">
          <div class="detail-item">
            <span class="label">部门:</span>
            <span class="value">原石工作室/运营部</span>
          </div>
          <div class="detail-item">
            <span class="label">入职时间:</span>
            <span class="value">2021-05-12</span>
          </div>
          <div class="detail-item">
            <span class="label">当前薪资:</span>
            <span class="value">35k</span>
          </div>
        </div>
      </div>
    </template>
    <span class="person-trigger" @click.stop>
      {{ name }}
    </span>
  </a-popover>
</template>

<script setup lang="ts">
defineProps<{
  name: string;
  tag?: string;
}>();
</script>

<style scoped>
.person-trigger {
  cursor: pointer;
  color: #1890ff;
  font-weight: 500;
  transition: color 0.3s;
}
.person-trigger:hover {
  text-decoration: underline;
}

.popover-content {
  width: 240px;
}

.popover-header {
  display: flex;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #1890ff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  margin-right: 12px;
}

.info {
  flex: 1;
}

.name {
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 4px;
}

.tag {
  font-size: 12px;
  background: #e6f7ff;
  color: #1890ff;
  padding: 1px 4px;
  border-radius: 2px;
  margin-left: 4px;
}

.role {
  font-size: 12px;
  color: #8c8c8c;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 12px;
}

.label {
  color: #8c8c8c;
}

.value {
  color: #262626;
  font-weight: 500;
}
</style>
