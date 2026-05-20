const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const addBusinessDays = (date, days) => {
  let result = new Date(date);
  let added = 0;
  while (added < days) {
    result = addDays(result, 1);
    const day = result.getDay();
    if (day !== 0 && day !== 6) added += 1;
  }
  return result;
};

const formatDate = (date) => {
  if (!date) return null;
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const isCashOnDelivery = (paymentMethod = '') => {
  const m = paymentMethod.toLowerCase();
  return m.includes('cash on delivery') || m.includes('cod');
};

const isExpressShipping = (paymentMethod = '') => {
  return paymentMethod.toLowerCase().includes('express');
};

/**
 * Builds a customer-facing tracking summary from order document fields.
 */
const buildOrderTrackingSummary = (order) => {
  const placedAt = new Date(order.createdAt);
  const express = isExpressShipping(order.paymentMethod);
  const cod = isCashOnDelivery(order.paymentMethod);

  const processingDays = 1;
  const shipAfterDays = express ? 1 : 2;
  const deliverAfterDays = express ? 3 : 6;

  const estimatedProcessingDate = addBusinessDays(placedAt, processingDays);
  const estimatedShipDate = addBusinessDays(placedAt, processingDays + shipAfterDays);
  const estimatedDeliveryDate = addBusinessDays(placedAt, deliverAfterDays);

  let currentStage = 'processing';
  let currentLabel = 'Being prepared for shipment';
  let currentDetail = 'Your order is at our fulfillment centre and will ship soon.';

  if (order.isDelivered) {
    currentStage = 'delivered';
    currentLabel = 'Delivered';
    currentDetail = order.deliveredAt
      ? `Delivered on ${formatDate(order.deliveredAt)}.`
      : 'Your order has been delivered.';
  } else if (order.isPaid) {
    const now = new Date();
    if (now >= estimatedShipDate) {
      currentStage = 'in_transit';
      currentLabel = 'On the way to you';
      currentDetail = `Estimated delivery by ${formatDate(estimatedDeliveryDate)}.`;
    } else {
      currentStage = 'shipped_soon';
      currentLabel = 'Ready to ship';
      currentDetail = `Expected to leave our warehouse by ${formatDate(estimatedShipDate)}.`;
    }
  } else if (cod) {
    currentStage = 'processing';
    currentLabel = 'Confirmed — Cash on Delivery';
    currentDetail = `We are preparing your order. Expected ship date: ${formatDate(estimatedShipDate)}.`;
  } else {
    currentStage = 'awaiting_payment';
    currentLabel = 'Awaiting payment confirmation';
    currentDetail = 'Your order is reserved. Payment confirmation is required before shipping.';
  }

  let activeStep = 'processing';
  if (order.isDelivered) {
    activeStep = 'delivered';
  } else if (currentStage === 'in_transit') {
    activeStep = 'shipped';
  } else if (currentStage === 'awaiting_payment') {
    activeStep = 'confirmed';
  }

  const stepsMeta = [
    { key: 'confirmed', label: 'Order confirmed', description: 'We received your order.' },
    { key: 'processing', label: 'Processing', description: 'Quality check and secure packaging.' },
    { key: 'shipped', label: 'Shipment', description: 'Handed to our courier partner.' },
    { key: 'delivered', label: 'Delivered', description: 'Delivered to your shipping address.' },
  ];

  const stepOrder = stepsMeta.map((s) => s.key);
  const activeIdx = stepOrder.indexOf(activeStep);

  const timeline = stepsMeta.map((step, idx) => {
    let state = 'upcoming';
    if (idx < activeIdx) state = 'complete';
    else if (idx === activeIdx) state = 'current';

    let date = null;
    let estimatedDate = null;
    if (step.key === 'confirmed') {
      date = formatDate(placedAt);
      estimatedDate = formatDate(placedAt);
    } else if (step.key === 'processing') {
      estimatedDate = formatDate(estimatedProcessingDate);
      if (state === 'complete') date = formatDate(estimatedProcessingDate);
    } else if (step.key === 'shipped') {
      estimatedDate = formatDate(estimatedShipDate);
      if (state === 'complete') date = formatDate(estimatedShipDate);
    } else if (step.key === 'delivered') {
      estimatedDate = formatDate(estimatedDeliveryDate);
      if (order.isDelivered && order.deliveredAt) date = formatDate(order.deliveredAt);
      else if (state === 'complete') date = formatDate(estimatedDeliveryDate);
    }

    return { ...step, state, date, estimatedDate };
  });

  return {
    currentStage,
    currentLabel,
    currentDetail,
    estimatedShipDate: formatDate(estimatedShipDate),
    estimatedDeliveryDate: formatDate(estimatedDeliveryDate),
    estimatedDeliveryWindow: express
      ? formatDate(estimatedDeliveryDate)
      : `${formatDate(addBusinessDays(placedAt, deliverAfterDays - 1))} – ${formatDate(estimatedDeliveryDate)}`,
    placedAt: formatDate(placedAt),
    shippingMethod: express ? 'Express delivery' : 'Standard delivery',
    timeline,
  };
};

module.exports = { buildOrderTrackingSummary };
