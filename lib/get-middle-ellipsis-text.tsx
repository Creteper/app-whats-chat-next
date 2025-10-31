/**
 * 获取中间省略的文本
 * @param {string} text - 原始文本
 * @param {number} maxWidth - 容器的最大宽度
 * @param {string} font - 字体样式 (e.g., '16px Arial')
 * @returns {string} 处理后的文本
 */
export function getMiddleEllipsisText(
  text: string,
  maxWidth: number,
  font: any
) {
  const ellipsis = "...";

  // 1. 准备我们的“测量工具”——Canvas
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) return "";
  // 2. 设置“游标卡尺”的量程。关键！必须使用真实的字体样式！
  ctx.font = font || "16px Arial";

  // 3. 先量一下全文，如果放得下，直接返回，别折腾了。
  if (ctx.measureText(text).width <= maxWidth) return text;

  // 4. 准备“左右开弓”的指针
  let left = 0,
    right = text.length - 1;
  let leftStr = "",
    rightStr = "";

  // 提前量好省略号的宽度，免得循环里重复计算
  const ellipsisWidth = ctx.measureText(ellipsis).width;

  // 5. 开始“向中心靠拢”的循环
  while (left < right) {
    // 左手“吃”一个字符
    leftStr += text[left];
    // 右手“吃”一个字符
    rightStr = text[right] + rightStr;

    // 拼接起来，看看有多宽
    const combined = leftStr + ellipsis + rightStr;

    // 6. 关键判断：如果超宽了！
    if (ctx.measureText(combined).width > maxWidth) {
      // 说明刚才“吃”多了，把最后那个字符“吐”出来
      leftStr = leftStr.slice(0, -1);
      rightStr = rightStr.slice(1);
      break; // 赶紧跳出循环，再吃就撑爆了！
    }

    // 如果没超宽，继续向中心移动
    left++;
    right--;
  }

  // 7. 返回最终成果
  return leftStr + ellipsis + rightStr;
}
