import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export function SearchBar({ placeholder = 'Search courses, instructors, topics...', autoFocus = false }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const performSearch = async (searchQuery) => {
    setIsLoading(true);
    try {
      const data = await api.get('/search', { q: searchQuery });
      setResults(data.results || []);
      setIsOpen(true);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleResultClick(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  const handleResultClick = (result) => {
    setQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);
    
    switch (result.type) {
      case 'course':
        navigate(`/course/${result.id}`);
        break;
      case 'instructor':
        navigate(`/instructor/${result.id}`);
        break;
      case 'page':
        navigate(result.path);
        break;
      default:
        navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const getResultIcon = (type) => {
    const icons = {
      course: '📚',
      instructor: '👨‍🏫',
      page: '📄',
      topic: '🏷️',
      certificate: '🎓',
    };
    return icons[type] || '🔍';
  };

  const highlightMatch = (text, query) => {
    if (!query) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <strong key={index} style={{ backgroundColor: '#fff3cd' }}>
          {part}
        </strong>
      ) : (
        part
      )
    );
  };

  return (
    <div ref={searchRef} style={{ position: 'relative', width: '100%', maxWidth: 600 }}>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          style={{
            width: '100%',
            padding: '10px 40px 10px 16px',
            fontSize: 14,
            border: '1px solid #ddd',
            borderRadius: 8,
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#007bff';
            query.trim().length >= 2 && setIsOpen(true);
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#ddd';
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            fontSize: 18,
          }}
        >
          {isLoading ? '⏳' : '🔍'}
        </div>
      </div>

      {isOpen && results.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: 8,
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            maxHeight: 400,
            overflowY: 'auto',
            zIndex: 1000,
          }}
        >
          {results.map((result, index) => (
            <div
              key={`${result.type}-${result.id}`}
              onClick={() => handleResultClick(result)}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                borderBottom: index < results.length - 1 ? '1px solid #eee' : 'none',
                backgroundColor: selectedIndex === index ? '#f0f8ff' : 'white',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f0f8ff';
                setSelectedIndex(index);
              }}
              onMouseLeave={(e) => {
                if (selectedIndex !== index) {
                  e.currentTarget.style.backgroundColor = 'white';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 20 }}>{getResultIcon(result.type)}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>
                    {highlightMatch(result.title, query)}
                  </div>
                  {result.description && (
                    <div style={{ fontSize: 12, color: '#6c757d' }}>
                      {result.description.length > 80
                        ? `${result.description.substring(0, 80)}...`
                        : result.description}
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
                    {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
                    {result.category && ` • ${result.category}`}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          <div
            onClick={() => {
              navigate(`/search?q=${encodeURIComponent(query)}`);
              setIsOpen(false);
            }}
            style={{
              padding: '12px 16px',
              textAlign: 'center',
              fontSize: 13,
              color: '#007bff',
              cursor: 'pointer',
              borderTop: '1px solid #eee',
              backgroundColor: 'white',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f8f9fa';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
            }}
          >
            View all results for "{query}"
          </div>
        </div>
      )}

      {isOpen && !isLoading && query.trim().length >= 2 && results.length === 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: 8,
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            padding: 24,
            textAlign: 'center',
            color: '#6c757d',
            zIndex: 1000,
          }}
        >
          No results found for "{query}"
        </div>
      )}
    </div>
  );
}
