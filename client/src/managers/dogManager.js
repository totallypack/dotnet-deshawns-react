export const getDogs = async () => {
  const res = await fetch("/api/dog");
  return res.json();
};

export const getDog = async (id) => {
  const res = await fetch(`/api/dog/${id}`);
  return res.json();
};

export const createDog = async (dogData) => {
  const res = await fetch("/api/dog", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dogData),
  });
  
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }
  
  return res.json();
};

export const updateDog = async (id, dogData) => {
  const res = await fetch(`/api/dog/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dogData),
  });
  
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }
  
  return res.json();
};

export const deleteDog = async (id) => {
  const res = await fetch(`/api/dog/${id}`, {
    method: "DELETE",
  });
  
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }
};

export const assignWalker = async (dogId, walkerId) => {
  const res = await fetch(`/api/dog/${dogId}/walker`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ walkerId }),
  });
  
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }
  
  return res.json();
};

export const getAvailableWalkersForDog = async (dogId) => {
  const res = await fetch(`/api/dog/${dogId}/available-walkers`);
  return res.json();
};
