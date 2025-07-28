const eventBus = {
  events: {},
  on(event, callback) {
    this.events[event] = this.events[event] || [];
    this.events[event].push(callback);
  },
  off(event, callback) {
    this.events[event] = this.events[event]?.filter((cb) => cb !== callback);
  },
  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach((cb) => cb(data));
    }
  },
};

export default eventBus;
