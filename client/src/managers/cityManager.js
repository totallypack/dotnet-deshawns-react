export const getCities = async () => {
  const res = await fetch("/api/city");
  return res.json();
};

export const createCity = async (cityData) => {
  const res = await fetch("/api/city", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cityData),
  });
  
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }
  
  return res.json();
};
