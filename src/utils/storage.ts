export const setItem = (key: string, data: any) => {
  let item = typeof data === "object" ? JSON.stringify(data) : data;
  sessionStorage.setItem(key, item);
};

export const getItem = (key: string) => sessionStorage.getItem(key);

export const removeItem = (key: string) => sessionStorage.removeItem(key);

export const clearAll = () => sessionStorage.clear();
