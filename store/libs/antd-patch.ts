'use client';

import '@ant-design/v5-patch-for-react-19';
import { unstableSetRender } from 'antd';
import { createRoot } from 'react-dom/client';

if (typeof window !== 'undefined') {
  // Use a WeakMap to store root instances safely
  const rootsByContainer = new WeakMap<Element | DocumentFragment, ReturnType<typeof createRoot>>();

  unstableSetRender((node, container) => {
    let root;
    if (!rootsByContainer.has(container)) {
      root = createRoot(container);
      rootsByContainer.set(container, root);
    } else {
      root = rootsByContainer.get(container)!;
    }
    
    root.render(node);
    
    return async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
      root.unmount();
      rootsByContainer.delete(container);
    };
  });
} 