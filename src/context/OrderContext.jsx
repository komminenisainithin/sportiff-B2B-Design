import React, { createContext, useContext, useState } from 'react';
import { getUniqueParents, getParentDetails } from '../data/orders';

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  // State: { [parentName]: { [colourId]: { [sizeId]: quantity } } }
  const [orders, setOrders] = useState({});

  const updateQuantity = (parentName, colourId, sizeId, quantity) => {
    setOrders(prev => ({
      ...prev,
      [parentName]: {
        ...prev[parentName],
        [colourId]: {
          ...(prev[parentName]?.[colourId] || {}),
          [sizeId]: quantity
        }
      }
    }));
  };

  const getQuantity = (parentName, colourId, sizeId) => {
    return orders[parentName]?.[colourId]?.[sizeId] || 0;
  };

  const getColorTotal = (parentName, colourId) => {
    const colourData = orders[parentName]?.[colourId];
    if (!colourData) return 0;
    return Object.values(colourData).reduce((sum, qty) => sum + (parseInt(qty) || 0), 0);
  };

  const getParentTotal = (parentName) => {
    const parentData = orders[parentName];
    if (!parentData) return 0;
    let total = 0;
    Object.values(parentData).forEach(colourData => {
      Object.values(colourData).forEach(qty => {
        total += parseInt(qty) || 0;
      });
    });
    return total;
  };

  const getGrandTotal = () => {
    let total = 0;
    Object.keys(orders).forEach(parentName => {
      total += getParentTotal(parentName);
    });
    return total;
  };

  const getParentTotalPrice = (parentName) => {
    const parentDetails = getParentDetails(parentName);
    if (!parentDetails) return 0;
    const parentData = orders[parentName];
    if (!parentData) return 0;
    const variants = parentDetails.variants || [];
    const coloursInfo = parentDetails.colours_info || {};
    let totalPrice = 0;
    Object.entries(parentData).forEach(([colourId, colourData]) => {
      const colourInfo = coloursInfo[colourId];
      const sizeIds = colourInfo?.size_id || [];
      const variantIds = colourInfo?.variant_id || [];

      Object.entries(colourData).forEach(([sizeId, qty]) => {
        const sizeIdx = sizeIds.indexOf(Number(sizeId));
        const variantId = sizeIdx >= 0 ? variantIds[sizeIdx] : variantIds[0];
        const variant = variantId ? variants.find((v) => v.id === variantId) : null;
        const price = parseFloat(variant?.mrp_price ?? parentDetails.mrp_price) || 0;
        totalPrice += price * (parseInt(qty) || 0);
      });
    });
    return totalPrice;
  };

  const getGrandTotalPrice = () => {
    let totalPrice = 0;
    Object.keys(orders).forEach(parentName => {
      const parentDetails = getParentDetails(parentName);
      if (!parentDetails) return;

      const parentData = orders[parentName];
      const variants = parentDetails.variants || [];
      const coloursInfo = parentDetails.colours_info || {};

      Object.entries(parentData).forEach(([colourId, colourData]) => {
        const colourInfo = coloursInfo[colourId];
        const sizeIds = colourInfo?.size_id || [];
        const variantIds = colourInfo?.variant_id || [];

        Object.entries(colourData).forEach(([sizeId, qty]) => {
          const sizeIdx = sizeIds.indexOf(Number(sizeId));
          const variantId = sizeIdx >= 0 ? variantIds[sizeIdx] : variantIds[0];
          const variant = variantId ? variants.find((v) => v.id === variantId) : null;
          const price = parseFloat(variant?.mrp_price ?? parentDetails.mrp_price) || 0;
          totalPrice += price * (parseInt(qty) || 0);
        });
      });
    });
    return totalPrice;
  };

  const getVariantsCount = () => {
    let count = 0;
    Object.keys(orders).forEach(parentName => {
      const parentData = orders[parentName];
      Object.entries(parentData).forEach(([colourId, colourData]) => {
        Object.entries(colourData).forEach(([sizeId, qty]) => {
          if (parseInt(qty) > 0) {
            count++;
          }
        });
      });
    });
    return count;
  };

  const getParentsCount = () => {
    let count = 0;
    Object.keys(orders).forEach(parentName => {
      if (getParentTotal(parentName) > 0) {
        count++;
      }
    });
    return count;
  };

  const value = {
    orders,
    updateQuantity,
    getQuantity,
    getColorTotal,
    getParentTotal,
    getParentTotalPrice,
    getGrandTotal,
    getGrandTotalPrice,
    getVariantsCount,
    getParentsCount
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within OrderProvider');
  }
  return context;
};
