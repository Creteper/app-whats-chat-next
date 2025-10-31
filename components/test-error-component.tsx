import React from "react";

interface TestErrorComponentProps {
  shouldThrow?: boolean;
}

const TestErrorComponent: React.FC<TestErrorComponentProps> = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    // 故意抛出错误来测试 ErrorBoundary
    throw new Error("这是一个测试错误！");
  }

  return (
    <div className="p-4 bg-green-100 rounded-lg">
      <h2 className="text-lg font-semibold">正常组件</h2>
      <p>这个组件运行正常，没有错误。</p>
    </div>
  );
};

export default TestErrorComponent;