export const patchEvents = (el, key, value) => {
  const invokers = el._vei || (el._vei = {});     // 将事件挂在到元素上，实现缓存

  const existingInvoker = invokers[key];

  if(value && existingInvoker) {
    existingInvoker.value = value;
  } else {
    const eventName = key.slice(2).toLowerCase();
    
    if (value) {
      const invoker = invokers[key] = createInvoker(value);
      el.addEventListener(eventName, invoker);
    } else if (existingInvoker) {
      invokers[key] = null;
      el.removeEventListener(eventName, existingInvoker);
    }
  }
}

// 设计一个包装函数，简化事件的变更  -- 这个思路真的非常巧妙（get 😄）
function createInvoker(value) {
  const invoker = (e) => {
    invoker.value(e);
  }
  invoker.value = value;
  return invoker;
}