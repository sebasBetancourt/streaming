// src/hooks/useFetch.js
import { useState, useEffect } from "react";

/**
 * useFetch es un hook genérico para consumir cualquier endpoint.
 * @param {Function} apiFunc - La función que hace la petición (de tu carpeta apis/)
 * @param {Object} params - Parámetros opcionales para la función
 */
export const useFetch = (apiFunc, params = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true; 

    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await apiFunc(params);
        if (isMounted) setData(result);
      } catch (err) {
        if (isMounted) setError(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [apiFunc, JSON.stringify(params)]);

  return { data, loading, error };
};
