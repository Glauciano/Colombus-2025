import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from './db';

// React hook that wraps db.list() with auto-refresh
// Usage: const { data, isLoading, error, refresh, create, update, remove } = useCollection('provas');
export function useCollection(collection) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const collectionRef = useRef(collection);
  collectionRef.current = collection;

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await db.list(collectionRef.current);
      setData(result);
    } catch (err) {
      console.error(`Error loading ${collectionRef.current}:`, err);
      setError(err?.message || String(err));
      setData([]);
    }
    setIsLoading(false);
  }, []); // stable — uses ref for collection name

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = async (item) => {
    const result = await db.create(collectionRef.current, item);
    await refresh();
    return result;
  };

  const update = async (id, item) => {
    const result = await db.update(collectionRef.current, id, item);
    await refresh();
    return result;
  };

  const remove = async (id) => {
    await db.delete(collectionRef.current, id);
    await refresh();
  };

  return { data, isLoading, error, refresh, create, update, remove };
}
