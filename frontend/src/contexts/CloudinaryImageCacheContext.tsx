import React, { createContext, useContext, useRef } from 'react';

type CacheType = { [productId: number]: string[] };

const CloudinaryImageCacheContext = createContext<{
  getImages: (productId: number) => string[] | undefined;
  setImages: (productId: number, urls: string[]) => void;
}>({
  getImages: () => undefined,
  setImages: () => {},
});

export const CloudinaryImageCacheProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const cacheRef = useRef<CacheType>({});

  const getImages = (productId: number) => cacheRef.current[productId];
  const setImages = (productId: number, urls: string[]) => {
    cacheRef.current[productId] = urls;
  };

  return (
    <CloudinaryImageCacheContext.Provider value={{ getImages, setImages }}>
      {children}
    </CloudinaryImageCacheContext.Provider>
  );
};

export const useCloudinaryImageCache = () => useContext(CloudinaryImageCacheContext);