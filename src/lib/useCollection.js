import { useState, useEffect, useCallback } from 'react';
import { db, ENTITIES } from './db';

// React hook that wraps db.list() with auto-refresh
// Usage: const { data, isLoading, refresh } = useCollection(ENTITIES.PROVA);
export function useCollection(collection) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await db.list(collection);
      setData(result);
    } catch (err) {
      console.error(`Error loading ${collection}:`, err);
      setData([]);
    }
    setIsLoading(false);
  }, [collection]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = async (item) => {
    const result = await db.create(collection, item);
    await refresh();
    return result;
  };

  const update = async (id, item) => {
    const result = await db.update(collection, id, item);
    await refresh();
    return result;
  };

  const remove = async (id) => {
    await db.delete(collection, id);
    await refresh();
  };

  return { data, isLoading, refresh, create, update, remove };
}
