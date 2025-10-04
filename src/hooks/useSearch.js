import { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';

export function useSearch(initialQuery = '', options = {}) {
  const {
    minLength = 2,
    debounceMs = 300,
    autoSearch = true,
  } = options;

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!autoSearch) return;

    if (query.trim().length < minLength) {
      setResults([]);
      setError(null);
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      performSearch(query);
    }, debounceMs);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, autoSearch, minLength, debounceMs]);

  const performSearch = async (searchQuery, filters = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await api.get('/search', {
        q: searchQuery,
        ...filters,
      });
      setResults(data.results || []);
      return data;
    } catch (err) {
      setError(err.message || 'Search failed');
      setResults([]);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const search = (searchQuery, filters) => {
    setQuery(searchQuery);
    return performSearch(searchQuery, filters);
  };

  const clear = () => {
    setQuery('');
    setResults([]);
    setError(null);
  };

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    search,
    clear,
  };
}
