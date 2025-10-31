// Motion 动画配置和工具函数
export const motionConfig = {
  // 弹簧动画配置
  spring: {
    stiffness: 300,
    damping: 30,
    mass: 0.8,
  },
  
  // 微交互动画配置
  microInteraction: {
    stiffness: 400,
    damping: 17,
  },
  
  // 页面过渡配置
  pageTransition: {
    type: "spring",
    stiffness: 260,
    damping: 20,
  },
  
  // 淡入淡出配置
  fade: {
    duration: 0.3,
    ease: [0.4, 0, 0.2, 1] as const,
  },
  
  // 滑动配置
  slide: {
    duration: 0.4,
    ease: [0, 0, 0.2, 1] as const,
  },
};

// 动画变体配置
export const animationVariants = {
  // 悬浮 tabbar 进入动画
  floatingTabBarEnter: {
    initial: { y: -100, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -100, opacity: 0 },
  },
  
  // 左侧元素进入动画
  slideInLeft: {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
  },
  
  // 右侧元素进入动画
  slideInRight: {
    initial: { x: 20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
  },
  
  // 按钮悬停动画
  buttonHover: {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  },
  
  // 标题淡入动画
  titleFadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  },
};

// 动画延迟配置
export const animationDelays = {
  backButton: 0.1,
  title: 0.2,
  rightButtons: 0.3,
  titleText: 0.4,
};
