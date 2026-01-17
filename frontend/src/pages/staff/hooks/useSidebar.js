import { useState, useEffect, useRef } from 'react';

export const useSidebar = (initialTab = "dashboard") => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  const sidebarRef = useRef(null);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(!isOpen);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        close();
      }
    };
    
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return {
    isOpen,
    activeTab,
    setActiveTab,
    open,
    close,
    toggle,
    ref: sidebarRef
  };
};