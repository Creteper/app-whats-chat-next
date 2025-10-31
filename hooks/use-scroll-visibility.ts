import { useEffect, useState } from "react";

/**
 * 监听元素是否滚动到不可见
 * @param threshold 阈值，默认 0（完全不可见）
 * @returns 是否滚动到不可见
 */
export function useScrollVisibility(threshold: number = 0) {
  const [isScrolledOut, setIsScrolledOut] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const headerHeight = 80; // 假设 header 高度为 80px
      
      // 当滚动距离超过 header 高度时，认为 header 不可见
      setIsScrolledOut(scrollTop > headerHeight - threshold);
    };

    // 初始检查
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [threshold]);

  return isScrolledOut;
}

/**
 * 监听特定元素的可见性
 * @param elementRef 要监听的元素引用
 * @param threshold 阈值，默认 0
 * @returns 元素是否可见
 */
export function useElementVisibility(elementRef: React.RefObject<HTMLElement>, threshold: number = 0) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: threshold,
        rootMargin: "0px 0px 0px 0px",
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [elementRef, threshold]);

  return isVisible;
}
