import { createContext, useContext, useState, useEffect } from 'react';
import { settingsService } from '../services/settingsService';

const StoreContext = createContext(null);

export const StoreProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    storeName: 'CareWell Pharmacy',
    storeTagline: 'Your Trusted Healthcare & Wellness Partner',
    primaryColor: '#10b981',
    currencySymbol: '₹',
    currency: 'INR',
    shippingCharge: 49,
    freeShippingThreshold: 599,
    contactEmail: 'support@carewell.com',
    contactPhone: '+91 98765 43210',
    contactAddress: '123 Health Avenue, MG Road, Bangalore - 560001, Karnataka, India'
  });
  const [navigation, setNavigation] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchStoreData = async () => {
    try {
      const [settingsRes, navRes] = await Promise.all([
        settingsService.getPublicSettings(),
        settingsService.getNavigation()
      ]);
      if (settingsRes.data?.data) {
        setSettings(prev => ({ ...prev, ...settingsRes.data.data }));
      }
      if (navRes.data?.data) {
        setNavigation(navRes.data.data);
      }
    } catch (e) {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreData();
  }, []);

  return (
    <StoreContext.Provider value={{ settings, navigation, loading, refreshStoreData: fetchStoreData }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);
