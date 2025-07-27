import React, { createContext, useContext, useState } from 'react';

const CountryContext = createContext({
  selectedCountry: 'FRA',
  setSelectedCountry: (country: string) => {},
});

export const CountryProvider = ({ children }) => {
  const [selectedCountry, setSelectedCountry] = useState('FRA');
  return (
    <CountryContext.Provider value={{ selectedCountry, setSelectedCountry }}>
      {children}
    </CountryContext.Provider>
  );
};

export const useCountryContext = () => useContext(CountryContext);