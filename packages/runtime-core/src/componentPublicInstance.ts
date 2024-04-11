export const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    const { setupState, props } = instance;
    
    if (key in setupState) {
      return setupState[key];
    } else if (key in props) {
      return props[key];
    }
    return void 0;
  },
  set({ _: instance }, key, value) {
    const { setupState, props } = instance;
    
    if (key in setupState) {
      setupState[key] = value;
    } else if (key in props) {
      props[key] = value;
    }

    return true;
  }
}