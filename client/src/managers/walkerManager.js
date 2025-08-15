export const getWalkers = async (cityId = null) => {
  const url = cityId ? `/api/walker?cityId=${cityId}` : "/api/walker";
  const res = await fetch(url);
  return res.json();
};

export const getWalker = async (id) => {
  const res = await fetch(`/api/walker/${id}`);
  return res.json();
};

export const getAvailableDogsForWalker = async (walkerId) => {
  const res = await fetch(`/api/walker/${walkerId}/available-dogs`);
  return res.json();
};

export const deleteWalker = async (id) => {
  const res = await fetch(`/api/walker/${id}`, {
    method: "DELETE",
  });
  
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }
};
