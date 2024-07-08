# 公交线路辐射图

> 将任意地点周围指定半径内可乘坐的公交线路绘制在地图上，用于租房、买房、出游等场景。具体项目背景和使用效果可参考[少数派文章](https://sspai.com/post/59229)。

## 使用方法

**前往基于开源代码搭建的网站 [https://busline-map.vercel.app/busline](https://busline-map.vercel.app/busline)**，按照提示完成配置。

通过搜索/右键单击地图任意点查询。大量功能重构补齐中。

## 开发

### 本地运行

```bash
# 安装依赖
pnpm install # 或 npm install 或 yarn

# 启动开发服务器
pnpm dev # 或 npm run dev 或 yarn dev
```

### 部署

你可以基于 [Vercel](https://vercel.com/) 实现快速部署，仅需关联 fork 后的项目仓库即可。

## 为什么开源

项目自 2020 年上线来收到了很多朋友的鼓励和反馈，在此表达感谢。

非常遗憾，由于国内地图厂商逐步收紧了非商用授权的使用配额和条件，[原网站 https://bus.daibor.com](https://bus.daibor.com) 目前无法按照之前的方式为大家提供服务了。

## TODO

- [x] 提供免开发免部署版本
- [x] 代码开源（2024 年 5 月 1 日前）
- [ ] 修复仅北京能使用的问题
- [ ] 移动端适配
- [ ] 自动定位
